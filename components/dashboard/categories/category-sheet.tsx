"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CategoryForm from "./category-form";
import { CategoryFormValues } from "@/lib/schemas/category";
import { CategoryWithRelations } from "@/lib/types/categories";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryWithRelations;
  categories?: CategoryWithRelations[];
  onSubmit: (data: CategoryFormValues) => Promise<void>;
}

export function CategorySheet({
  open,
  onOpenChange,
  category,
  categories,
  onSubmit,
}: CategorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90%] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {category ? "Edit Category" : "Create Category"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CategoryForm allCategories={categories} onSubmit={onSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
