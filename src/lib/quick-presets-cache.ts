"use client";

import {
  getQuickPresets,
  type QuickPresetWithCategory,
} from "@/actions/quick-preset";

export type { QuickPresetWithCategory };

let cache: Promise<QuickPresetWithCategory[]> | null = null;

/**
 * Lấy preset với cache promise dùng chung cho cả app.
 *
 * Vấn đề: dialog "Ghi giao dịch" trước đây fetch preset mỗi lần mở → người
 * dùng chờ API. Giờ fetch một lần duy nhất (promise được share cả khi đang
 * bay), các nơi mở sau dùng lại kết quả — mở dialog là có item ngay.
 * Fetch lỗi thì tự xoá cache để lần sau thử lại, lỗi vẫn throw về caller.
 */
export function getQuickPresetsCached(): Promise<QuickPresetWithCategory[]> {
  if (!cache) {
    cache = getQuickPresets().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}

/** Prefetch không chờ — gọi khi trang mount hoặc khi hover nút mở dialog. */
export function prefetchQuickPresets(): void {
  void getQuickPresetsCached().catch(() => {
    // lỗi đã được xử lý ở caller (hiện trạng thái lỗi thay vì treo)
  });
}

/** Xoá cache sau khi thêm/sửa/xoá preset ở trang Cài đặt. */
export function invalidateQuickPresetsCache(): void {
  cache = null;
}
