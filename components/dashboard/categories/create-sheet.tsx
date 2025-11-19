"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/actions/categories";
import { CategoryFormValues } from "@/lib/schemas/category";
import CategoryForm from "./category-form";
import { CategoryWithRelations } from "@/lib/types/categories";

interface CategoryCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithRelations[];
}

export default function CategoryCreateSheet({
  open,
  onOpenChange,
  categories,
}: CategoryCreateSheetProps) {
  const router = useRouter();

  const handleSubmit = async (data: CategoryFormValues) => {
    const result = await createCategory(data);
    if (result.success) {
      toast.success("Category created successfully");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to create category");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-xl">
        <ScrollArea className="h-full p-4">
          <SheetHeader>
            <SheetTitle>Create Category</SheetTitle>
          </SheetHeader>

          <div className="">
            <CategoryForm allCategories={categories} onSubmit={handleSubmit} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
