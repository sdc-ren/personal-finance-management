import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primitive layout dùng chung cho mọi màn hình (phong cách "Sạch & tài chính").
 *
 * Luật duy nhất về spacing: các section trong một trang cách nhau
 * `gap-4` (mobile) / `lg:gap-5` (desktop). Màn hình chỉ được compose từ
 * các primitive này — không tự định nghĩa container, padding ngoài hay
 * header riêng. Biến thể nhỏ thì thêm prop, không viết component riêng.
 */

/** Container chuẩn của một trang: cột dọc, spacing chuẩn. */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-4 lg:gap-5", className)}>
      {children}
    </div>
  );
}

/** Header chuẩn: tiêu đề + mô tả + vùng action bên phải. */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Hàng KPI responsive: 1 cột mobile, 3 cột từ sm trở lên. */
export function KpiRow({
  children,
  className,
  twoColOnMobile,
}: {
  children: ReactNode;
  className?: string;
  /** true: mobile 2 cột (dùng cho cụm 3 chỉ số nhỏ như trang Báo cáo). */
  twoColOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        twoColOnMobile ? "grid-cols-2" : "grid-cols-1",
        "sm:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

type ContentGridLayout = "8-4" | "6-6" | "fluid-326";

/**
 * Lưới nội dung: mobile xếp chồng 1 cột, desktop theo layout.
 * - "8-4" (mặc định): 12 cột, cột chính 8, cột phụ 4.
 * - "6-6": 12 cột, hai cột bằng nhau.
 * - "fluid-326": `minmax(0,1fr) 326px` — cột phụ rộng cố định 326px
 *   (đúng cấu trúc bản preview màn Tổng quan).
 * - Không có `side`: cột chính full width.
 * - `sideSticky`: cột phụ dính khi cuộn (`top: 18px`), dùng cho panel
 *   Ghi nhanh trên desktop.
 */
export function ContentGrid({
  main,
  side,
  layout = "8-4",
  sideSticky = false,
  className,
  mainClassName,
  sideClassName,
}: {
  main: ReactNode;
  side?: ReactNode;
  layout?: ContentGridLayout;
  sideSticky?: boolean;
  className?: string;
  mainClassName?: string;
  sideClassName?: string;
}) {
  const isFluid = layout === "fluid-326";
  const mainSpan =
    !side || layout === "6-6" ? "lg:col-span-12" : "lg:col-span-8";
  const sideSpan = layout === "6-6" ? "lg:col-span-6" : "lg:col-span-4";

  return (
    <div
      className={cn(
        "grid min-h-0 grid-cols-1 gap-4 lg:gap-5",
        isFluid ? "lg:grid-cols-[minmax(0,1fr)_326px]" : "lg:grid-cols-12",
        className
      )}
    >
      <div className={cn("min-w-0", !isFluid && mainSpan, mainClassName)}>
        {main}
      </div>
      {side ? (
        <div
          className={cn(
            "flex min-w-0 flex-col gap-4 lg:gap-5",
            !isFluid && sideSpan,
            sideSticky && "lg:sticky lg:top-[18px] lg:self-start",
            sideClassName
          )}
        >
          {side}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Hàng công cụ (toolbar): mobile xếp dọc full-width, từ sm trở lên
 * xếp ngang, hai đầu justify-between. Dùng cho hàng tabs + nút lọc
 * ở dashboard, giao dịch, báo cáo — một định nghĩa duy nhất.
 */
export function ToolbarRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      {children}
    </div>
  );
}
