"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AddTransaction } from "@/components/transaction/add-transaction";
import { QuickAddPanel } from "@/components/transaction/quick-add-panel";
import { TransactionItem } from "@/components/transaction/transaction-item";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CountUpAnimation } from "@/components/ui/count-up-animation";
import { TransactionDetailsModal } from "@/components/transaction/transaction-details-modal";
import { StatCard, SectionCard } from "@/components/ui/finance";
import { formatCurrency } from "@/lib/format-currency";
import { Page, PageHeader, KpiRow, ContentGrid } from "@/components/ui/page";

// Match TransactionList requirements
import { TransactionWithCategory } from "@/actions/transaction";
import { isSameMonth, format } from "date-fns";
import { groupByDay } from "@/lib/app-time";
import { vi } from "date-fns/locale";

export interface BudgetProgress {
  amount: number;
  spent: number;
}

interface DashboardClientProps {
  categories: Category[];
  transactions: TransactionWithCategory[];
  stats: {
    income: number;
    expense: number;
    previousIncome?: number;
    previousExpense?: number;
  };
  familyMembers?: { id: string; name: string | null; image: string | null }[];
  budgetProgress?: BudgetProgress[];
}

/**
 * Màn Tổng quan:
 * - Desktop: lưới `minmax(0,1fr) 326px`. Cột trái: KPI → Giao dịch gần đây
 *   (trọng tâm). Cột phải: panel Ghi nhanh sticky.
 * - Mobile: một cột KPI → Giao dịch gần đây (hết).
 *   Không render panel Ghi nhanh inline — mobile dùng FAB mở bottom Sheet.
 */
export function DashboardClient({ categories, transactions, stats }: DashboardClientProps) {
  const router = useRouter();
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<TransactionWithCategory | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [, startRefreshTransition] = useTransition();

  const handleView = (transaction: TransactionWithCategory) => {
    setViewingTransaction(transaction);
    setIsViewOpen(true);
  };

  const handleTransactionAdded = () => {
    startRefreshTransition(() => {
      router.refresh();
    });
  };

  const handleEditFromView = () => {
    if (viewingTransaction) {
      setEditingTransaction(viewingTransaction);
      setIsViewOpen(false);
      setIsEditOpen(true);
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setTimeout(() => setEditingTransaction(null), 300);
    }
  };

  const scrollToQuickAdd = () => {
    document
      .getElementById("quick-add-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calculate percentage change for expense
  const prevExpense = stats.previousExpense || 0;
  // If previous is 0, and current is > 0, it's 100% increase (technically infinite, but 100% fits UI).
  // If both 0, it's 0%.
  const expensePercent = prevExpense === 0
    ? (stats.expense > 0 ? 100 : 0)
    : Math.round(((stats.expense - prevExpense) / prevExpense) * 100);

  const isIncrease = expensePercent > 0;
  const isDecrease = expensePercent < 0;

  const groupedRecent = useMemo(
    () => groupByDay(transactions.slice(0, 5)),
    [transactions]
  );
  const todayLabel = format(new Date(), "EEEE, d 'tháng' M", { locale: vi });

  return (
    <>
      <Page>
        <PageHeader
          title="Tổng quan tài chính"
          description={todayLabel}
          action={
            <Button
              type="button"
              onClick={scrollToQuickAdd}
              className="hidden bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 lg:inline-flex"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Ghi nhanh
            </Button>
          }
        />

        <ContentGrid
          layout="fluid-326"
          sideSticky
          sideClassName="hidden lg:flex"
          mainClassName="flex min-w-0 flex-col gap-4 lg:gap-5"
          main={
            <>
              {/* Hàng KPI: mobile 2 cột, thẻ thứ 3 full-width */}
              <KpiRow twoColOnMobile>
                <StatCard
                  label="Thu nhập"
                  tone="var(--pf-ok-ink)"
                  value={<CountUpAnimation end={stats.income} formatNumber={formatCurrency} />}
                />
                <StatCard
                  label="Đã chi"
                  tone="var(--pf-expense-ink)"
                  value={<CountUpAnimation end={stats.expense} formatNumber={formatCurrency} />}
                  sub={
                    <span className={isIncrease ? "text-(--pf-over-ink)" : isDecrease ? "text-(--pf-ok-ink)" : undefined}>
                      {expensePercent > 0 ? "+" : ""}{expensePercent}% so với tháng trước
                    </span>
                  }
                />
                <StatCard
                  label="Còn lại"
                  value={formatCurrency(stats.income - stats.expense)}
                  className="col-span-2 sm:col-span-1"
                />
              </KpiRow>

              {/* Giao dịch gần đây — trọng tâm của trang */}
              <SectionCard
                title="Giao dịch gần đây"
                action={
                  <Button variant="link" asChild className="px-0">
                    <Link href="/transactions">Xem tất cả</Link>
                  </Button>
                }
              >
                {groupedRecent.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Chưa có giao dịch nào trong tháng.
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {groupedRecent.map((group) => (
                      <div key={group.key}>
                        <p className="sticky top-0 bg-card px-1 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:pt-1">
                          {group.label}
                        </p>
                        {group.items.map((t) => (
                          <TransactionItem key={t.id} transaction={t} onView={handleView} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          }
          side={
            <QuickAddPanel
              categories={categories}
              onTransactionAdded={handleTransactionAdded}
            />
          }
        />
      </Page>

      {/* Edit Dialog */}
      <AddTransaction
        categories={categories}
        initialData={editingTransaction}
        open={isEditOpen}
        onOpenChange={onOpenChange}
        onTransactionAdded={handleTransactionAdded}
      />

      {/* View Modal */}
      <TransactionDetailsModal
        transaction={viewingTransaction}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        onEdit={handleEditFromView}
        readOnly={viewingTransaction ? !isSameMonth(new Date(viewingTransaction.date), new Date()) : false}
      />
    </>
  );
}
