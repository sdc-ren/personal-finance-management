/**
 * Hợp đồng chiều cao của danh sách ảo hoá.
 *
 * react-window cần biết trước chiều cao mỗi nhóm ngày, nên chiều cao KHÔNG được
 * để nội dung quyết định. Mọi con số ở đây là nguồn duy nhất: component set
 * chiều cao bằng chính hằng số này (`style={{ height: ROW_H }}`), và
 * `getItemSize` tính từ cùng chỗ. CSS và tính toán ảo hoá vì vậy không thể lệch.
 *
 * Đổi bất kỳ số nào ở đây là đổi cả hai phía cùng lúc.
 */

/** Một dòng giao dịch. 48px vẫn trên ngưỡng chạm 44px. */
export const ROW_H = 48;

/** Header ngày của nhóm. */
export const GROUP_HEADER_H = 36;

/** Header ngày dạng phẳng (variant "flat"): nhãn + đường kẻ, gọn hơn card. */
export const FLAT_HEADER_H = 32;

/**
 * Đường kẻ giữa hai dòng (divide-y 1px).
 *
 * KHÔNG cộng vào tổng: Tailwind đặt `box-sizing: border-box` nên viền này nằm
 * BÊN TRONG hộp cao ROW_H, không đẩy dòng cao thêm. Hằng số giữ lại để nói rõ
 * điều đó — đo thật trên DOM: panel = 38 + 48n với mọi n.
 */
export const DIVIDER = 1;

/** Viền trên + dưới của panel nhóm. */
export const PANEL_BORDER_Y = 2;

/** Khoảng trống dưới mỗi nhóm. */
export const GROUP_GAP = 12;

/** Chiều cao trọn vẹn của một nhóm ngày có n giao dịch. */
export function getGroupHeight(count: number): number {
  const rows = Math.max(count, 0);
  return GROUP_HEADER_H + PANEL_BORDER_Y + rows * ROW_H + GROUP_GAP;
}
