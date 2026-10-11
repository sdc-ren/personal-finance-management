"use client";

import { SectionCard, StatCard } from "@/components/ui/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import { catColor, SLICE_STROKE } from "@/lib/chart-colors";

interface SpendingAnalysisProps {
    summary: {
        income: number;
        expense: number;
    };
    categories: {
        name: string;
        value: number;
    }[];
}

export function SpendingAnalysis({ summary, categories }: SpendingAnalysisProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>();

    // Calculate percentages
    const totalExpense = summary.expense;
    // getCategoryStats đã sort giảm dần nên index 0 là miếng tiêu nhiều nhất —
    // thang "than nguội" chỉ đúng nghĩa khi thứ tự đó được giữ nguyên.
    const categoriesWithPercent = useMemo(() => categories.map((cat, index) => ({
        ...cat,
        percent: totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0,
        color: catColor(index, categories.length)
    })), [categories, totalExpense]);

    const balance = summary.income - summary.expense;

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
                    outerRadius={isActive ? outerRadius + 10 : outerRadius}
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

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatCard label="Chi tiêu" tone="var(--pf-expense-ink)" value={formatCurrency(summary.expense)} />
                <StatCard label="Thu nhập" tone="var(--pf-ok-ink)" value={formatCurrency(summary.income)} />
                <StatCard
                    label="Chênh lệch"
                    tone={balance >= 0 ? "var(--pf-ok-ink)" : "var(--pf-expense-ink)"}
                    value={formatCurrency(balance)}
                    className="col-span-2 sm:col-span-1"
                />
            </div>

            {/* Chart & Allocation */}
            <SectionCard title="Phân bổ chi tiêu">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-full md:w-1/2 h-[260px] flex justify-center [&_:focus]:outline-none">
                        {categories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoriesWithPercent}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Chưa có dữ liệu
                            </div>
                        )}
                        {/* Center Text */}
                        {categories.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                <span className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Tổng chi</span>
                                <span className="mt-1 text-sm font-semibold tabular-nums text-(--pf-expense-ink)">
                                    {formatCurrency(totalExpense)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Category List */}
                    <div className="w-full md:w-1/2">
                        <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            <span>Danh mục</span>
                            <span>Số tiền</span>
                        </div>
                        <div className="divide-y divide-border">
                            {categoriesWithPercent.map((cat, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        className={cn(
                                            "w-full px-2 py-2.5 text-left transition-colors rounded-lg hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                            isActive && "bg-muted"
                                        )}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(undefined)}
                                        onFocus={() => setActiveIndex(index)}
                                        onBlur={() => setActiveIndex(undefined)}
                                        /* Là <button> thì Enter/Space phải làm gì đó, không thì
                                           trình đọc màn hình đọc ra nút bấm được mà bấm không có gì. */
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span
                                                    aria-hidden
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="truncate text-sm text-foreground">
                                                    {cat.name}
                                                </span>
                                                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">({cat.percent.toFixed(0)}%)</span>
                                            </span>
                                            <span className="shrink-0 text-sm font-semibold whitespace-nowrap tabular-nums text-(--pf-expense-ink)">
                                                {formatCurrency(cat.value)}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${Math.min(cat.percent, 100)}%`, backgroundColor: cat.color }}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                            {categories.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-4">
                                    Chưa có giao dịch chi tiêu
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
