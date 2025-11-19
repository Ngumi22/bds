"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CategoryWithRelations } from "@/lib/types/categories";
import CategorySpecificationsForm, {
  SpecificationsFormValues,
} from "./category-specifications-form";
import {
  createSpecifications,
  upsertSpecifications,
} from "@/lib/actions/specifications";

interface SpecSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithRelations;
}

export default function SpecSheet({
  open,
  onOpenChange,
  category,
}: SpecSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Manage Specifications</SheetTitle>
            </SheetHeader>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit Specs</TabsTrigger>
                <TabsTrigger value="add">Add Specs</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4 mt-6">
                <EditSpecsTab category={category} />
              </TabsContent>

              <TabsContent value="add" className="space-y-4 mt-6">
                <AddSpecsTab category={category} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function EditSpecsTab({ category }: { category: CategoryWithRelations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (
    data: SpecificationsFormValues
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await upsertSpecifications(data);
        if (result.success) {
          toast.success("Specifications updated successfully");
          router.refresh();
          resolve({ success: true });
        } else {
          toast.error(result.message ?? "Failed to update specifications");
          resolve({ success: false, message: result.message });
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Edit existing specifications for {category.name}
      </div>

      <CategorySpecificationsForm category={category} onSubmit={handleSubmit} />
    </div>
  );
}

function AddSpecsTab({ category }: { category: CategoryWithRelations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (
    data: SpecificationsFormValues
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await createSpecifications(data);
        if (result.success) {
          toast.success("Specifications created successfully");
          router.refresh();
          resolve({ success: true });
        } else {
          toast.error(result.message ?? "Failed to create specifications");
          resolve({ success: false, message: result.message });
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Add New Specifications for {category.name}
      </div>

      <CategorySpecificationsForm
        category={category}
        initialData={{ specifications: [] }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
