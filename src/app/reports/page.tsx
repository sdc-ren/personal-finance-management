import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getSixMonthTrend,
  getMonthlySummary,
  getCategoryStats,
  getDailyStats,
  getYearlyComparison,
} from "@/actions/analytics";
import { getFamilyMembers } from "@/actions/family";
import { ReportFilters } from "@/components/reports/report-filters";
import { RecentTrendChart } from "@/components/charts/recent-trend";
import { DailyCashflowChart } from "@/components/charts/daily-cashflow";
import { YearlyComparisonChart } from "@/components/charts/yearly-comparison";
import { SpendingAnalysis } from "@/components/reports/spending-analysis";
import { getAppDateParts, getAppMonthRange, parseDateParam } from "@/lib/app-time";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { Page, PageHeader, ContentGrid } from "@/components/ui/page";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  const scope = (resolvedSearchParams.scope as "personal" | "family") || "personal";
  const fromParam = Array.isArray(resolvedSearchParams.from)
    ? resolvedSearchParams.from[0]
    : resolvedSearchParams.from;
  const toParam = Array.isArray(resolvedSearchParams.to)
    ? resolvedSearchParams.to[0]
    : resolvedSearchParams.to;

  const currentMonthRange = getAppMonthRange();
  const startDate = parseDateParam(fromParam) || currentMonthRange.start;
  const endDate = parseDateParam(toParam) || currentMonthRange.end;

  // Fetch all necessary data in parallel
  const [monthlySummary, categoryStats, familyMembers, sixMonthTrend, dailyStats, yearlyComparison] =
    await Promise.all([
      getMonthlySummary(startDate, endDate, scope),
      getCategoryStats(startDate, endDate, scope),
      getFamilyMembers(),
      getSixMonthTrend(scope),
      getDailyStats(startDate, endDate, scope),
      getYearlyComparison(scope),
    ]);

  const currentYear = getAppDateParts(new Date()).year;

  const hasFamily = familyMembers.length > 0;

  return (
    <WorkspaceLayout
      withPanel={false}
    >
      <Page>
        <PageHeader
          title="Báo cáo"
          description="Phân tích thu chi theo thời gian và danh mục."
        />

        <ReportFilters
          initialScope={scope}
          hasFamily={hasFamily}
          initialFrom={startDate}
        />

        <ContentGrid
          main={
            <SpendingAnalysis
              summary={monthlySummary}
              categories={categoryStats}
            />
          }
        />

        <ContentGrid
          main={<DailyCashflowChart data={dailyStats || []} />}
        />

        <ContentGrid
          layout="6-6"
          main={<RecentTrendChart data={sixMonthTrend || []} />}
          side={<YearlyComparisonChart data={yearlyComparison || []} currentYear={currentYear} />}
        />
      </Page>
    </WorkspaceLayout>
  );
}
