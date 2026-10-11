"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui/finance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { BudgetProgress as BudgetProgressComponent } from "./budget-progress";
import { upsertBudget } from "@/actions/budget";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BudgetProgress as BudgetData } from "@/actions/budget";

interface BudgetListProps {
  initialBudgets: BudgetData[];
  categories: { id: string; name: string }[];
}

export function BudgetList({ initialBudgets, categories }: BudgetListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string; amount: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget?.categoryId || !editingBudget.amount) return;

    setIsSubmitting(true);
    try {
      const result = await upsertBudget({
        categoryId: editingBudget.categoryId,
        amount: parseFloat(editingBudget.amount),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã lưu ngân sách");
        setIsOpen(false);
        setEditingBudget(null);
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditingBudget({ categoryId: "", amount: "" });
    setIsOpen(true);
  };

  const openEdit = (budget: BudgetData) => {
    setEditingBudget({
      categoryId: budget.categoryId,
      amount: budget.amount.toString()
    });
    setIsOpen(true);
  };

  return (
    <SectionCard
      title="Ngân sách tháng này"
      action={
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Thêm ngân sách
        </Button>
      }
    >
      <p className="text-sm text-muted-foreground">
        Quản lý chi tiêu theo từng danh mục
      </p>
      {initialBudgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Chưa có ngân sách nào. Hãy tạo ngân sách đầu tiên!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {initialBudgets.map((budget) => (
            <Card key={budget.categoryId} className="p-4">
              <div className="flex items-start gap-2">
                <BudgetProgressComponent
                  className="min-w-0 flex-1"
                  categoryName={budget.category.name}
                  spent={budget.spent}
                  total={budget.amount}
                  percentage={budget.percentage}
                  isOverBudget={budget.isOverBudget}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sửa ngân sách"
                  className="size-9 shrink-0"
                  onClick={() => openEdit(budget)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget?.categoryId && categories.find(c => c.id === editingBudget.categoryId) ? "Sửa ngân sách" : "Thêm ngân sách"}</DialogTitle>
            <DialogDescription>
              Đặt giới hạn chi tiêu cho danh mục trong tháng này.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select
                value={editingBudget?.categoryId ?? ""}
                onValueChange={(v) => setEditingBudget(prev => ({ ...prev!, categoryId: v }))}
                disabled={!!initialBudgets.find(b => b.categoryId === editingBudget?.categoryId && editingBudget.categoryId !== "")}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số tiền giới hạn</Label>
              <Input
                type="number"
                placeholder="0"
                className="rounded-lg"
                value={editingBudget?.amount ?? ""}
                onChange={(e) => setEditingBudget(prev => ({ ...prev!, amount: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
