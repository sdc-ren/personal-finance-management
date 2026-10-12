import {
  BarChart3,
  Mic,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: Mic,
    title: "Ghi bằng giọng nói",
    body: "Nói “năm mươi nghìn hôm qua” — app tự tách số tiền và ngày, bạn chỉ cần bấm xác nhận.",
  },
  {
    icon: Zap,
    title: "Nút bấm một chạm",
    body: "13 nút preset cho các khoản quen thuộc: ăn sáng, cà phê, đổ xăng… bấm là ghi.",
  },
  {
    icon: Wallet,
    title: "Ngân sách theo danh mục",
    body: "Đặt hạn mức từng nhóm chi tiêu, thanh tiến trình cho biết đã dùng bao nhiêu phần trăm.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo 6 tháng",
    body: "Vòng tròn phân bổ theo danh mục, dòng tiền từng ngày, xu hướng nửa năm — mở là thấy tháng này lệch chỗ nào.",
  },
  {
    icon: Users,
    title: "Quản lý gia đình",
    body: "Thêm thành viên, xem chi tiêu chung và riêng trong một nơi, vẫn rõ từng người.",
  },
  {
    icon: ShieldCheck,
    title: "Dữ liệu của bạn",
    body: "Đăng nhập bảo mật, dữ liệu đồng bộ an toàn. Miễn phí 100%, không giới hạn tính năng.",
  },
];

export function Features() {
  return (
    <section id="tinh-nang" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Tính năng"
          title="Mọi thứ bạn cần để kiểm soát tiền"
          description="Không thừa, không thiếu — tập trung vào việc ghi chép nhanh và nhìn rõ tiền đi đâu."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_-20px_rgba(5,150,105,0.25)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400">
                  <f.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="pf-display text-base font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
