import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const STEPS = [
  {
    no: "01",
    title: "Bấm nút preset",
    body: "Chọn khoản quen thuộc: Ăn sáng, Cà phê, Đổ xăng… hoặc bấm micro để nói tự do.",
  },
  {
    no: "02",
    title: "Nói số tiền",
    body: "“Năm mươi nghìn hôm qua”, “1,5 triệu”, “200k” — app hiểu cả số đọc lẫn số viết.",
  },
  {
    no: "03",
    title: "Xác nhận & lưu",
    body: "Kiểm tra lại số tiền, danh mục, ngày — bấm lưu là xong. Chưa tới 5 giây.",
  },
];

export function HowItWorks() {
  return (
    <section id="cach-dung" className="scroll-mt-20 bg-white py-16 dark:bg-slate-950 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Cách dùng"
          title="Ba bước, năm giây, xong"
          description="Không form dài, không nhập liệu thủ công. Luồng ghi nhanh được thiết kế để bạn không bỏ sót khoản nào."
        />
        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* đường nối */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-emerald-200 md:block dark:border-emerald-900"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.no} delay={i * 0.12} className="relative">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <span className="pf-mono relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-lg shadow-emerald-600/25">
                  {s.no}
                </span>
                <h3 className="pf-display text-lg font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
