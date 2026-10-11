"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Coffee,
  UtensilsCrossed,
  Fuel,
  Car,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Wallet,
  Gift,
  Book,
  Heart,
  Home,
  Star,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { QUICK_PRESET_ICONS } from "@/lib/quick-presets";
import {
  getQuickPresets,
  createQuickPreset,
  deleteQuickPreset,
  type QuickPresetWithCategory,
} from "@/actions/quick-preset";

const ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  fuel: Fuel,
  car: Car,
  zap: Zap,
  droplets: Droplets,
  wifi: Wifi,
  smartphone: Smartphone,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
  "shopping-bag": ShoppingBag,
  wallet: Wallet,
  gift: Gift,
  book: Book,
  heart: Heart,
  home: Home,
  star: Star,
};

interface Props {
  categories: Category[];
  initialPresets: QuickPresetWithCategory[];
}

/** Quản lý các nút ghi nhanh: thêm / xoá, đổi danh mục, icon, hình thức. */
export function QuickPresetManager({ categories, initialPresets }: Props) {
  const [presets, setPresets] = useState<QuickPresetWithCategory[]>(initialPresets);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [icon, setIcon] = useState("zap");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function reload() {
    setPresets(await getQuickPresets());
  }

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  function handleTypeChange(v: string) {
    // Đổi loại tiền -> reset danh mục đã chọn cho khớp
    setType(v as "EXPENSE" | "INCOME");
    setCategoryId("");
  }

  async function handleAdd() {
    if (!label.trim()) {
      toast.error("Nhập tên nút, ví dụ: Ăn sáng");
      return;
    }
    if (!categoryId) {
      toast.error("Chọn danh mục cho nút này");
      return;
    }
    setAdding(true);
    const result = await createQuickPreset({
      label: label.trim(),
      type,
      categoryId,
      paymentMethod,
      icon,
    });
    setAdding(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Đã thêm nút “${label.trim()}”`);
    setLabel("");
    setCategoryId("");
    await reload();
  }

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);
    const result = await deleteQuickPreset(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Đã xoá nút “${name}”`);
    await reload();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Các nút hiện trong tab “Ghi nhanh” khi bấm nút + . Mỗi nút gắn với một
        danh mục — bấm nút rồi nói số tiền là xong.
      </p>

      {/* Danh sách hiện có */}
      {presets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">Chưa có nút nào.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tạo nút đầu tiên ở form bên dưới.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {presets.map((p) => {
            const Icon = ICONS[p.icon] || Zap;
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {p.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.category.name} · {p.type === "INCOME" ? "Tiền vào" : "Tiền ra"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.label)}
                  disabled={deletingId === p.id}
                  aria-label={`Xoá nút ${p.label}`}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  {deletingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Form thêm nút */}
      <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <p className="text-sm font-semibold text-foreground">Thêm nút mới</p>
        <Tabs value={type} onValueChange={handleTypeChange}>
          <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2")}>
            <TabsTrigger value="EXPENSE" className={TAB_TRIGGER}>
              Tiền ra
            </TabsTrigger>
            <TabsTrigger value="INCOME" className={TAB_TRIGGER}>
              Tiền vào
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tên nút, ví dụ: Ăn sáng"
          maxLength={30}
          className="rounded-lg"
        />
        <div className="grid grid-cols-2 gap-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as "CASH" | "TRANSFER")}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Tiền mặt</SelectItem>
              <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Icon</p>
          <div className="grid grid-cols-9 gap-1.5">
            {QUICK_PRESET_ICONS.map((key) => {
              const Icon = ICONS[key] || Zap;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-label={`Icon ${key}`}
                  className={cn(
                    "flex h-9 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                    icon === key
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="w-full rounded-lg"
        >
          {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {adding ? "Đang thêm…" : "Thêm nút"}
        </Button>
      </div>
    </div>
  );
}
