"use client";

import { Category } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
import { deleteSystemCategory } from "@/actions/admin";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryTableProps {
    categories: Category[];
    onEdit: (category: Category) => void;
}

export function CategoryTable({ categories, onEdit }: CategoryTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const result = await deleteSystemCategory(id);
            if (result.success) {
                toast.success("Đã xóa danh mục thành công");
            } else {
                toast.error(result.error || "Không thể xóa danh mục");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi xóa");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 pl-4 text-xs font-medium text-muted-foreground">Tên danh mục</TableHead>
                        <TableHead className="h-11 text-xs font-medium text-muted-foreground">Loại</TableHead>
                        <TableHead className="h-11 pr-4 text-right text-xs font-medium text-muted-foreground">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-28 text-center text-sm text-muted-foreground">
                                Chưa có danh mục nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        categories.map((category) => (
                            <TableRow key={category.id} className="transition-colors hover:bg-muted/40">
                                <TableCell className="py-3 pl-4 text-sm font-medium text-foreground">{category.name}</TableCell>
                                <TableCell>
                                    <span
                                        className={cn(
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                            category.type === 'INCOME'
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-rose-200 bg-rose-50 text-rose-600"
                                        )}
                                    >
                                        {category.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                                    </span>
                                </TableCell>
                                <TableCell className="pr-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(category)}
                                            aria-label="Sửa danh mục"
                                            className="size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Xóa danh mục"
                                                    className="size-9 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Hành động này không thể hoàn tác. Danh mục <span className="font-semibold text-foreground">&quot;{category.name}&quot;</span> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                                        <br /><br />
                                                        Lưu ý: Không thể xóa danh mục nếu đã có giao dịch gắn với nó.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction variant="destructive"
                                                        onClick={() => handleDelete(category.id)}
                                                        disabled={deletingId === category.id}
                                                    >
                                                        {deletingId === category.id ? "Đang xóa..." : "Xóa danh mục"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
