"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { createBrand } from "@/lib/actions/brands";
import { toast } from "sonner";
import BrandForm from "./brand-form";

export default function CreateBrandSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const result = await createBrand(data);

    if (result.success) {
      toast("Success", {
        description: "Brand created successfully",
      });
      router.push("/dashboard/brands");
      router.refresh();
    } else {
      toast("Error", {
        description: result.error || "Failed to create brand",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90%] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Brand</SheetTitle>
        </SheetHeader>

        <div>
          <BrandForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
