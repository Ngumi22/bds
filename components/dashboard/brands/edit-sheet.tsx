"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBrand } from "@/lib/actions/brands";
import { type Brand } from "@prisma/client";
import { type BrandFormData } from "@/lib/schemas/brands";
import BrandForm from "./brand-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BrandEditSheetProps {
  brand: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BrandEditSheet({
  brand,
  open,
  onOpenChange,
}: BrandEditSheetProps) {
  const router = useRouter();

  const handleSubmit = async (data: BrandFormData) => {
    const result = await updateBrand(brand.id, data);

    if (result.success) {
      toast.success("Brand updated successfully");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update brand");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-xl p-4">
        <ScrollArea className="h-full p-2">
          <SheetHeader>
            <SheetTitle>Edit Brand</SheetTitle>
            <SheetDescription>
              Update details for{" "}
              <span className="font-semibold">{brand.name}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="py-2">
            <BrandForm initialData={brand} onSubmit={handleSubmit} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
