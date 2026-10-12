"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#tinh-nang", label: "Tính năng" },
  { href: "#cach-dung", label: "Cách dùng" },
  { href: "#bao-cao", label: "Báo cáo" },
  { href: "#faq", label: "Hỏi đáp" },
];

/** Thanh nav sticky của landing: blur + đổ bóng khi cuộn. */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-slate-200/70 bg-white/85 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span className="pf-display text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Finance
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-700 sm:block dark:text-slate-300 dark:hover:text-emerald-400"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            Dùng miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}
