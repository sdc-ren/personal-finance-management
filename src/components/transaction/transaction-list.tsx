"use client";

import { TransactionWithCategory } from "@/actions/transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionGroup } from "./transaction-group";
import { GROUP_GAP, GROUP_HEADER_H, ROW_H, getGroupHeight } from "./transaction-metrics";
import { RingMark } from "@/components/brand/ring-mark";
import { useRef, useMemo, useEffect, useState } from "react";
import { isSameDay } from "date-fns";
import { VariableSizeList as List } from 'react-window';

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  onEdit: (transaction: TransactionWithCategory) => void;
  onView?: (transaction: TransactionWithCategory) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  isFullPage?: boolean;
}

// Helper to group transactions by date
function groupTransactionsByDate(transactions: TransactionWithCategory[]) {
  const groups: { date: Date; transactions: TransactionWithCategory[] }[] = [];

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const existingGroup = groups.find((g) => isSameDay(g.date, transactionDate));

    if (existingGroup) {
      existingGroup.transactions.push(transaction);
    } else {
      groups.push({ date: transactionDate, transactions: [transaction] });
    }
  });

  return groups;
}

export function TransactionList({
  transactions,
  onEdit,
  onView,
  readOnly = false,
  isLoading = false,
  isFullPage = false
}: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [containerHeight, setContainerHeight] = useState(isFullPage ? 600 : 400);

  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  // Calculate container height
  useEffect(() => {
    if (!isFullPage) {
      return;
    }

    // Full page mode: calculate from parent
    if (parentRef.current) {
      const updateHeight = () => {
        if (parentRef.current) {
          const height = parentRef.current.clientHeight;
          setContainerHeight(height > 0 ? height : 600);
        }
      };

      updateHeight();
      // Small delay to ensure parent is rendered
      const timer = setTimeout(updateHeight, 100);

      window.addEventListener('resize', updateHeight);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [isFullPage]);

  // Chiều cao lấy từ hợp đồng chung với component, không ước lượng
  const getItemSize = (index: number) =>
    getGroupHeight(groupedTransactions[index].transactions.length);

  // VariableSizeList cache offset theo index; đổi bộ lọc là nhóm khác đi nhưng
  // cache cũ vẫn được dùng → dòng chồng lấn hoặc chừa khoảng trống.
  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [groupedTransactions]);

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const group = groupedTransactions[index];
    return (
      <div style={{ ...style, paddingBottom: GROUP_GAP }}>
        <TransactionGroup
          date={group.date}
          transactions={group.transactions}
          onEdit={onEdit}
          onView={onView}
          readOnly={readOnly}
        />
      </div>
    );
  };

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <RingMark className="h-7 w-7 opacity-60" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Chưa có giao dịch nào
          </h3>
          <p className="mx-auto max-w-[280px] text-sm text-muted-foreground">
            Bắt đầu ghi lại chi tiêu và thu nhập của bạn để quản lý tài chính tốt hơn.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div
          style={{ height: GROUP_HEADER_H }}
          className="flex items-center px-3 sm:px-4"
        >
          <Skeleton className="h-3 w-24" />
        </div>
        <div>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{ height: ROW_H }}
              className="flex items-center gap-3 px-3 sm:px-4"
            >
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
              <Skeleton className="h-3 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="w-full h-full">
      <List
        ref={listRef}
        height={isFullPage ? containerHeight : 400}
        itemCount={groupedTransactions.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={2}
      >
        {Row}
      </List>
    </div>
  );
}
