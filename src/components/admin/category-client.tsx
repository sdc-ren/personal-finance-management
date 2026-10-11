"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import { CategoryTable } from "./category-table";
import { CategoryDialog } from "./category-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoryClientProps {
    categories: Category[];
}

export function CategoryClient({ categories }: CategoryClientProps) {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const handleCreate = () => {
        setSelectedCategory(null);
        setOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setOpen(true);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(() => setSelectedCategory(null), 300); // Reset after close animation
        }
    };

    return (
        <>
            <div className="mt-4 flex justify-end">
                <Button onClick={handleCreate} className="pf-action rounded-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm danh mục
                </Button>
            </div>

            <CategoryTable categories={categories} onEdit={handleEdit} />

            <CategoryDialog
                open={open}
                onOpenChange={handleOpenChange}
                category={selectedCategory}
            />
        </>
    );
}
