"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { SectionCard, StatCard } from "@/components/ui/finance";
import { SERIES } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format-currency";
import { AXIS_TICK, TOOLTIP_STYLE, axisMoney } from "@/lib/chart-axis";

interface RecentTrendChartProps {
    data: {
        month: string;
        value: number;
    }[];
}

const TOOLTIP_CONTENT_STYLE = { ...TOOLTIP_STYLE, borderRadius: 8 };

export function RecentTrendChart({ data }: RecentTrendChartProps) {
    // Calculate average for context (optional, can be added to UI if needed)
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const average = Math.round(total / (data.length || 1));

    return (
        <SectionCard title="Xu hướng 6 tháng gần đây">
            <p className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                Biểu đồ chi tiêu thực tế từ các tháng trước
            </p>
            <div className="mt-4 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="month"
                            tick={AXIS_TICK}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={AXIS_TICK}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={axisMoney}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={TOOLTIP_CONTENT_STYLE}
                            formatter={(value: number | undefined) => [
                                formatCurrency(value || 0),
                                "Chi tiêu"
                            ]}
                        />
                        <Bar
                            dataKey="value"
                            name="Chi tiêu"
                            fill={SERIES.expense}
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Hàng đo chứ không phải hai cột chữ: ở 375px cặp nhãn + số tiền
                xuống dòng giữa chừng, "32.828.677 ₫/tháng" bị bẻ làm đôi. */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard label="Tổng chi 6 tháng" tone="var(--pf-expense-ink)" value={formatCurrency(total)} />
                <StatCard label="Trung bình mỗi tháng" tone="var(--pf-expense-ink)" value={formatCurrency(average)} />
            </div>
        </SectionCard>
    );
}
