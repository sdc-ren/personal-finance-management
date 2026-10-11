"use client";

import { useState, useTransition } from "react";
import { Plus, Mic, ListOrdered } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category, Transaction } from "@prisma/client";
import { TransactionWithCategory } from "@/actions/transaction";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TransactionForm } from "./transaction-form";
import { QuickVoiceAdd } from "./quick-voice-add";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AddTransactionProps {
  categories: Category[];
  initialData?: Transaction | TransactionWithCategory | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTransactionAdded?: () => void;
}

/**
 * Trigger mặc định. Trên mobile ẩn hẳn vì đã có FAB ở thanh đáy — hai khối
 * hành động cùng lúc là phá Luật một nguồn sáng.
 */
const triggerClass =
  "hidden h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--primary) bg-(--primary) text-white transition-opacity hover:opacity-90 lg:flex";

/**
 * Nội dung dialog: giao dịch mới có 2 tab (Ghi nhanh bằng preset + giọng nói
 * là mặc định, Chi tiết là form đầy đủ cũ). Sửa giao dịch thì chỉ hiện form.
 * Đặt ngoài AddTransaction để không remount mất state tab mỗi lần parent render.
 */
function AddTransactionBody({
  categories,
  initialData,
  onSuccess,
}: {
  categories: Category[];
  initialData?: Transaction | TransactionWithCategory | null;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState("quick");
  if (initialData) {
    return <TransactionForm categories={categories} initialData={initialData} onSuccess={onSuccess} />;
  }
  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-4">
      <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2")}>
        <TabsTrigger value="quick" className={TAB_TRIGGER}>
          <Mic className="mr-1.5 h-3.5 w-3.5" /> Ghi nhanh
        </TabsTrigger>
        <TabsTrigger value="detail" className={TAB_TRIGGER}>
          <ListOrdered className="mr-1.5 h-3.5 w-3.5" /> Chi tiết
        </TabsTrigger>
      </TabsList>
      <TabsContent value="quick" className="mt-0">
        <QuickVoiceAdd categories={categories} onTransactionAdded={onSuccess} />
      </TabsContent>
      <TabsContent value="detail" className="mt-0">
        <TransactionForm categories={categories} initialData={initialData} onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
}

export function AddTransaction({ categories, initialData, open: controlledOpen, onOpenChange: setControlledOpen, onTransactionAdded }: AddTransactionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  // Radix mặc định focus phần tử đầu tiên (tab loại giao dịch); chặn lại và
  // đưa thẳng con trỏ vào ô số tiền — thao tác đầu tiên của người ghi luôn là gõ số.
  const focusAmount = (e: Event) => {
    e.preventDefault();
    (e.target as HTMLElement | null)
      ?.querySelector<HTMLInputElement>('input[name="amount"]')
      ?.focus();
  };

  const onSuccess = () => {
    setOpen(false);
    if (onTransactionAdded) {
      onTransactionAdded();
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  if (isDesktop) {
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
        {!isControlled && (
          <DialogTrigger asChild>
            <button className={triggerClass}>
              <Plus className="h-4 w-4" />
              <span className="pf-display text-sm font-semibold tracking-wide">Ghi giao dịch</span>
            </button>
          </DialogTrigger>
        )}
        <DialogContent
          className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-[425px]"
          onOpenAutoFocus={focusAmount}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{initialData ? "Sửa giao dịch" : "Ghi giao dịch"}</DialogTitle>
            <DialogDescription>
              {initialData ? "Sửa lại thông tin của khoản này." : "Bấm nút preset rồi nói số tiền — hoặc dùng form chi tiết."}
            </DialogDescription>
          </DialogHeader>
          <AddTransactionBody categories={categories} initialData={initialData} onSuccess={onSuccess} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <SheetTrigger asChild>
          <button className={triggerClass}>
            <Plus className="h-4 w-4" />
            <span className="pf-display text-sm font-semibold tracking-wide">Ghi giao dịch</span>
          </button>
        </SheetTrigger>
      )}
      <SheetContent
        side="bottom"
        className="max-h-[95vh] rounded-t-2xl px-4 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onOpenAutoFocus={focusAmount}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* SheetHeader mang sẵn p-4, nằm trong px-4 làm tiêu đề thụt 32px — gỡ padding ngang */}
        <SheetHeader className="px-0">
          <SheetTitle>{initialData ? "Sửa giao dịch" : "Ghi giao dịch"}</SheetTitle>
          <SheetDescription>
            {initialData ? "Sửa lại thông tin của khoản này." : "Bấm nút preset rồi nói số tiền — hoặc dùng form chi tiết."}
          </SheetDescription>
        </SheetHeader>
        <AddTransactionBody categories={categories} initialData={initialData} onSuccess={onSuccess} />
      </SheetContent>
    </Sheet>
  );
}
