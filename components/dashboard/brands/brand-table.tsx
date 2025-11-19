"use client";

import { useState } from "react";
import { BrandColumns } from "@/components/dashboard/brands/brand-columns";
import { DataTable } from "@/components/dashboard/tables/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Brand } from "@prisma/client";
import CreateBrandSheet from "@/components/dashboard/brands/create-sheet";

type BrandPageProps = {
  brands: Brand[];
};

export default function ClientBrandsPage({ brands }: BrandPageProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreate = () => {
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Brands</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your product brands
            </p>
          </div>
          <Button onClick={handleCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>

        <DataTable columns={BrandColumns} data={brands} />
      </div>

      <CreateBrandSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
