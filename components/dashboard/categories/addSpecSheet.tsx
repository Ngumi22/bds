"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CategoryWithRelations } from "@/lib/types/categories";
import CategorySpecificationsForm, {
  SpecificationsFormValues,
} from "./category-specifications-form";
import { createSpecifications } from "@/lib/actions/specifications";

interface SpecSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithRelations;
}

export default function AddSpecSheet({
  open,
  onOpenChange,
  category,
}: SpecSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (
    data: SpecificationsFormValues
  ): Promise<{ success: boolean; message?: string }> => {
    const result = await createSpecifications(data);

    startTransition(() => {
      if (result.success) {
        toast.success(result.message ?? "Specifications created successfully");
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result.message ?? "Failed to create specifications");
      }
    });

    return result;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-xl p-4">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>

          {isPending ? (
            "Loading"
          ) : (
            <CategorySpecificationsForm
              category={category}
              onSubmit={handleSubmit}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
