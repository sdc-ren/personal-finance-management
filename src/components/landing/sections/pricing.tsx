import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const INCLUDED = [
  "Ghi nhanh bằng giọng nói tiếng Việt",
  "13 nút preset một chạm",
  "Ngân sách theo danh mục",
  "Báo cáo 6 tháng + so sánh năm",
  "Quản lý chi tiêu gia đình",
  "Không giới hạn số giao dịch",
];

export function Pricing() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Bảng giá"
          title="Miễn phí. Hết."
          description="Không gói Pro, không tính năng khóa, không quảng cáo. Một mức giá duy nhất."
        />
        <Reveal className="mx-auto max-w-md">
          <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-600 bg-white p-8 text-center shadow-[0_30px_80px_-30px_rgba(5,150,105,0.35)] dark:bg-slate-900">
            <p className="pf-display text-lg font-bold text-slate-900 dark:text-white">
              Gói duy nhất
            </p>
            <p className="pf-mono mt-4 text-6xl font-bold tracking-tight text-emerald-600">
              0₫
            </p>
            <p className="mt-2 text-sm text-slate-500">mãi mãi, cho mọi tính năng</p>
            <ul className="mt-7 space-y-3 text-left">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              Tạo tài khoản miễn phí
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
