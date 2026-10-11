import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Component dùng chung của phong cách "Sạch & tài chính".
 *
 * StatCard: thẻ chỉ số KPI — nhãn nhỏ, số to dùng tabular-nums, màu theo vai
 * (tone nhận mã màu CSS, ví dụ "var(--pf-expense-ink)" cho chi, "var(--pf-ok-ink)"
 * cho thu, mặc định slate-900 cho số dư).
 *
 * SectionCard: thẻ nhóm nội dung — tiêu đề semibold + vùng action, bo rounded-xl,
 * viền slate-200 mảnh, bóng đổ nhẹ.
 */

export function StatCard({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <Card className={cn("gap-1.5 p-4 sm:p-5", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
      {sub != null && sub !== "" && (
        <div className="text-xs text-muted-foreground">{sub}</div>
      )}
    </Card>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("gap-4 p-4 sm:p-5", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {action}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </Card>
  );
}
