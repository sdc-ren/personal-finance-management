"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@prisma/client";
import { getCategories } from "@/actions/transaction";
import { prefetchQuickPresets } from "@/lib/quick-presets-cache";
import { AddTransaction } from "@/components/transaction/add-transaction";

/**
 * Nút ghi giao dịch nổi ở giữa thanh điều hướng đáy. Đây là nút tròn emerald
 * đặc duy nhất trên viewport mobile (Luật một nguồn sáng, bản app).
 *
 * Danh mục nạp lười: bấm lần đầu mới gọi getCategories(). Nếu nạp sẵn ở
 * WorkspaceLayout thì ba màn không cần dữ liệu này (báo cáo, gia đình, cài đặt)
 * cũng phải gánh thêm một truy vấn mỗi lần vào trang.
 */
export function QuickAddFab() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleOpen() {
    // preset prefetch từ lúc bấm — dialog mở ra là có item ngay
    prefetchQuickPresets();
    if (categories) {
      setOpen(true);
      return;
    }

    setLoading(true);
    const result = await getCategories();
    setLoading(false);

    if (!result.length) {
      toast.error("Chưa nạp được danh mục, thử lại nhé");
      return;
    }

    setCategories(result);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onMouseEnter={prefetchQuickPresets}
        onTouchStart={prefetchQuickPresets}
        disabled={loading}
        aria-label="Ghi giao dịch"
        className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        )}
      </button>

      {categories && (
        <AddTransaction
          categories={categories}
          open={open}
          onOpenChange={setOpen}
          onTransactionAdded={() => {
            setOpen(false);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
