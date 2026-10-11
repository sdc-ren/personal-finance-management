"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  Square,
  Loader2,
  RotateCcw,
  PencilLine,
  Check,
  Coffee,
  UtensilsCrossed,
  Fuel,
  Car,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Wallet,
  Gift,
  Book,
  Heart,
  Home,
  Star,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { useVoiceInput, VOICE_ERROR_MESSAGE } from "@/hooks/use-voice-input";
import {
  parseVoiceInput,
  detectVoiceCommand,
  type VoiceParseResult,
} from "@/lib/voice-parse";
import {
  getQuickPresets,
  type QuickPresetWithCategory,
} from "@/actions/quick-preset";
import { createTransaction } from "@/actions/transaction";

/** Map icon key (lưu trong DB) -> component lucide. */
const PRESET_ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  fuel: Fuel,
  car: Car,
  zap: Zap,
  droplets: Droplets,
  wifi: Wifi,
  smartphone: Smartphone,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
  "shopping-bag": ShoppingBag,
  wallet: Wallet,
  gift: Gift,
  book: Book,
  heart: Heart,
  home: Home,
  star: Star,
};

/** Map icon key (lưu trong DB) -> component lucide. Export để panel Ghi nhanh dùng chung. */
export function presetIcon(key: string): LucideIcon {
  return PRESET_ICONS[key] || Zap;
}

