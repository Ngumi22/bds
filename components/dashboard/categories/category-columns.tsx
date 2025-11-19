"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@prisma/client";
import type { CategoryWithRelations } from "@/lib/types/categories";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Trash2,
  Package,
  CheckCircle,
  Ban,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../tables/data-table-column-header";
import { deleteCategory, updateCategoryStatus } from "@/lib/actions/categories";
import CategoryEditSheet from "./edit-sheet";
import CategoryViewSheet from "./category-view";
import SpecSheet from "./spec-tabs";

export function getCategoryColumns(
  allCategories: CategoryWithRelations[]
): ColumnDef<Category>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("slug")}
        </span>
      ),
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const imageUrl = row.getValue("image") as string | null;

        return (
          <div className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Category"
                height={50}
                width={50}
                className="h-auto w-auto object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex items-center justify-start text-xs">
            {isActive ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Ban className="h-4 w-4" />
                Inactive
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        const [isPending, startTransition] = useTransition();
        const [viewSheetOpen, setViewSheetOpen] = useState(false);
        const [addSpecSheetOpen, setAddSpecSheetOpen] = useState(false);
        const [editSheetOpen, setEditSheetOpen] = useState(false);
        const router = useRouter();

        const handleArchive = async () => {
          startTransition(async () => {
            try {
              await updateCategoryStatus(category.id, false);
              toast.success("Category archived successfully");
              router.refresh();
            } catch {
              toast.error("Failed to archive category");
            }
          });
        };

        const handleRestore = async () => {
          startTransition(async () => {
            try {
              await updateCategoryStatus(category.id, true);
              toast.success("Category restored successfully");
              router.refresh();
            } catch {
              toast.error("Failed to restore category");
            }
          });
        };

        const handleDelete = async () => {
          if (
            !window.confirm(
              "Are you sure you want to delete this category? This action cannot be undone."
            )
          )
            return;

          startTransition(async () => {
            try {
              await deleteCategory(category.id);
              toast.success("Category deleted successfully");
              router.refresh();
            } catch {
              toast.error("Failed to delete category");
            }
          });
        };

        return (
          <>
            <CategoryViewSheet
              category={category}
              open={viewSheetOpen}
              onOpenChange={setViewSheetOpen}
            />

            <CategoryEditSheet
              category={category}
              categories={allCategories}
              open={editSheetOpen}
              onOpenChange={setEditSheetOpen}
            />

            <SpecSheet
              open={addSpecSheetOpen}
              onOpenChange={setAddSpecSheetOpen}
              category={category}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={isPending}>
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setViewSheetOpen(true)}
                  className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setEditSheetOpen(true)}
                  className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setAddSpecSheetOpen(true)}
                  className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Specs
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {category.isActive ? (
                  <DropdownMenuItem
                    onClick={handleArchive}
                    className="cursor-pointer text-amber-600"
                    disabled={isPending}>
                    <Archive className="mr-2 h-4 w-4" />
                    {isPending ? "Archiving..." : "Archive"}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleRestore}
                    className="cursor-pointer text-green-600"
                    disabled={isPending}>
                    <Package className="mr-2 h-4 w-4" />
                    {isPending ? "Restoring..." : "Restore"}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600"
                  disabled={isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
}
