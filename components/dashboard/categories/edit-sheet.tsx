"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCategory } from "@/lib/actions/categories";
import { CategoryWithRelations } from "@/lib/types/categories";
import CategoryForm from "./category-form";
import { CategoryFormValues } from "@/lib/schemas/category";
import { Category } from "@prisma/client";

interface CategoryEditSheetProps {
  category: Category;
  categories: CategoryWithRelations[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CategoryEditSheet({
  category,
  categories,
  open,
  onOpenChange,
}: CategoryEditSheetProps) {
  const router = useRouter();

  const handleSubmit = async (data: CategoryFormValues) => {
    const result = await updateCategory(category.id, data);
    if (result.success) {
      toast.success("Category updated successfully");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update category");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-xl p-4">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Update details for {category.name}.
            </SheetDescription>
          </SheetHeader>

          <div className="py-3">
            <CategoryForm
              initialData={category}
              allCategories={categories}
              onSubmit={handleSubmit}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
