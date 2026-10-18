"use client";

import { useEffect, useState } from "react";
import { AddTransaction } from "@/components/transaction/add-transaction";
import { TransactionList } from "@/components/transaction/transaction-list";
import { prefetchQuickPresets } from "@/lib/quick-presets-cache";
import { Category } from "@prisma/client";
import { TransactionWithCategory } from "@/actions/transaction";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSameMonth } from "date-fns";
import { TransactionFilters } from "./transaction-filters";
import { TransactionDetailsModal } from "./transaction-details-modal";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { Button } from "@/components/ui/button";
import { FilterX, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { SectionCard } from "@/components/ui/finance";
import { Page, PageHeader, ToolbarRow } from "@/components/ui/page";

// Member interface based on common schema
interface Member {
  id: string;
  name: string | null;
  image: string | null;
}

interface TransactionsClientProps {
  initialTransactions: TransactionWithCategory[];
  categories: Category[];
  familyMembers: Member[];
  initialScope: "personal" | "family";
}

export function TransactionsClient({
  initialTransactions,
  categories,
  familyMembers,
  initialScope
}: TransactionsClientProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<TransactionWithCategory | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Prefetch preset từ lúc trang mount — mở dialog "Ghi giao dịch" là có item ngay
  useEffect(() => {
    prefetchQuickPresets();
  }, []);

  // Use URL filters hook
  const { updateFilters, updateDateRange, dateRange, isPending, searchParams } = useUrlFilters("/transactions");

  // Filters State
  const scope = searchParams.get("scope") || initialScope;
  const categoryId = searchParams.get("categoryId") || "all";
  const memberId = searchParams.get("memberId") || "all";

  const handleTabChange = (value: string) => {
    updateFilters({ scope: value, memberId: "all" });
  };

  const handleEdit = (transaction: TransactionWithCategory) => {
    if (scope === 'family') return;

    // If transaction is not in current month, only allow viewing
    if (!isSameMonth(new Date(transaction.date), new Date())) {
      handleView(transaction);
      return;
    }

    setEditingTransaction(transaction);
    setIsEditOpen(true);
    setIsViewOpen(false); // Close view if open
  };

  const handleView = (transaction: TransactionWithCategory) => {
    setViewingTransaction(transaction);
    setIsViewOpen(true);
  };

  const handleEditFromView = () => {
    if (viewingTransaction && scope !== 'family') {
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

  const clearFilters = () => {
    updateFilters({ categoryId: null, memberId: null, from: null, to: null });
  };

  return (
    <Page className="h-full">
      {/* Top Progress Bar */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-muted overflow-hidden">
          <div className="h-full bg-primary animate-progress-indeterminate w-full origin-left" />
        </div>
      )}

      <PageHeader
        title="Lịch sử giao dịch"
        description="Xem lại mọi khoản thu chi của bạn theo từng ngày."
      />

      {/* Scope Tabs & Filters */}
      {familyMembers.length > 0 && (
        <ToolbarRow>
          <Tabs value={scope} onValueChange={handleTabChange} className="w-full sm:w-auto">
            <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2 sm:w-[400px]")}>
              <TabsTrigger value="personal" className={TAB_TRIGGER}>Giao dịch cá nhân</TabsTrigger>
              <TabsTrigger value="family" className={TAB_TRIGGER}>Giao dịch gia đình</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 w-full sm:h-9 sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </ToolbarRow>
      )}

      <SectionCard className="p-3 sm:p-4">
        <TransactionFilters
          categoryId={categoryId}
          memberId={memberId}
          dateRange={dateRange || {}}
          categories={categories}
          familyMembers={familyMembers}
          scope={scope as "personal" | "family"}
          showFilters={showFilters}
          hideTrigger={familyMembers.length > 0}
          onCategoryChange={(v) => updateFilters({ categoryId: v })}
          onMemberChange={(v) => updateFilters({ memberId: v })}
          onDateRangeChange={updateDateRange}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Keep Clear Filters button separate */}
        {(categoryId !== "all" || memberId !== "all" || dateRange) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto mt-3">
            <FilterX className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </SectionCard>

      {/* Transaction List - Scrollable area */}
      <div className={cn("flex-1 min-h-0 overflow-y-auto", isPending && "opacity-50 transition-opacity")}>
        <TransactionList
          transactions={initialTransactions}
          onEdit={handleEdit}
          onView={handleView}
          readOnly={scope === "family"}
          isLoading={isPending}
          isFullPage={true}
          variant="flat"
        />
      </div>

      <AddTransaction
        categories={categories}
        initialData={editingTransaction}
        open={isEditOpen}
        onOpenChange={onOpenChange}
      />

      {/* View Modal */}
      <TransactionDetailsModal
        transaction={viewingTransaction}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        onEdit={handleEditFromView}
        readOnly={scope === 'family' || (viewingTransaction ? !isSameMonth(new Date(viewingTransaction.date), new Date()) : false)}
      />
    </Page>
  );
}
