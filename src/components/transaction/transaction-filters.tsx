"use client";

import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthPicker } from "@/components/ui/month-picker";

interface TransactionFiltersProps {
  // Current values
  categoryId: string;
  memberId?: string;
  dateRange: { from?: Date; to?: Date };

  // Data
  categories: Category[];
  familyMembers?: { id: string; name: string | null }[];
  scope?: "personal" | "family";

  // Visibility
  showFilters: boolean;
  hideTrigger?: boolean;
  hideDateFilter?: boolean;

  // Callbacks
  onCategoryChange: (value: string) => void;
  onMemberChange?: (value: string) => void;
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
  onToggleFilters: () => void;
}

export function TransactionFilters({
  categoryId,
  memberId = "all",
  dateRange,
  categories,
  familyMembers = [],
  scope = "personal",
  showFilters,
  hideTrigger = false,
  hideDateFilter = false,
  onCategoryChange,
  onMemberChange,
  onDateRangeChange,
  onToggleFilters,
}: TransactionFiltersProps) {

  return (
    <div className="flex flex-col gap-3">
      {!hideTrigger && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="h-11 w-full sm:h-9 sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </div>
      )}

      {/* Collapsible Filters Bar */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full animate-in fade-in slide-in-from-top-2">
          {/* Category Filter */}
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-11 w-full rounded-lg sm:h-9 sm:w-[160px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Member Filter (Family Only) */}
          {scope === 'family' && onMemberChange && (
            <Select value={memberId} onValueChange={onMemberChange}>
              <SelectTrigger className="h-11 w-full rounded-lg sm:h-9 sm:w-[160px]">
                <SelectValue placeholder="Thành viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mọi người</SelectItem>
                {familyMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name || "Thành viên"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Month Picker */}
          {!hideDateFilter && (
            <MonthPicker
              date={dateRange.from}
              onDateChange={onDateRangeChange}
              className="w-full sm:w-[180px]"
              align="end"
            />
          )}
        </div>
      )}
    </div>
  );
}
