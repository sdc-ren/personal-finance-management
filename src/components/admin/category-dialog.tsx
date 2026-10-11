"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createSystemCategory, updateSystemCategory } from "@/actions/admin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "Tên danh mục là bắt buộc"),
    type: z.enum(["INCOME", "EXPENSE"]),
});

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null; // If null, mode is CREATE. If present, mode is EDIT.
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "EXPENSE",
        },
    });

    // Reset form when opening or changing category
    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                type: category.type,
            });
        } else {
            form.reset({
                name: "",
                type: "EXPENSE",
            });
        }
    }, [category, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            if (category) {
                // Edit mode
                const result = await updateSystemCategory(category.id, values);
                if (result.success) {
                    toast.success("Cập nhật danh mục thành công");
                    onOpenChange(false);
                } else {
                    toast.error(result.error || "Có lỗi xảy ra");
                }
            } else {
                // Create mode
                const result = await createSystemCategory(values);
                if (result.success) {
                    toast.success("Tạo danh mục thành công");
                    onOpenChange(false);
                } else {
                    toast.error(result.error || "Có lỗi xảy ra");
                }
            }
        } catch {
            // Error handled by result check above if needed, or generic error here
            toast.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
                    <DialogDescription>
                        {category
                            ? "Thay đổi thông tin danh mục hệ thống."
                            : "Tạo danh mục mới cho toàn bộ hệ thống."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Tên danh mục</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Ăn uống, Lương..." className="rounded-lg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Loại giao dịch</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-lg">
                                                <SelectValue placeholder="Chọn loại giao dịch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="EXPENSE">Chi tiêu (Expense)</SelectItem>
                                            <SelectItem value="INCOME">Thu nhập (Income)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)} disabled={loading}>
                                Hủy
                            </Button>
                            <Button type="submit" className="rounded-lg" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {category ? "Lưu thay đổi" : "Tạo danh mục"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
