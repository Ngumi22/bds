"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Package,
  Eye,
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { DataTableColumnHeader } from "../tables/data-table-column-header";
import { deleteBrand, updateBrandStatus } from "@/lib/actions/brands";
import { toast } from "sonner";
import { useState, useTransition } from "react";

import BrandEditSheet from "./edit-sheet";
import BrandViewSheet from "./brand-view";

import type { Brand } from "@prisma/client";

// -------------------------
// Column Definitions
// -------------------------
export const BrandColumns: ColumnDef<Brand>[] = [
  // Selection Checkbox
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

  // Brand Name
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },

  // Brand Slug
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
  },

  // Brand Logo
  {
    accessorKey: "logo",
    header: "Image",
    cell: ({ row }) => <BrandLogoCell logo={row.getValue("logo") as string} />,
  },

  // Active Status
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <BrandActiveCell isActive={row.getValue("isActive") as boolean} />
    ),
  },

  // Actions
  {
    id: "actions",
    cell: ({ row }) => <BrandActionsCell brand={row.original} />,
  },
];

// -------------------------
// Brand Logo Cell Component
// -------------------------
function BrandLogoCell({ logo }: { logo: string }) {
  return (
    <div className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xs">
      {logo ? (
        <Image
          src={logo}
          alt="Brand"
          height={50}
          width={50}
          className="h-auto w-auto object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">No image</span>
        </div>
      )}
    </div>
  );
}

// -------------------------
// Active Status Cell Component
// -------------------------
function BrandActiveCell({ isActive }: { isActive: boolean }) {
  return <span className="">{isActive ? "Yes" : "No"}</span>;
}

// -------------------------
// Actions Cell Component
// -------------------------
function BrandActionsCell({ brand }: { brand: Brand }) {
  const [isPending, startTransition] = useTransition();
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleView = () => setViewSheetOpen(true);
  const handleEdit = () => setEditSheetOpen(true);

  const handleArchive = async () => {
    startTransition(async () => {
      try {
        await updateBrandStatus(brand.id, false);
        toast.success("Brand archived successfully");
      } catch {
        toast.error("Failed to archive brand");
      }
    });
  };

  const handleRestore = async () => {
    startTransition(async () => {
      try {
        await updateBrandStatus(brand.id, true);
        toast.success("Brand restored successfully");
      } catch {
        toast.error("Failed to restore Brand");
      }
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this brand? This action cannot be undone."
      )
    ) {
      startTransition(async () => {
        try {
          await deleteBrand(brand.id);
          toast.success("Brand deleted successfully");
        } catch {
          toast.error("Failed to delete brand");
        }
      });
    }
  };

  return (
    <>
      <BrandViewSheet
        brand={brand}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />
      <BrandEditSheet
        brand={brand}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Brand Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" /> View Brand
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Brand
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {brand.isActive ? (
            <DropdownMenuItem
              onClick={handleArchive}
              className="text-amber-600">
              <Archive className="mr-2 h-4 w-4" /> Archive Brand
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleRestore}
              className="text-green-600">
              <Package className="mr-2 h-4 w-4" /> Restore Brand
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Brand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
