"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { MonthPicker } from "@/components/ui/month-picker";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  initialScope: "personal" | "family";
  hasFamily: boolean;
  /** Kỳ mà server đã thực sự truy vấn. Truyền xuống thay vì tự tính bằng
   *  new Date() để cây server và cây client không lệch nhau. */
  initialFrom: Date;
}

export function ReportFilters({
  initialScope,
  hasFamily,
  initialFrom,
}: ReportFiltersProps) {
  const { updateFilters, updateDateRange, dateRange, searchParams } = useUrlFilters("/reports");

  // Tabs bám thẳng vào URL: nếu để uncontrolled thì bấm Back sẽ đưa URL về
  // personal trong khi tab vẫn sáng ở family.
  const scope = searchParams.get("scope") || initialScope;

  const handleScopeChange = (value: string) => {
    updateFilters({ scope: value });
  };

  const handleDateSelect = (range: { from: Date; to: Date } | undefined) => {
    updateDateRange(range);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {hasFamily ? (
        <Tabs
          value={scope}
          onValueChange={handleScopeChange}
          className="w-full sm:w-auto"
        >
          <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2 sm:w-[400px]")}>
            <TabsTrigger value="personal" className={TAB_TRIGGER}>
              Cá nhân
            </TabsTrigger>
            <TabsTrigger value="family" className={TAB_TRIGGER}>
              Gia đình
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <div className="pf-display text-lg font-bold text-foreground">Báo cáo cá nhân</div>
      )}

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <MonthPicker
          /* Không có tham số URL thì vẫn phải hiện đúng kỳ server đang trả,
             nếu không màn báo cáo không nói nó đang xem tháng nào. */
          date={dateRange?.from ?? initialFrom}
          onDateChange={handleDateSelect}
          className="h-11 w-full rounded-lg sm:h-9 sm:w-[200px]"
          align="end"
        />
      </div>
    </div>
  );
}
