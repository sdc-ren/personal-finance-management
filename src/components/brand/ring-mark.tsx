/**
 * Brandmark của phong cách "Sạch & tài chính": vòng tròn emerald gọn,
 * tâm đặc — dùng chung cho landing, trang auth và topbar app.
 */
export function RingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="#059669"
        strokeWidth="2.5"
      />
      <circle cx="16" cy="16" r="5" fill="#059669" />
    </svg>
  );
}
