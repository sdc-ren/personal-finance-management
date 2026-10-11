"use client";

import {
  Car,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { TransactionWithCategory } from "@/actions/transaction";
import { formatSignedCurrency } from "@/lib/format-currency";
import { ROW_H } from "./transaction-metrics";
import { cn } from "@/lib/utils";

/** Map tên danh mục mặc định -> icon lucide; danh mục tự tạo dùng Tag. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Ăn uống": UtensilsCrossed,
  "Di chuyển": Car,
  "Mua sắm": ShoppingBag,
  "Giải trí": Gamepad2,
  "Hóa đơn & Tiện ích": Receipt,
  "Sức khỏe": HeartPulse,
  "Giáo dục": GraduationCap,
  "Lương": Wallet,
  "Thưởng": Gift,
  "Đầu tư": TrendingUp,
  "Gia đình": Home,
};

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] || Tag;
}

/** Vẽ glyph danh mục — component tĩnh ở module scope để thỏa
 *  react-hooks/static-components (không tạo component trong render). */
export function CategoryGlyph({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon className={className} aria-hidden="true" />;
}

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onEdit?: (transaction: TransactionWithCategory) => void;
  onView?: (transaction: TransactionWithCategory) => void;
  readOnly?: boolean;
}

/**
 * Một dòng trong sổ, phong cách fintech: icon danh mục trong vòng tròn nền
 * tint, tên + danh mục + ngày, số tiền tabular-nums màu theo loại.
 *
 * Chiều cao ép cứng bằng ROW_H chứ không để nội dung quyết định —
 * react-window tính offset từ cùng hằng số đó.
 */
export function TransactionItem({ transaction, onView, readOnly = false }: TransactionItemProps) {
  const isIncome = transaction.type === "INCOME";
  const icon = categoryIcon(transaction.category.name);

  return (
    <button
      type="button"
      onClick={() => onView?.(transaction)}
      style={{ height: ROW_H }}
      className="flex w-full items-center gap-3 px-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none sm:px-4"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isIncome
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        )}
      >
        <CategoryGlyph icon={icon} className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {transaction.description}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {transaction.category.name} · {format(new Date(transaction.date), "d/M")}
        </span>
      </span>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold whitespace-nowrap tabular-nums",
          isIncome ? "text-(--pf-ok-ink)" : "text-(--pf-expense-ink)"
        )}
      >
        {formatSignedCurrency(Number(transaction.amount), transaction.type)}
      </span>

      {readOnly && transaction.user && (
        <span className="shrink-0" title={transaction.user.name || "Thành viên"}>
          {transaction.user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={transaction.user.image}
              alt={transaction.user.name || "Thành viên"}
              className="h-6 w-6 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-muted-foreground">
              {transaction.user.name?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
