"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Thanh CTA dính đáy trên mobile: chỉ hiện sau khi cuộn qua hero. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/95 sm:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Link
        href="/register"
        className="block rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white shadow-lg active:scale-[0.98]"
      >
        Dùng miễn phí ngay
      </Link>
    </div>
  );
}
