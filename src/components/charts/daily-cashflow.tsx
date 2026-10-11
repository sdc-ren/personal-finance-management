"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "@/components/ui/finance";
import { SERIES } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format-currency";
import { AXIS_TICK, TOOLTIP_STYLE, axisMoney } from "@/lib/chart-axis";

interface DailyCashflowChartProps {
  data: {
    date: string;
    income: number;
    expense: number;
  }[];
}

/** Nhãn trục và tooltip đi cùng một kênh chữ với số tiền: mono tabular. */
function shortDay(value: string) {
  // "2026-08-31" -> "31/08"
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
}

const TOOLTIP_CONTENT_STYLE = { ...TOOLTIP_STYLE, borderRadius: 8 };

export function DailyCashflowChart({ data }: DailyCashflowChartProps) {
  const daysWithSpending = data.filter((d) => d.expense > 0).length;
  const totalExpense = data.reduce((acc, d) => acc + d.expense, 0);
  const totalIncome = data.reduce((acc, d) => acc + d.income, 0);
  const busiest = data.reduce(
    (max, d) => (d.expense > max.expense ? d : max),
    { date: "", income: 0, expense: 0 }
  );

  // Xét cả thu lẫn chi: kỳ mới nhận lương mà chưa tiêu đồng nào vẫn là kỳ CÓ
  // giao dịch, chặn ở đây sẽ báo sai và giấu luôn đường thu nhập.
  if (totalExpense === 0 && totalIncome === 0) {
    return (
      <SectionCard title="Dòng tiền theo ngày">
        <p className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
          Chưa có giao dịch nào trong khoảng này
        </p>
        <p className="py-10 text-center text-sm text-muted-foreground">
          Ghi vài giao dịch rồi quay lại đây xem ngày nào tiêu nhiều nhất.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Dòng tiền theo ngày">
      {/* Dòng này có số và dấu phẩy nên không viết hoa — hoa vào là khó đọc. */}
      <p className="text-[11px] tracking-[0.1em] text-muted-foreground tabular-nums">
        Có chi {daysWithSpending}/{data.length} ngày
        {busiest.date ? `, cao nhất ${shortDay(busiest.date)}` : ""}
      </p>
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="pfExpenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--pf-expense)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--pf-expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
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
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelFormatter={(label) => `Ngày ${shortDay(String(label))}`}
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0),
                name === "expense" ? "Tiền ra" : "Tiền vào",
              ]}
            />
            {/* Thu nhập là đường mảnh không fill — chỉ chi tiêu mới có khối lượng. */}
            <Area
              type="monotone"
              dataKey="income"
              stroke={SERIES.income}
              strokeWidth={1.5}
              fill="none"
              fillOpacity={0}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke={SERIES.expense}
              strokeWidth={2}
              fill="url(#pfExpenseFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
