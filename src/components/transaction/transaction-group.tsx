"use client";

import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import { TransactionWithCategory } from "@/actions/transaction";
import { TransactionItem } from "./transaction-item";
import { GROUP_HEADER_H } from "./transaction-metrics";

function formatDateHeader(date: Date): string {
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  return format(date, "EEEE, dd 'tháng' MM, yyyy", { locale: vi });
}

interface TransactionGroupProps {
  date: Date;
  transactions: TransactionWithCategory[];
  onEdit: (transaction: TransactionWithCategory) => void;
  onView?: (transaction: TransactionWithCategory) => void;
  readOnly?: boolean;
}

/**
 * Một ngày là một card của sổ: khung rounded-xl, header ngày kiểu "Sạch & tài
 * chính", các dòng không còn đường kẻ hairline.
 *
 * Không sticky — mỗi nhóm là một box `position:absolute` của react-window nên
 * sticky không có tác dụng ở đây. Chiều cao vẫn giữ hợp đồng
 * GROUP_HEADER_H + PANEL_BORDER_Y + n*ROW_H.
 */
export function TransactionGroup({ date, transactions, onEdit, onView, readOnly = false }: TransactionGroupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        style={{ height: GROUP_HEADER_H }}
        className="flex items-center justify-between px-3 sm:px-4"
      >
        <span className="text-sm font-semibold text-foreground">
          {formatDateHeader(date)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {transactions.length} khoản
        </span>
      </div>

      <div>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onView={onView}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