/** Cắt các từ lệnh ("lưu", "kết thúc"...) ra khỏi câu trước khi parse số tiền. */
function stripVoiceCommands(text: string): string {
  return text
    .replace(/\b(lưu lại|kết thúc|dừng lại|đồng ý)\b/gi, " ")
    .replace(/\b(lưu|xong|ok|dừng|thôi|hết)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function relativeDayLabel(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
  };
  const diff = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  if (diff === 0) return "Hôm nay";
  if (diff === -1) return "Hôm qua";
  if (diff === -2) return "Hôm kia";
  return format(date, "EEEE, d/M", { locale: vi });
}

interface QuickVoiceAddProps {
  categories: Category[];
  onTransactionAdded: () => void;
}

/**
 * Ghi nhanh: chọn nút preset -> nói số tiền (+ ngày) -> xác nhận -> lưu.
 * Luồng 3 chạm thay vì form dài: preset -> mic/kết thúc -> lưu.
 */
export function QuickVoiceAdd({ categories, onTransactionAdded }: QuickVoiceAddProps) {
  const [presets, setPresets] = useState<QuickPresetWithCategory[] | null>(null);
  const [presetsError, setPresetsError] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [selected, setSelected] = useState<QuickPresetWithCategory | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAmount, setManualAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const savedByVoiceRef = useRef(false);

  const voice = useVoiceInput({ lang: "vi-VN" });

  // Nạp preset 1 lần khi mở — có catch để lỗi DB không treo skeleton mãi
  useEffect(() => {
    let cancelled = false;
    getQuickPresets()
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

  // Parse câu nói -> { số tiền, ngày }. Lệnh thoại ("lưu"/"kết thúc") được tách riêng.
  const parsed: VoiceParseResult = useMemo(() => {
    const clean = stripVoiceCommands(voice.finalText);
    return parseVoiceInput(clean || voice.finalText);
  }, [voice.finalText]);

  // Lệnh thoại: nói "kết thúc" -> dừng nghe; nói "lưu"/"xong" -> lưu luôn
  useEffect(() => {
    if (!voice.finalText || !selected) return;
    const cmd = detectVoiceCommand(voice.finalText);
    if (cmd === "finish" && voice.listening) {
      voice.stop();
    } else if (cmd === "save" && !savedByVoiceRef.current) {
      const clean = stripVoiceCommands(voice.finalText);
      const p = parseVoiceInput(clean);
      if (p.amount && p.amount > 0) {
        savedByVoiceRef.current = true;
        voice.stop();
        void doSave(p.amount, p.date);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.finalText]);

  const filtered = useMemo(
    () => (presets || []).filter((p) => p.type === type),
    [presets, type]
  );

  function selectPreset(p: QuickPresetWithCategory) {
    savedByVoiceRef.current = false;
    setSelected(p);
    setManualAmount("");
    // Mic tự bật ngay trong gesture bấm -> trình duyệt cho phép
    if (voice.supported) {
      setManualMode(false);
      voice.start();
    } else {
      setManualMode(true);
    }
  }

  function backToPresets() {
    voice.stop();
    setSelected(null);
    setManualMode(false);
    setManualAmount("");
    savedByVoiceRef.current = false;
  }

  async function doSave(amount: number, date: Date) {
    if (!selected || saving) return;
    setSaving(true);
    const result = await createTransaction({
      amount,
      description: selected.label,
      type: selected.type as "INCOME" | "EXPENSE",
      categoryId: selected.categoryId,
      date,
      paymentMethod: selected.paymentMethod,
    });
    setSaving(false);
    if (result.error) {
      toast.error("Chưa lưu được, thử lại nhé");
      savedByVoiceRef.current = false;
      return;
    }
    toast.success(
      `Đã ghi ${formatNumber(amount)}₫ · ${selected.label} · ${relativeDayLabel(date).toLowerCase()}`
    );
    backToPresets();
    onTransactionAdded();
  }

  function handleSave() {
    const amount = manualMode
      ? Number(manualAmount.replace(/\D/g, "")) || 0
      : parsed.amount || 0;
    if (amount <= 0) {
      toast.error("Chưa có số tiền để lưu");
      return;
    }
    void doSave(amount, parsed.date);
  }

  const categoryName =
    categories.find((c) => c.id === selected?.categoryId)?.name ||
    selected?.category.name ||
    "";

  // --- Màn chọn preset -------------------------------------------------------
  if (!selected) {
    return (
      <div className="space-y-4">
        <Tabs value={type} onValueChange={(v) => setType(v as "EXPENSE" | "INCOME")}>
          <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2")}>
            <TabsTrigger value="EXPENSE" className={TAB_TRIGGER}>
              Tiền ra
            </TabsTrigger>
            <TabsTrigger value="INCOME" className={cn(TAB_TRIGGER, "data-[state=active]:text-(--pf-ok-ink) dark:data-[state=active]:text-(--pf-ok-ink)")}>
              Tiền vào
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {presets === null ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {presetsError
              ? "Không tải được nút ghi nhanh. Kiểm tra lại kết nối rồi thử lại."
              : "Chưa có nút nào. Thêm ở Cài đặt → Nút ghi nhanh."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((p) => {
              const Icon = presetIcon(p.icon);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 transition-colors active:scale-95 hover:bg-accent"
                >
                  <Icon className="h-6 w-6 text-(--pf-expense-ink)" strokeWidth={1.8} />
                  <span className="text-center text-xs font-medium leading-tight">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Bấm một nút, nói số tiền rồi bấm lưu — không cần gõ.
        </p>
      </div>
    );
  }

  // --- Màn nhập bằng giọng nói ----------------------------------------------
  const Icon = presetIcon(selected.icon);
  const amount = manualMode ? Number(manualAmount.replace(/\D/g, "")) || 0 : parsed.amount || 0;

  return (
    <div className="space-y-4">
      {/* Preset đã chọn */}
      <button
        type="button"
        onClick={backToPresets}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2.5 text-left transition-colors hover:bg-emerald-100"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">{selected.label}</span>
          <span className="block text-xs text-muted-foreground">
            {categoryName} · {selected.type === "INCOME" ? "Tiền vào" : "Tiền ra"} · bấm để đổi
          </span>
        </span>
        <RotateCcw className="h-4 w-4 text-muted-foreground" />
      </button>

      {manualMode || !voice.supported ? (
        <div className="space-y-3">
          {!voice.supported && (
            <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {VOICE_ERROR_MESSAGE.unsupported}
            </p>
          )}
          <div className="relative">
            <Input
              value={manualAmount ? formatNumber(Number(manualAmount.replace(/\D/g, "")) || 0) : ""}
              onChange={(e) => setManualAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="pf-mono h-14 rounded-lg border-slate-200 pl-8 text-xl focus-visible:border-emerald-600 focus-visible:ring-emerald-600/30"
              autoFocus
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₫</span>
          </div>
          {voice.supported && (
            <button
              type="button"
              onClick={() => {
                setManualMode(false);
                voice.start();
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              <Mic className="h-4 w-4" /> Dùng giọng nói thay vì gõ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Nút mic */}
          <div className="flex flex-col items-center gap-2 py-2">
            <button
              type="button"
              onClick={() => (voice.listening ? voice.stop() : voice.start())}
              aria-label={voice.listening ? "Dừng nghe" : "Bắt đầu nói"}
              className={cn(
                "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full transition-all active:scale-95",
                voice.listening
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "border-2 border-emerald-600 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50"
              )}
            >
              {voice.listening && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-600 opacity-25" />
              )}
              {voice.listening ? (
                <Square className="h-7 w-7" fill="currentColor" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              {voice.listening
                ? "Đang nghe… nói số tiền, kèm ngày nếu muốn"
                : "Bấm để nói lại"}
            </p>
          </div>

          {/* Lỗi */}
          {voice.error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {VOICE_ERROR_MESSAGE[voice.error]}{" "}
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="cursor-pointer font-semibold underline"
              >
                Gõ tay thay thế
              </button>
            </p>
          )}

          {/* Transcript */}
          {(voice.finalText || voice.interim) && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground pf-mono">
                Nghe được
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {voice.finalText}
                {voice.interim && (
                  <span className="text-muted-foreground"> {voice.interim}</span>
                )}
                {!voice.finalText && !voice.interim && "…"}
              </p>
            </div>
          )}

          {!voice.listening && !voice.finalText && !voice.error && (
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              <PencilLine className="h-3.5 w-3.5" /> Gõ số tiền bằng tay
            </button>
          )}
        </div>
      )}

      {/* Kết quả parse -> xác nhận */}
      <div className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="pf-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Sẽ lưu
          </span>
          <span className="text-xs text-muted-foreground">{relativeDayLabel(parsed.date)}</span>
        </div>
        <p className="pf-mono mt-1 text-3xl font-bold tracking-tight">
          {amount > 0 ? `${formatNumber(amount)}₫` : <span className="text-muted-foreground/60">0₫</span>}
        </p>
        {parsed.dateExplicit && (
          <p className="mt-1 text-xs text-muted-foreground">
            Ngày: {format(parsed.date, "EEEE, d/M/yyyy", { locale: vi })}
          </p>
        )}
        {!manualMode && amount === 0 && voice.finalText && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Chưa nghe rõ số tiền. Thử nói lại, ví dụ: “năm mươi nghìn”.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {voice.listening ? (
          <Button
            type="button"
            onClick={() => voice.stop()}
            variant="outline"
            className="h-12 flex-1 rounded-xl"
          >
            <Square className="mr-2 h-4 w-4" fill="currentColor" /> Kết thúc
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => {
              voice.reset();
              if (voice.supported && !manualMode) voice.start();
            }}
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Nói lại
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          className="h-12 flex-[2] rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
          disabled={saving || amount <= 0}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {saving ? "Đang lưu…" : `Lưu ${amount > 0 ? formatNumber(amount) + "₫" : ""}`}
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Mẹo: nói “năm mươi nghìn hôm qua” để ghi cả ngày · nói “lưu” để lưu luôn
      </p>
    </div>
  );
}
