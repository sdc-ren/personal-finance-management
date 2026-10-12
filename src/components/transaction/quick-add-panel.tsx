"use client";

import { useEffect, useState } from "react";
import { Mic, Plus } from "lucide-react";
import type { Category } from "@prisma/client";
import { SectionCard } from "@/components/ui/finance";
import { Button } from "@/components/ui/button";
import {
  getQuickPresetsCached,
  type QuickPresetWithCategory,
} from "@/lib/quick-presets-cache";
import { AddTransaction } from "./add-transaction";
import { presetIcon } from "./quick-voice-add";
import { cn } from "@/lib/utils";

interface QuickAddPanelProps {
  categories: Category[];
  onTransactionAdded: () => void;
  /** id để nút "+ Ghi nhanh" cuộn tới panel. */
  id?: string;
}

const DAY_OPTIONS = ["Hôm nay", "Hôm qua", "Chọn ngày"] as const;

/**
 * Panel "Ghi nhanh" sticky bên phải màn Tổng quan (đúng bản preview).
 *
 * Dạng COMPACT/tóm tắt: giữ đúng cấu trúc visual của preview (header +
 * bước 1/3, lưới preset, ô số tiền + mic, chọn ngày, nút hành động) nhưng
 * KHÔNG render luồng flow inline. Mọi tương tác trong panel đều mở
 * AddTransaction Dialog để làm tiếp — logic 3 bước chỉ nằm trong Dialog.
 */
export function QuickAddPanel({
  categories,
  onTransactionAdded,
  id = "quick-add-panel",
}: QuickAddPanelProps) {
  const [presets, setPresets] = useState<QuickPresetWithCategory[] | null>(null);
  const [presetsError, setPresetsError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<(typeof DAY_OPTIONS)[number]>("Hôm nay");

  useEffect(() => {
    let cancelled = false;
    getQuickPresetsCached()
      .then((list) => {
        if (!cancelled) setPresets(list);
      })
      .catch(() => {
        if (!cancelled) {
          setPresetsError(true);
          setPresets([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openDialog = () => setDialogOpen(true);
  const shown = (presets ?? []).filter((p) => p.type === "EXPENSE").slice(0, 6);

  return (
    <>
      <div id={id} className="scroll-mt-24">
      <SectionCard
        title="Ghi nhanh"
        action={
          <span className="pf-mono rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
            1 / 3
          </span>
        }
        contentClassName="flex flex-col gap-4"
      >
        {/* Lưới preset 3 cột — bấm mở Dialog */}
        {presets === null ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <button
            type="button"
            onClick={openDialog}
            className="cursor-pointer rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            {presetsError
              ? "Không tải được nút ghi nhanh — bấm để thử lại"
              : "Bấm để ghi khoản đầu tiên"}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {shown.map((p) => {
              const Icon = presetIcon(p.icon);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={openDialog}
                  className="flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-1 py-2 transition-colors active:scale-95 hover:bg-accent"
                >
                  <Icon
                    className="h-5 w-5 text-(--pf-expense-ink)"
                    strokeWidth={1.8}
                  />
                  <span className="text-center text-[11px] font-medium leading-tight">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Ô số tiền + nút mic — bấm mở Dialog */}
        <button
          type="button"
          onClick={openDialog}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <span className="pf-mono flex-1 text-xl font-semibold tabular-nums text-muted-foreground">
            0₫
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <Mic className="h-4 w-4" />
          </span>
        </button>

        {/* Chọn ngày — bấm mở Dialog */}
        <div className="grid grid-cols-3 gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setActiveDay(d);
                openDialog();
              }}
              className={cn(
                "cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                d === activeDay
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Bấm để ghi nhanh bằng giọng nói — có bước xác nhận trước khi lưu
        </p>

        <Button
          type="button"
          onClick={openDialog}
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Ghi nhanh
        </Button>
      </SectionCard>
      </div>

      {/* Luồng 3 bước thật nằm trong Dialog (desktop) */}
      <AddTransaction
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTransactionAdded={() => {
          setDialogOpen(false);
          onTransactionAdded();
        }}
      />
    </>
  );
}
