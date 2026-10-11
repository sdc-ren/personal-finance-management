"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";

interface BudgetProgressProps {
  categoryName: string;
  spent: number;
  total: number;
  percentage: number;
  isOverBudget: boolean;
  className?: string;
}

export function BudgetProgress({
  categoryName,
  spent,
  total,
  percentage,
  isOverBudget,
  className,
}: BudgetProgressProps) {
  // getBudgetProgress kẹp trần percentage ở 100 (actions/budget.ts), nên vượt 300%
  // vẫn đọc ra "100%". Tính lại tỉ lệ thật từ spent/total để con số nói đúng mức vượt;
  // thanh bar vẫn dùng giá trị kẹp vì nó không vẽ được quá 100.
  const truePercentage = total > 0 ? Math.round((spent / total) * 100) : percentage;

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Tên đứng riêng một dòng với phần trăm: ở 375px, cặp số tiền chiếm gần hết
          bề ngang nên tên danh mục từng bị truncate xuống còn một chữ cái. */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-foreground">{categoryName}</span>
        <span
          className={cn(
            "shrink-0 text-xs font-semibold tabular-nums",
            isOverBudget ? "text-rose-600" : "text-muted-foreground"
          )}
        >
          {truePercentage}%
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className="h-2"
        indicatorClassName={isOverBudget ? "bg-rose-500" : "bg-emerald-500"}
      />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-sm tabular-nums">
          <span className={cn("font-semibold", isOverBudget ? "text-rose-600" : "text-foreground")}>
            {formatCurrency(spent)}
          </span>
          <span className="text-muted-foreground"> / {formatCurrency(total)}</span>
        </span>
        {isOverBudget && (
          <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
            Vượt ngân sách
          </span>
        )}
      </div>
    </div>
  );
}
