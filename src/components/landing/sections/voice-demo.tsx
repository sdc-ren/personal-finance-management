"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic, RotateCcw } from "lucide-react";
import { parseVoiceInput } from "@/lib/voice-parse";
import { relativeDayLabel } from "@/lib/app-time";
import { formatNumber } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const PRESETS = ["Ăn sáng", "Ăn trưa", "Cà phê", "Đổ xăng", "Mua sắm"];
const SAMPLES = ["năm mươi nghìn hôm qua", "1,5 triệu", "200k", "hai trăm rưỡi"];

interface SavedEntry {
  id: number;
  label: string;
  amount: number;
  day: string;
}

/**
 * Demo tương tác: mô phỏng ghi nhanh bằng giọng nói ngay trên landing.
 * Dùng đúng parser tiếng Việt của app thật (parseVoiceInput).
 */
export function VoiceDemo() {
  const [preset, setPreset] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [typing, setTyping] = useState(false);
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [justSavedId, setJustSavedId] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);
  const sampleRef = useRef(0);

  const parsed = transcript ? parseVoiceInput(transcript) : null;
  const canSave = !!preset && !!parsed?.amount && !typing;

  const typeText = (text: string) => {
    if (timer.current) clearInterval(timer.current);
    setTyping(true);
    setTranscript("");
    let i = 0;
    timer.current = setInterval(() => {
      i += 2;
      setTranscript(text.slice(0, i));
      if (i >= text.length && timer.current) {
        clearInterval(timer.current);
        setTyping(false);
      }
    }, 40);
  };

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  const pickPreset = (p: string) => {
    setPreset(p);
    // xoay vòng câu mẫu để mỗi lần bấm là một ví dụ khác
    sampleRef.current = (sampleRef.current + 1) % SAMPLES.length;
    typeText(SAMPLES[sampleRef.current]);
  };

  const handleSave = () => {
    if (!canSave || !parsed?.amount || !preset) return;
    idRef.current += 1;
    const entry: SavedEntry = {
      id: idRef.current,
      label: preset,
      amount: parsed.amount,
      day: relativeDayLabel(parsed.date),
    };
    setSaved((s) => [entry, ...s].slice(0, 4));
    setJustSavedId(entry.id);
    setTimeout(() => setJustSavedId(null), 1600);
    setPreset(null);
    setTranscript("");
  };

  const reset = () => {
    setPreset(null);
    setTranscript("");
    setSaved([]);
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Thử ngay"
          title="Bấm thử như đang dùng app thật"
          description="Demo chạy bằng đúng bộ parser tiếng Việt của app — nói số tiền theo cách của bạn, xem app hiểu ra sao."
        />
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* bước 1: preset */}
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              1 · Chọn khoản
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickPreset(p)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all active:scale-95",
                    preset === p
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* bước 2: transcript mô phỏng */}
            <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-slate-500">
              2 · Nói số tiền
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#F6F8F7] px-4 py-3.5 dark:border-slate-700 dark:bg-slate-950">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  typing ? "animate-pulse bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                )}
              >
                <Mic className="h-4 w-4" />
              </span>
              <p className="min-h-6 flex-1 text-[15px] text-slate-800 dark:text-slate-200">
                {transcript ? (
                  <>
                    “{transcript}
                    {typing && <span className="animate-pulse">▍</span>}”
                  </>
                ) : (
                  <span className="text-slate-400">
                    Bấm một nút preset ở trên để mô phỏng…
                  </span>
                )}
              </p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400">Thử câu khác:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => preset && typeText(s)}
                  disabled={!preset}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-400"
                >
                  “{s}”
                </button>
              ))}
            </div>

            {/* bước 3: xác nhận */}
            {parsed?.amount ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  3 · Xác nhận trước khi lưu
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <p className="text-[11px] text-slate-500">Số tiền</p>
                    <p className="pf-mono text-xl font-bold text-slate-900 dark:text-white">
                      {formatNumber(parsed.amount)}₫
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Khoản</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{preset}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Ngày</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {relativeDayLabel(parsed.date)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" /> Lưu
                  </button>
                </div>
              </div>
            ) : (
              transcript &&
              !typing && (
                <p className="mt-4 text-sm text-amber-600">
                  Chưa nhận ra số tiền — thử nói rõ hơn, ví dụ “năm mươi nghìn”.
                </p>
              )
            )}

            {/* danh sách đã lưu */}
            {saved.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Vừa lưu trong demo
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="h-3 w-3" /> Làm lại
                  </button>
                </div>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                  {saved.map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 transition-colors",
                        e.id === justSavedId && "bg-emerald-50 dark:bg-emerald-950/50"
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {e.label}
                        </p>
                        <p className="text-xs text-slate-400">{e.day}</p>
                      </div>
                      <p className="pf-mono text-sm font-bold text-rose-600">
                        −{formatNumber(e.amount)}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
