"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { upsertSpecifications } from "@/lib/actions/specifications";
import type { CategoryWithRelations } from "@/lib/types/categories";
import CategorySpecificationsForm, {
  SpecificationsFormValues,
} from "./category-specifications-form";

interface SpecificationFormData {
  id?: string;
  key: string;
  name: string;
  categoryId: string;
}

interface EditSpecificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithRelations;
  specification?: SpecificationFormData;
  onSuccess?: () => void;
}

export default function EditSpecificationDialog({
  open,
  onOpenChange,
  category,
  specification,
  onSuccess,
}: EditSpecificationDialogProps) {
  const [isPending, startTransition] = useTransition();

  const initialData: SpecificationsFormValues | undefined = specification
    ? {
        specifications: [
          {
            id: specification.id,
            key: specification.key,
            name: specification.name,
            categoryId: category.id,
          },
        ],
      }
    : undefined;

  const handleSubmit = async (
    data: SpecificationsFormValues
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await upsertSpecifications(data);
        if (result.success) {
          toast.success(
            specification
              ? "Specification updated successfully"
              : "Specification created successfully"
          );
          onSuccess?.();
          onOpenChange(false);
          resolve({ success: true });
        } else {
          toast.error(result.message ?? "Failed to save specification");
          resolve({ success: false, message: result.message });
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {specification ? "Edit Specification" : "Add Specification"}
          </DialogTitle>
          <DialogDescription>
            {specification
              ? "Update the specification details for this category."
              : "Create a new specification for this category."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <CategorySpecificationsForm
            category={category}
            initialData={initialData}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
