"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "@/components/ui/finance";
import { SERIES } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format-currency";
import { AXIS_TICK, TOOLTIP_STYLE, axisMoney } from "@/lib/chart-axis";

interface YearlyComparisonChartProps {
  data: {
    month: number;
    name: string;
    currentYear: number;
    lastYear: number;
  }[];
  currentYear: number;
}

const TOOLTIP_CONTENT_STYLE = { ...TOOLTIP_STYLE, borderRadius: 8 };

export function YearlyComparisonChart({ data, currentYear }: YearlyComparisonChartProps) {
  const thisYearTotal = data.reduce((acc, d) => acc + d.currentYear, 0);
  const lastYearTotal = data.reduce((acc, d) => acc + d.lastYear, 0);
  const hasLastYear = lastYearTotal > 0;
  const diffPercent = hasLastYear
    ? Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100)
    : null;

  return (
    <SectionCard title={`${currentYear} so với ${currentYear - 1}`}>
      {/* Câu này chứa số phần trăm nên để chữ thường, không viết hoa. */}
      <p className="text-[11px] tracking-[0.1em] text-muted-foreground tabular-nums">
        {diffPercent === null
          ? `Chưa có dữ liệu năm ${currentYear - 1} để đối chiếu`
          : diffPercent >= 0
            ? `Năm nay đang chi nhiều hơn năm ngoái ${diffPercent}%`
            : `Năm nay đang chi ít hơn năm ngoái ${Math.abs(diffPercent)}%`}
      </p>
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={axisMoney}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={TOOLTIP_CONTENT_STYLE}
              formatter={(value, name) => [formatCurrency(Number(value) || 0), String(name)]}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "var(--font-pf-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                paddingTop: 8,
              }}
            />
            {/* Kỳ so sánh đã là màu dịu sẵn, không hạ opacity thêm nữa. */}
            <Bar
              dataKey="lastYear"
              name={`${currentYear - 1}`}
              fill={SERIES.compare}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="currentYear"
              name={`${currentYear}`}
              fill={SERIES.expense}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
