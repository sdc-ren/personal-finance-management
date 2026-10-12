"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";

const FAQS = [
  {
    q: "App có thật sự miễn phí không?",
    a: "Miễn phí 100%, mọi tính năng. Không gói Pro, không giới hạn số giao dịch, không quảng cáo.",
  },
  {
    q: "Ghi bằng giọng nói có cần mạng không?",
    a: "Cần mạng cho tính năng nhận dạng giọng nói của trình duyệt (Chrome, Edge, Safari đều hỗ trợ tiếng Việt). Phần tách số tiền và ngày chạy ngay trên máy bạn.",
  },
  {
    q: "Dữ liệu của tôi có an toàn không?",
    a: "Mật khẩu được mã hóa, kết nối bảo mật. Chỉ bạn đăng nhập mới thấy dữ liệu của mình.",
  },
  {
    q: "Dùng trên điện thoại được không?",
    a: "Được — app là web app, mở trên trình duyệt điện thoại là dùng ngay, giao diện tối ưu cho mobile với nút ghi nhanh mở bottom sheet.",
  },
  {
    q: "Những gì chưa có?",
    a: "Hiện chưa có: đồng bộ ngân hàng tự động, app native iOS/Android, và xuất báo cáo PDF. Đây là các tính năng đang được cân nhắc.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 dark:bg-slate-950 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Hỏi đáp"
          title="Câu hỏi thường gặp"
        />
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-[#F6F8F7] dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={0}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                      isOpen && "rotate-180 text-emerald-600"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:px-6">
                      {f.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
