"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/finance";
import { CountUpAnimation } from "@/components/ui/count-up-animation";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface InsightsPanelProps {
  title: string;
  /** Desktop có lối vào trang ngân sách; mobile trước đây thiếu nên nay bật luôn. */
  showManageLink?: boolean;
  remainingBudget: number;
  budgetUsage: number;
  overBudgetCount: number;
}

/**
 * Trước đây khối này tồn tại hai bản gần-giống nhau trong dashboard-client
 * (một cho aside desktop, một cho Sheet mobile), khác đúng tiêu đề và nút.
 * Giờ là một định nghĩa, gọi hai lần.
 */
export function InsightsPanel({
  title,
  showManageLink = false,
  remainingBudget,
  budgetUsage,
  overBudgetCount,
}: InsightsPanelProps) {
  const isOver = budgetUsage > 100;

  return (
    <SectionCard
      title={title}
      action={
        showManageLink ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings?tab=budget">Quản lý ngân sách</Link>
          </Button>
        ) : undefined
      }
    >
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs font-medium text-muted-foreground">Ngân sách còn lại</dt>
          <dd className="pf-mono font-semibold text-(--pf-budget-ink)">
            <CountUpAnimation end={remainingBudget} formatNumber={formatCurrency} />
          </dd>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-medium text-muted-foreground">Mức sử dụng ngân sách</dt>
            <dd
              className={cn(
                "pf-mono font-semibold",
                isOver ? "text-(--pf-over-ink)" : "text-foreground"
              )}
            >
              {budgetUsage}%
            </dd>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={budgetUsage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOver ? "bg-rose-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs font-medium text-muted-foreground">Danh mục vượt ngân sách</dt>
          <dd
            className={cn(
              "pf-mono font-semibold",
              overBudgetCount > 0 ? "text-(--pf-over-ink)" : "text-(--pf-ok-ink)"
            )}
          >
            {overBudgetCount}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
