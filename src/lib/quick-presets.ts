/**
 * Danh sách nút ghi nhanh mặc định, tự tạo cho user khi họ chưa có preset nào.
 * Mỗi preset trỏ tới một danh mục hệ thống (tìm theo tên) nên không cần seed cứng.
 */

export interface DefaultQuickPreset {
  label: string;
  categoryName: string;
  type: "EXPENSE" | "INCOME";
  icon: string;
}

export const DEFAULT_QUICK_PRESETS: DefaultQuickPreset[] = [
  { label: "Ăn sáng", categoryName: "Ăn uống", type: "EXPENSE", icon: "coffee" },
  { label: "Ăn trưa", categoryName: "Ăn uống", type: "EXPENSE", icon: "utensils" },
  { label: "Ăn tối", categoryName: "Ăn uống", type: "EXPENSE", icon: "utensils" },
  { label: "Cà phê", categoryName: "Ăn uống", type: "EXPENSE", icon: "coffee" },
  { label: "Đổ xăng", categoryName: "Di chuyển", type: "EXPENSE", icon: "fuel" },
  { label: "Gửi xe", categoryName: "Di chuyển", type: "EXPENSE", icon: "car" },
  { label: "Tiền điện", categoryName: "Hóa đơn & Tiện ích", type: "EXPENSE", icon: "zap" },
  { label: "Tiền nước", categoryName: "Hóa đơn & Tiện ích", type: "EXPENSE", icon: "droplets" },
  { label: "Internet", categoryName: "Hóa đơn & Tiện ích", type: "EXPENSE", icon: "wifi" },
  { label: "Điện thoại", categoryName: "Hóa đơn & Tiện ích", type: "EXPENSE", icon: "smartphone" },
  { label: "Học phí", categoryName: "Giáo dục", type: "EXPENSE", icon: "graduation-cap" },
  { label: "Khám bệnh", categoryName: "Sức khỏe", type: "EXPENSE", icon: "stethoscope" },
  { label: "Mua sắm", categoryName: "Mua sắm", type: "EXPENSE", icon: "shopping-bag" },
  { label: "Lương", categoryName: "Lương", type: "INCOME", icon: "wallet" },
  { label: "Thưởng", categoryName: "Thưởng", type: "INCOME", icon: "gift" },
];

/** Các icon hợp lệ cho preset (map sang lucide ở component). */
export const QUICK_PRESET_ICONS = [
  "coffee",
  "utensils",
  "fuel",
  "car",
  "zap",
  "droplets",
  "wifi",
  "smartphone",
  "graduation-cap",
  "stethoscope",
  "shopping-bag",
  "wallet",
  "gift",
  "book",
  "heart",
  "home",
  "star",
] as const;
