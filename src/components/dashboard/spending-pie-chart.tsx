"use client";

import { SectionCard } from "@/components/ui/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import { catColor, SLICE_STROKE } from "@/lib/chart-colors";

interface SpendingPieChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const totalExpense = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  // Cùng thang "than nguội" với donut ở /reports. Trước đây màn này dùng bảng bảy
  // màu cầu vồng riêng, trong đó có đỏ — mà đỏ trong thế giới này nghĩa là vượt
  // hạn mức, nên một danh mục bất kỳ lại mang màu cảnh báo.
  const categoriesWithPercent = useMemo(() => data.map((cat, index) => ({
    ...cat,
    percent: totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0,
    color: catColor(index, data.length)
  })), [data, totalExpense]);

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const renderShape = (props: unknown) => {
    // Phải nhận và truyền tiếp stroke: recharts đưa prop của <Pie> vào shape,
    // shape không chuyển xuống <Sector> thì nét ngăn miếng biến mất.
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, stroke, strokeWidth, index } = props as {
      cx: number;
      cy: number;
      innerRadius: number;
      outerRadius: number;
      startAngle: number;
      endAngle: number;
      fill: string;
      stroke: string;
      strokeWidth: number;
      index: number;
    };
    const isActive = activeIndex === index;

    return (
      <g style={{ outline: 'none' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={isActive ? outerRadius + 8 : outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          style={{ outline: 'none', cursor: 'pointer' }}
        />
      </g>
    );
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <SectionCard title="Phân bổ chi tiêu">
      <div className="flex flex-col gap-6">
        <div className="relative flex h-[220px] w-full justify-center [&_:focus]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoriesWithPercent}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={1}
                dataKey="value"
                stroke={SLICE_STROKE}
                strokeWidth={1}
                isAnimationActive={false}
                shape={renderShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={() => setActiveIndex(undefined)}
                onClick={onPieEnter}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {categoriesWithPercent.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">Tổng chi</span>
            <span className="pf-mono mt-1 text-sm font-semibold text-(--pf-expense-ink)">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {categoriesWithPercent.slice(0, 5).map((cat, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-3 px-1 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                  isActive && "bg-accent"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(undefined)}
                onClick={() => setActiveIndex(index)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="h-[14px] w-[2px] shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-sm text-foreground">{cat.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="pf-mono text-sm font-semibold whitespace-nowrap text-(--pf-expense-ink)">
                    {formatCurrency(cat.value)}
                  </span>
                  <span className="pf-mono w-[34px] text-right text-[11px] text-muted-foreground">
                    {cat.percent.toFixed(0)}%
                  </span>
                </span>
              </button>
            );
          })}
          {categoriesWithPercent.length > 5 && (
            <div className="pt-2 text-center text-[11px] text-muted-foreground">
              + {categoriesWithPercent.length - 5} danh mục khác
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
