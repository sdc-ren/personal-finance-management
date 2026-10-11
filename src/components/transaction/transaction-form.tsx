"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { updateTransaction, createTransaction, TransactionWithCategory } from "@/actions/transaction";
import { Category, Transaction } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";

/** Nhãn field: text-xs font-medium theo phong cách "Sạch & tài chính". */
const FIELD_LABEL = "text-xs font-medium";

/** Chip cộng nhanh vào ô số tiền. */
const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000] as const;

/**
 * Tab "Tiền vào" mang mã màu "ổn" thay vì vàng của chi. Phải là chuỗi literal
 * (không replaceAll lúc chạy) để Tailwind quét ra được class mà sinh CSS;
 * twMerge phân xử đúng — class đứng sau thắng (đã kiểm bằng node).
 */
const TAB_TRIGGER_OK_OVERRIDE =
  "data-[state=active]:text-(--pf-ok-ink) dark:data-[state=active]:text-(--pf-ok-ink)";

const formSchema = z.object({
  amount: z.coerce.number().positive("Số tiền phải lớn hơn 0"),
  description: z.string().min(1, "Vui lòng nhập ghi chú"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  date: z.date(),
  paymentMethod: z.enum(["CASH", "TRANSFER"]),
  transferCode: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  categories: Category[];
  initialData?: Transaction | TransactionWithCategory | null;
  onSuccess: () => void;
}

export function TransactionForm({ categories, initialData, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      amount: Number(initialData.amount),
      description: initialData.description,
      type: initialData.type as "INCOME" | "EXPENSE",
      categoryId: initialData.categoryId,
      date: new Date(initialData.date),
      paymentMethod: (initialData.paymentMethod as "CASH" | "TRANSFER") || "CASH",
      transferCode: initialData.transferCode || "",
    } : {
      amount: 0,
      description: "",
      type: "EXPENSE",
      categoryId: "",
      date: new Date(),
      paymentMethod: "CASH",
      transferCode: "",
    },
  });

  // Use useWatch to subscription to the value to avoid React Compiler issues
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  const type = useWatch({
    control: form.control,
    name: "type",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        amount: Number(initialData.amount),
        description: initialData.description,
        type: initialData.type as "INCOME" | "EXPENSE",
        categoryId: initialData.categoryId,
        date: new Date(initialData.date),
        paymentMethod: (initialData.paymentMethod as "CASH" | "TRANSFER") || "CASH",
        transferCode: initialData.transferCode || "",
      });
    }
  }, [initialData, form]);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function onSubmit(values: TransactionFormValues) {
    setLoading(true);
    let result;

    if (initialData) {
      result = await updateTransaction(initialData.id, values);
    } else {
      result = await createTransaction(values);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        initialData
          ? "Đã cập nhật giao dịch"
          : values.type === "INCOME"
            ? "Đã ghi khoản tiền vào"
            : "Đã ghi khoản chi"
      );
      if (!initialData) {
        form.reset();
      }
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={FIELD_LABEL}>Loại giao dịch</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Danh mục cũ thuộc loại khác nên phải chọn lại
                    form.setValue("categoryId", "", { shouldValidate: false });
                  }}
                  className="w-full"
                >
                  <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2")}>
                    <TabsTrigger value="EXPENSE" className={TAB_TRIGGER}>
                      Tiền ra
                    </TabsTrigger>
                    <TabsTrigger value="INCOME" className={cn(TAB_TRIGGER, TAB_TRIGGER_OK_OVERRIDE)}>
                      Tiền vào
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={FIELD_LABEL}>Số tiền</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={field.value ? formatNumber(field.value as number) : ""}
                    onChange={(e) => {
                      // Remove non-digits (keep only numbers)
                      const rawValue = e.target.value.replace(/\D/g, "");
                      const numberValue = Number(rawValue);
                      field.onChange(numberValue);
                    }}
                    placeholder="0"
                    type="text"
                    inputMode="numeric"
                    className="pf-mono h-12 rounded-lg border-slate-200 pl-8 text-lg focus-visible:border-emerald-600 focus-visible:ring-emerald-600/30"
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₫</span>
                </div>
              </FormControl>
              {/* Chip cộng dồn: bấm nhiều lần để gõ nhanh số chẵn */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      form.setValue("amount", (Number(field.value) || 0) + step, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="pf-mono min-h-11 cursor-pointer rounded-lg border border-border text-[11px] tracking-wide text-(--pf-expense-ink) transition-colors hover:bg-accent disabled:opacity-50 sm:min-h-0 sm:h-9"
                  >
                    +{step / 1000}k
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={FIELD_LABEL}>Danh mục</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 sm:h-9">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      {type === "INCOME"
                        ? "Chưa có danh mục tiền vào. Thêm ở Cài đặt → Danh mục hệ thống."
                        : "Chưa có danh mục tiền ra. Thêm ở Cài đặt → Danh mục hệ thống."}
                    </div>
                  ) : (
                    filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={FIELD_LABEL}>Hình thức thanh toán</FormLabel>
              <FormControl>
                <Tabs onValueChange={field.onChange} value={field.value} className="w-full">
                  <TabsList className={cn(TAB_LIST, "grid w-full grid-cols-2")}>
                    <TabsTrigger value="CASH" className={TAB_TRIGGER}>Tiền mặt</TabsTrigger>
                    <TabsTrigger value="TRANSFER" className={TAB_TRIGGER}>Chuyển khoản</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === "TRANSFER" && (
          <FormField
            control={form.control}
            name="transferCode"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2">
                <FormLabel className={FIELD_LABEL}>Mã giao dịch (Tùy chọn)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="Nhập mã giao dịch / ghi chú chuyển khoản" disabled={loading} className="rounded-lg border-slate-200 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/30" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={FIELD_LABEL}>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={type === "INCOME" ? "Ví dụ: Lương tháng 8, tiền thưởng..." : "Ví dụ: Ăn trưa, tiền xăng..."}
                  {...field}
                  disabled={loading}
                  rows={3}
                  className="resize-none rounded-lg border-slate-200 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="pf-mono min-h-11 text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground p-0 font-normal cursor-pointer flex items-center gap-1"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            {showDatePicker ? "Ẩn chọn ngày" : "Chọn ngày khác / Tùy chọn"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showDatePicker && "rotate-180")} />
          </Button>
        </div>

        {showDatePicker && (
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <FormLabel className={FIELD_LABEL}>Ngày</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full rounded-lg pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700">
          {loading ? "Đang lưu..." : initialData ? "Cập nhật" : type === "INCOME" ? "Lưu khoản thu" : "Lưu khoản chi"}
        </Button>
      </form>
    </Form>
  );
}
