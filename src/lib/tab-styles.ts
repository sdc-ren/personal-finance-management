/**
 * Công thức tab kiểu segmented control cho phong cách "Sạch & tài chính",
 * dùng chung ba màn: Lịch sử, Báo cáo, Cài đặt.
 *
 * Mẩu `group-data-[orientation=horizontal]/tabs:h-auto` trông thừa nhưng không
 * bỏ được: đó là cách duy nhất huỷ `h-9` mà tabsListVariants đặt lên TabsList.
 * Một `h-auto` trần không thắng — Tailwind biên dịch biến thể group thành
 * `:is(:where(.group\/tabs)[data-orientation="…"] *)`, đặc trưng (0,2,0) so với
 * (0,1,0) của `.h-auto`, và twMerge cũng giữ cả hai vì khác modifier. Thiếu nó
 * thì trigger 44px bị nhét trong khung 36px: tab bị cắt, mọc thanh cuộn dọc.
 *
 * Nơi gọi nối thêm class bố cục (`w-full`, `grid grid-cols-2`, `sm:w-[400px]`…).
 */
export const TAB_LIST =
  "group-data-[orientation=horizontal]/tabs:h-auto rounded-xl bg-muted p-1";

/** min-h-11 cho ngưỡng chạm 44px trên mobile, hạ về 36px từ sm trở lên. Tab đang
 *  mở: nền trắng, chữ emerald-700, bóng đổ nhẹ. */
export const TAB_TRIGGER =
  "min-h-11 rounded-lg px-4 text-sm font-medium text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm sm:min-h-9";
