import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../ui/reveal";

/** Panel CTA cuối trang. */
export function FinalCta() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-emerald-700 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(255,255,255,0.14),transparent)]"
            />
            <h2 className="pf-display relative mx-auto max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bắt đầu ghi khoản đầu tiên ngay hôm nay.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-emerald-100">
              Mất chưa tới một phút để tạo tài khoản. Khoản chi đầu tiên chỉ
              cách bạn 5 giây.
            </p>
            <Link
              href="/register"
              className="group relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-800 shadow-xl transition-all hover:bg-emerald-50 active:scale-[0.98]"
            >
              Dùng miễn phí ngay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
