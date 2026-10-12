import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories, getTransactions, getMonthlyStats } from "@/actions/transaction";
import { getBudgetProgress } from "@/actions/budget";
import { getFamilyMembers } from "@/actions/family";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getAppMonthRange } from "@/lib/app-time";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default async function DashboardPage({
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
  const categoryId = resolvedSearchParams.categoryId as string;
  const memberId = resolvedSearchParams.memberId as string;

  const { start: startDate, end: endDate } = getAppMonthRange();

  // Ignore searchParams.from/to for dashboard to enforce current month view

  const [categories, transactions, stats, familyMembers, budgetProgress] = await Promise.all([
    getCategories(),
    getTransactions(undefined, 0, { scope, categoryId, memberId, startDate, endDate }),
    getMonthlyStats(),
    getFamilyMembers(),
    getBudgetProgress(),
  ]);

  return (
    <WorkspaceLayout
      withPanel={false}
      fullHeight
    >
      <DashboardClient
        categories={categories}
        transactions={transactions}
        stats={stats}
        familyMembers={familyMembers}
        budgetProgress={budgetProgress}
      />
    </WorkspaceLayout>
  );
}
