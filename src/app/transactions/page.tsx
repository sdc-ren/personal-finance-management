import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTransactions, getCategories } from "@/actions/transaction";
import { TransactionsClient } from "@/components/transaction/transactions-client";
import { getFamilyMembers } from "@/actions/family";
import { parseDateParam } from "@/lib/app-time";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default async function TransactionsPage({
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
  const fromParam = Array.isArray(resolvedSearchParams.from)
    ? resolvedSearchParams.from[0]
    : resolvedSearchParams.from;
  const toParam = Array.isArray(resolvedSearchParams.to)
    ? resolvedSearchParams.to[0]
    : resolvedSearchParams.to;
  const startDate = parseDateParam(fromParam);
  const endDate = parseDateParam(toParam);

  const [categories, transactions, familyMembers] = await Promise.all([
    getCategories(),
    getTransactions(1000, 0, { // Fetch many transactions (will use react-window)
      scope,
      categoryId,
      memberId,
      startDate,
      endDate
    }),
    getFamilyMembers()
  ]);

  return (
    <WorkspaceLayout
      withPanel={false}
      fullHeight
    >
      <TransactionsClient
        initialTransactions={transactions}
        categories={categories}
        familyMembers={familyMembers}
        initialScope={scope}
      />
    </WorkspaceLayout>
  );
}
