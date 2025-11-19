"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/tables/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Category } from "@prisma/client";
import CategoryCreateSheet from "./create-sheet";

type CategoryPageProps = {
  categories: Category[];
  CategoryColumns: any;
};

export default function ClientCategoriesPage({
  categories,
  CategoryColumns,
}: CategoryPageProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreate = () => {
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="mx-auto max-w-full space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Categories
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your product categories
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCreate}
            size="sm"
            className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <DataTable columns={CategoryColumns} data={categories} />
      </div>

      <CategoryCreateSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        categories={categories}
      />
    </div>
  );
}
