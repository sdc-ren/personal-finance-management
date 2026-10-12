import { Mic, Wallet, BarChart3 } from "lucide-react";

/**
 * Visual cho cột trái trang đăng nhập/đăng ký — đúng theme "Sạch & tài chính".
 * Thay thế DetectorScene (kiến trúc landing cũ đã bỏ).
 */
export function AuthVisual({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white shadow-xl">
        <p className="pf-display text-2xl font-bold leading-snug">
          Mỗi đồng chi ra
          <br />
          đều để lại vết.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-emerald-100">
          Ghi chi tiêu trong 5 giây bằng giọng nói. Miễn phí 100%.
        </p>
        <div className="mt-6 space-y-3">
          {[
            { icon: Mic, text: "“Năm mươi nghìn hôm qua” — app tự hiểu" },
            { icon: Wallet, text: "Ngân sách theo từng danh mục" },
            { icon: BarChart3, text: "Báo cáo xu hướng 6 tháng" },
          ].map((r) => (
            <div
              key={r.text}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur"
            >
              <r.icon className="h-4 w-4 shrink-0 text-emerald-200" />
              <p className="text-[13px] font-medium text-white">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
