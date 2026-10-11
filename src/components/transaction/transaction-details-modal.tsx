"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TransactionWithCategory, deleteTransaction } from "@/actions/transaction";
import {
  Edit,
  Loader2,
  Trash2,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { categoryIcon, CategoryGlyph } from "./transaction-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency, formatSignedCurrency } from "@/lib/format-currency";
import {
  Dialog as DialogRoot,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TransactionDetailsModalProps {
  transaction: TransactionWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  readOnly?: boolean;
  onDeleted?: () => void;
}

/** Một hàng label/value trong phần chi tiết. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function TransactionDetailsModal({
  transaction,
  open,
  onOpenChange,
  onEdit,
  readOnly = false,
  onDeleted,
}: TransactionDetailsModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  async function handleDelete() {
    if (!transaction) return;
    setDeleting(true);
    const result = await deleteTransaction(transaction.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error === "Unauthorized" ? "Bạn không có quyền xoá khoản này" : "Xoá không được, thử lại nhé");
      return;
    }

    toast.success("Đã xoá giao dịch");
    onOpenChange(false);
    if (onDeleted) {
      onDeleted();
      return;
    }
    startTransition(() => router.refresh());
  }

  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const icon = categoryIcon(transaction.category.name);

  const content = (
    <div className="space-y-6 py-4">
      {/* Panel số tiền — icon danh mục tint + số lớn tabular-nums */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-slate-50/70 px-4 py-5">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            isIncome
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          )}
        >
          <CategoryGlyph icon={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {isIncome ? "Thu nhập" : "Chi tiêu"}
          </p>
          <p
            className={cn(
              "truncate text-2xl font-semibold tabular-nums sm:text-3xl",
              isIncome ? "text-(--pf-ok-ink)" : "text-(--pf-expense-ink)"
            )}
          >
            {formatSignedCurrency(Number(transaction.amount), transaction.type)}
          </p>
        </div>
      </div>

      {/* Chi tiết dạng hàng label/value */}
      <dl>
        <DetailRow label="Mô tả">
          <span className="font-medium">{transaction.description}</span>
        </DetailRow>

        <DetailRow label="Danh mục">{transaction.category.name}</DetailRow>

        <DetailRow label="Phương thức">
          <span className="block">
            {transaction.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}
          </span>
          {transaction.paymentMethod === "TRANSFER" && transaction.transferCode && (
            <span className="block text-xs text-muted-foreground">
              Mã: {transaction.transferCode}
            </span>
          )}
        </DetailRow>

        <DetailRow label="Ngày">
          {format(new Date(transaction.date), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
        </DetailRow>

        {readOnly && transaction.user && (
          <DetailRow label="Người ghi">
            <span className="inline-flex items-center justify-end gap-2">
              {transaction.user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={transaction.user.image}
                  alt={transaction.user.name || "User"}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                  {transaction.user.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
              {transaction.user.name || "Không rõ"}
            </span>
          </DetailRow>
        )}
      </dl>

      {/* Hành động */}
      {!readOnly && (
        <div className="mt-6 space-y-2">
          <Button onClick={onEdit} className="h-11 w-full" variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Sửa giao dịch
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleting}
                className="h-11 w-full"
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Xoá giao dịch
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá khoản này?</AlertDialogTitle>
                <AlertDialogDescription>
                  {transaction.description} · {formatCurrency(transaction.amount)}. Khoản này sẽ biến mất khỏi danh sách và các báo cáo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Giữ lại</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Xoá
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <DialogRoot open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95%] rounded-none px-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Chi tiết giao dịch</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
