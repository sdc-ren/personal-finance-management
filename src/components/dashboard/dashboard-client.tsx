"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AddTransaction } from "@/components/transaction/add-transaction";
import { QuickAddPanel } from "@/components/transaction/quick-add-panel";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CountUpAnimation } from "@/components/ui/count-up-animation";
import { TransactionDetailsModal } from "@/components/transaction/transaction-details-modal";
import { StatCard, SectionCard } from "@/components/ui/finance";
import { formatCurrency } from "@/lib/format-currency";
import { Page, KpiRow, ContentGrid } from "@/components/ui/page";

// Match TransactionList requirements
import { TransactionWithCategory } from "@/actions/transaction";
import { isSameMonth, format } from "date-fns";
import { TransactionList } from "@/components/transaction/transaction-list";
import { prefetchQuickPresets } from "@/lib/quick-presets-cache";
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

  // Prefetch preset từ lúc trang mount — mở dialog "Ghi giao dịch" là có item ngay
  useEffect(() => {
    prefetchQuickPresets();
  }, []);

  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  const handleEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsEditOpen(true);
  };

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

  const todayLabel = format(new Date(), "EEEE, d 'tháng' M", { locale: vi });

  // Lọc loại giao dịch cho "Giao dịch gần đây" (client-side, dữ liệu đã có sẵn)
  const visibleTransactions =
    typeFilter === "ALL"
      ? transactions
      : transactions.filter((t) => t.type === typeFilter);

  return (
    <>
      <Page className="h-full min-h-0">
        {/* Chỉ còn ngày tháng nhỏ — tiêu đề trang đã chuyển lên header */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{todayLabel}</p>
          <Button
            type="button"
            onClick={scrollToQuickAdd}
            className="hidden bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 lg:inline-flex"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Ghi nhanh
          </Button>
        </div>

        <ContentGrid
          layout="fluid-326"
          sideSticky
          sideClassName="hidden lg:flex"
          className="flex min-h-0 flex-1 flex-col lg:grid"
          mainClassName="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:gap-5"
          main={
            <>
              {/* Hàng KPI: 2 thẻ Thu nhập / Đã chi */}
              <KpiRow className="grid-cols-2 sm:grid-cols-2">
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
              </KpiRow>

              {/* Giao dịch gần đây — mobile: lấp đầy màn hình trên thanh menu,
                  không cuộn trang (list cuộn nội bộ); desktop giữ chiều cao cũ. */}
              <SectionCard
                title="Giao dịch gần đây"
                action={
                  <Button variant="link" asChild className="px-0">
                    <Link href="/transactions">Xem tất cả</Link>
                  </Button>
                }
                className="flex min-h-0 flex-1 flex-col"
                contentClassName="flex min-h-0 flex-1 flex-col gap-3"
              >
                {/* Lọc theo loại giao dịch */}
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Lọc loại giao dịch">
                  {(
                    [
                      { value: "ALL", label: "Tất cả" },
                      { value: "EXPENSE", label: "Tiền ra" },
                      { value: "INCOME", label: "Tiền vào" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTypeFilter(opt.value)}
                      aria-pressed={typeFilter === opt.value}
                      className={
                        typeFilter === opt.value
                          ? "rounded-lg bg-white py-1.5 text-xs font-medium text-emerald-700 shadow-sm"
                          : "rounded-lg py-1.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1 lg:h-[calc(100dvh-360px)] lg:min-h-[320px] lg:flex-none">
                  <TransactionList
                    transactions={visibleTransactions}
                    onEdit={handleEdit}
                    onView={handleView}
                    isFullPage
                    variant="flat"
                  />
                </div>
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
