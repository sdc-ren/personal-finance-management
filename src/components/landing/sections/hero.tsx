"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Mic, Play } from "lucide-react";
import { CountUpAnimation } from "@/components/ui/count-up-animation";
import { Reveal } from "../ui/reveal";

const STATS = [
  { value: 5, suffix: " giây", label: "để ghi một khoản chi" },
  { value: 13, suffix: " nút", label: "ghi nhanh một chạm" },
  { value: 6, suffix: " tháng", label: "báo cáo xu hướng" },
];

const MOCK_TRANSACTIONS = [
  { label: "Ăn trưa", sub: "Ăn uống", amount: "−120.000₫" },
  { label: "Đổ xăng", sub: "Di chuyển", amount: "−300.000₫" },
  { label: "Cà phê", sub: "Ăn uống", amount: "−45.000₫" },
];

/** Mockup điện thoại bằng CSS thuần, mô phỏng màn hình app thật. */
function PhoneMockup() {
  return (
    <div className="phone-mock relative mx-auto w-[280px] rounded-[2.2rem] border border-slate-200 bg-white p-2.5 shadow-[0_30px_80px_-20px_rgba(5,150,105,0.25)] dark:border-slate-700 dark:bg-slate-900 sm:w-[300px]">
      <div className="overflow-hidden rounded-[1.7rem] bg-[#F6F8F7] dark:bg-slate-950">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pb-1 pt-3">
          <span className="pf-mono text-[10px] font-semibold text-slate-500">9:41</span>
          <span className="h-4 w-20 rounded-full bg-slate-900 dark:bg-slate-700" />
          <span className="pf-mono text-[10px] font-semibold text-slate-500">5G</span>
        </div>
        <div className="space-y-2.5 px-3.5 pb-4 pt-2">
          <p className="pf-display text-[13px] font-bold text-slate-900 dark:text-white">
            Tổng quan
          </p>
          {/* KPI mini */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { l: "Thu nhập", v: "0₫", c: "text-emerald-600" },
              { l: "Đã chi", v: "465k", c: "text-rose-600" },
            ].map((k) => (
              <div
                key={k.l}
                className="rounded-xl border border-slate-200/70 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-[8px] font-medium text-slate-500">{k.l}</p>
                <p className={`pf-mono text-[11px] font-bold ${k.c}`}>{k.v}</p>
              </div>
            ))}
          </div>
          {/* giao dịch mini */}
          <div className="rounded-xl border border-slate-200/70 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-1.5 text-[10px] font-bold text-slate-900 dark:text-white">
              Giao dịch gần đây
            </p>
            {MOCK_TRANSACTIONS.map((t) => (
              <div key={t.label} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                    {t.label}
                  </p>
                  <p className="text-[8px] text-slate-500">{t.sub}</p>
                </div>
                <p className="pf-mono text-[10px] font-bold text-rose-600">{t.amount}</p>
              </div>
            ))}
          </div>
          {/* quick add mini */}
          <div className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center">
            <p className="text-[11px] font-bold text-white">+ Ghi nhanh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-el",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }
      )
        .fromTo(
          ".phone-mock",
          { opacity: 0, y: 48, rotate: 4 },
          { opacity: 1, y: 0, rotate: 0, duration: 1 },
          "-=0.6"
        )
        .fromTo(
          ".float-card",
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15 },
          "-=0.4"
        );
      // thẻ nổi trôi nhẹ vô hạn
      gsap.utils.toArray<HTMLElement>(".float-card").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 2.6 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden pt-28 sm:pt-36">
      {/* nền trang trí */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(5,150,105,0.12),transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24">
        <div>
          <p className="hero-el mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" /> Miễn phí 100% · Tiếng Việt · VND
          </p>
          <h1 className="hero-el pf-display text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.4rem]">
            Mỗi đồng chi ra
            <br />
            đều <span className="text-emerald-600 dark:text-emerald-400">để lại vết.</span>
          </h1>
          <p className="hero-el mt-6 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            Ghi chi tiêu trong 5 giây bằng giọng nói. Ngân sách theo từng danh
            mục, báo cáo xu hướng 6 tháng — tất cả miễn phí, không giới hạn.
          </p>
          <div className="hero-el mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98]"
            >
              Bắt đầu miễn phí
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#cach-dung"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Play className="h-4 w-4" /> Xem cách hoạt động
            </a>
          </div>
          {/* số liệu */}
          <dl className="hero-el mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="order-2 mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                  {s.label}
                </dt>
                <dd className="pf-mono text-2xl font-bold text-slate-900 dark:text-white">
                  <CountUpAnimation end={s.value} />
                  <span className="text-base font-bold text-emerald-600">{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* mockup + thẻ nổi */}
        <div className="relative">
          <PhoneMockup />
          <div className="float-card absolute -left-2 top-16 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:left-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <Mic className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Đã lưu 50.000₫
              </p>
              <p className="text-[11px] text-slate-500">Ăn sáng · Hôm qua</p>
            </div>
          </div>
          <div className="float-card absolute -bottom-4 -right-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:-right-6">
            <p className="text-[11px] font-semibold text-slate-500">Ăn uống · tháng này</p>
            <div className="mt-1.5 h-2 w-36 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-[68%] rounded-full bg-emerald-500" />
            </div>
            <p className="pf-mono mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              68% ngân sách
            </p>
          </div>
        </div>
      </div>

      {/* dải tin cậy */}
      <Reveal className="border-y border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 sm:px-6">
          {["Ghi nhanh bằng giọng nói", "Ngân sách theo danh mục", "Báo cáo 6 tháng", "Quản lý chi tiêu gia đình"].map(
            (t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                <Check className="h-4 w-4 text-emerald-600" /> {t}
              </span>
            )
          )}
        </div>
      </Reveal>
    </section>
  );
}
