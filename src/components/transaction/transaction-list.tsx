"use client";

import { TransactionWithCategory } from "@/actions/transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionGroup } from "./transaction-group";
import { TransactionItem } from "./transaction-item";
import { FLAT_HEADER_H, GROUP_GAP, GROUP_HEADER_H, ROW_H, getGroupHeight } from "./transaction-metrics";
import { relativeDayLabel } from "@/lib/app-time";
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
  /**
   * Kiểu hiển thị:
   * - "card": mỗi ngày là một card riêng (mặc định, dùng ở trang Lịch sử).
   * - "flat": danh sách phẳng liền mạch — header ngày gọn + dòng giao dịch,
   *   không chia card (dùng ở dashboard).
   */
  variant?: "card" | "flat";
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
  isFullPage = false,
  variant = "card",
}: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [containerHeight, setContainerHeight] = useState(isFullPage ? 600 : 400);

  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  // Variant "flat": trải phẳng thành các dòng header/item để virtual hoá liền mạch
  type FlatRow =
    | { kind: "header"; key: string; label: string; count: number }
    | { kind: "item"; key: string; transaction: TransactionWithCategory };
  const flatRows: FlatRow[] = useMemo(() => {
    if (variant !== "flat") return [];
    return groupedTransactions.flatMap((g) => [
      {
        kind: "header" as const,
        key: `h-${g.date.getTime()}`,
        label: relativeDayLabel(g.date),
        count: g.transactions.length,
      },
      ...g.transactions.map((t) => ({
        kind: "item" as const,
        key: t.id,
        transaction: t,
      })),
    ]);
  }, [groupedTransactions, variant]);

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
  const getItemSize = (index: number) => {
    if (variant === "flat") {
      return flatRows[index].kind === "header" ? FLAT_HEADER_H : ROW_H;
    }
    return getGroupHeight(groupedTransactions[index].transactions.length);
  };

  // VariableSizeList cache offset theo index; đổi bộ lọc là nhóm khác đi nhưng
  // cache cũ vẫn được dùng → dòng chồng lấn hoặc chừa khoảng trống.
  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [groupedTransactions, flatRows, variant]);

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (variant === "flat") {
      const row = flatRows[index];
      if (row.kind === "header") {
        return (
          <div style={style} className="flex items-center gap-2.5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-muted-foreground">
              {row.label}
            </span>
            <span className="h-px flex-1 bg-border/70" />
            <span className="text-[11px] whitespace-nowrap text-muted-foreground/70">
              {row.count} khoản
            </span>
          </div>
        );
      }
      return (
        <div style={style}>
          <TransactionItem
            transaction={row.transaction}
            onEdit={onEdit}
            onView={onView}
            readOnly={readOnly}
          />
        </div>
      );
    }
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
        itemCount={variant === "flat" ? flatRows.length : groupedTransactions.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={6}
        className="nice-scroll"
      >
        {Row}
      </List>
    </div>
  );
}
