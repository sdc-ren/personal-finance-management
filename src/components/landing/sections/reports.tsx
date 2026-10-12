"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const MONTHS = [
  { m: "T5", v: 42 },
  { m: "T6", v: 58 },
  { m: "T7", v: 35 },
  { m: "T8", v: 70 },
  { m: "T9", v: 52 },
  { m: "T10", v: 88 },
];

const POINTS = [
  "Chi tiêu theo từng danh mục, biết tiền đi đâu",
  "Dòng tiền từng ngày trong tháng",
  "Xu hướng 6 tháng gần nhất",
  "So sánh năm nay với năm ngoái",
];

/** Biểu đồ cột mọc lên khi cuộn tới. */
function BarChart() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".report-bar",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
          transformOrigin: "bottom",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref }
  );

  const max = Math.max(...MONTHS.map((x) => x.v));

  return (
    <div ref={ref} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
        Xu hướng chi tiêu
      </p>
      <p className="mb-5 text-xs text-slate-500">6 tháng gần nhất · triệu đồng</p>
      <div className="flex h-44 items-end justify-between gap-3">
        {MONTHS.map((x) => (
          <div key={x.m} className="flex flex-1 flex-col items-center gap-2">
            <span className="pf-mono text-[10px] font-bold text-slate-500">
              {x.v}
            </span>
            <div
              className="report-bar w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
              style={{ height: `${(x.v / max) * 120}px` }}
            />
            <span className="text-[11px] font-medium text-slate-500">{x.m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <section id="bao-cao" className="scroll-mt-20 bg-white py-16 dark:bg-slate-950 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Báo cáo"
          title="Mở báo cáo là thấy tiền đi đâu"
          description="Không cần xuất Excel, không cần tự tổng hợp. Mọi con số đã được tính sẵn."
        />
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <BarChart />
          </Reveal>
          <div>
            {POINTS.map((p, i) => (
              <Reveal key={p} delay={i * 0.08}>
                <div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-0 dark:border-slate-800">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  </span>
                  <p className="text-[15px] font-medium text-slate-700 dark:text-slate-300">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
