"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Package,
  Eye,
  Edit,
  Archive,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Ban,
  Zap,
  Settings,
  Grid3x3,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MinimalProductData } from "@/lib/types/product";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../tables/data-table-column-header";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FeatureManager from "../feature-manager";
import VariantManager from "../variant-manager";
import {
  deleteProduct,
  updateProductStatus,
} from "@/lib/actions/product-action";
import SpecificationManager from "../specification-manager";

export const ProductColumns: ColumnDef<MinimalProductData>[] = [
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
      <DataTableColumnHeader column={column} title="Name" className="w-8" />
    ),
  },
  {
    accessorKey: "mainImage",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("mainImage") as string;

      return (
        <div className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xs">
          {imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Product"
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
    },
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "stockStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("stockStatus") as string;

      const statusConfig = {
        IN_STOCK: {
          label: "In Stock",
          icon: CheckCircle,
          color: "text-green-700 bg-green-50 border-green-200",
          iconColor: "text-green-600",
        },
        LOW_STOCK: {
          label: "Low Stock",
          icon: AlertTriangle,
          color: "text-amber-700 bg-amber-50 border-amber-200",
          iconColor: "text-amber-600",
        },
        OUT_OF_STOCK: {
          label: "Out of Stock",
          icon: XCircle,
          color: "text-red-700 bg-red-50 border-red-200",
          iconColor: "text-red-600",
        },
        DISCONTINUED: {
          label: "Discontinued",
          icon: Ban,
          color: "text-gray-700 bg-gray-50 border-gray-200",
          iconColor: "text-gray-600",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        icon: Ban,
        color: "text-gray-700 bg-gray-50 border-gray-200",
        iconColor: "text-gray-600",
      };

      const IconComponent = config.icon;

      return (
        <div
          className={`inline-flex items-center gap-1 rounded-xs border p-1 text-xs font-normal ${config.color}`}>
          <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
          {config.label}
        </div>
      );
    },
  },
  {
    accessorKey: "hasVariants",
    header: "Variants",
    cell: ({ row }) => {
      const hasVariants = row.getValue("hasVariants") as boolean;

      return (
        <div className="flex items-center justify-start">
          {hasVariants ? (
            <span className="">Yes</span>
          ) : (
            <span className="">No</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      const [isPending, startTransition] = useTransition();
      const router = useRouter();
      const [openSheet, setOpenSheet] = useState<
        "features" | "specifications" | "variants" | null
      >(null);

      const handleView = () => {
        router.push(`/dashboard/products/${product.slug}`);
      };

      const handleEdit = () => {
        router.push(`/dashboard/products/${product.slug}/edit`);
      };

      const handleArchive = async () => {
        startTransition(async () => {
          try {
            await updateProductStatus(product.id, false);
            toast.success("Product archived successfully");
          } catch (error) {
            toast.error("Failed to archive product");
          }
        });
      };

      const handleDelete = async () => {
        if (
          window.confirm(
            "Are you sure you want to delete this product? This action cannot be undone."
          )
        ) {
          startTransition(async () => {
            try {
              await deleteProduct(product.id);
              toast.success("Product deleted successfully");
            } catch (error) {
              toast.error("Failed to delete product");
            }
          });
        }
      };

      const handleRestore = async () => {
        startTransition(async () => {
          try {
            await updateProductStatus(product.id, true);
            toast.success("Product restored successfully");
          } catch (error) {
            toast.error("Failed to restore product");
          }
        });
      };

      return (
        <>
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View Product
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setOpenSheet("features")}
                className="cursor-pointer">
                <Zap className="mr-2 h-4 w-4" />
                Add Features
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenSheet("specifications")}
                className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Add Specifications
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenSheet("variants")}
                className="cursor-pointer">
                <Grid3x3 className="mr-2 h-4 w-4" />
                Add Variants
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {product.isActive ? (
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="cursor-pointer text-amber-600"
                  disabled={isPending}>
                  <Archive className="mr-2 h-4 w-4" />
                  {isPending ? "Archiving..." : "Archive Product"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleRestore}
                  className="cursor-pointer text-green-600"
                  disabled={isPending}>
                  <Package className="mr-2 h-4 w-4" />
                  {isPending ? "Restoring..." : "Restore Product"}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-red-600"
                disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isPending ? "Deleting..." : "Delete Product"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet
            open={openSheet === "features"}
            onOpenChange={(open) => !open && setOpenSheet(null)}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Manage Features</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FeatureManager productId={product.id} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet
            open={openSheet === "specifications"}
            onOpenChange={(open) => !open && setOpenSheet(null)}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Manage Specifications</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SpecificationManager
                  categoryId={product.categoryId}
                  productId={product.id}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet
            open={openSheet === "variants"}
            onOpenChange={(open) => !open && setOpenSheet(null)}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Manage Variants</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <VariantManager productId={product.id} />
              </div>
            </SheetContent>
          </Sheet>
        </>
      );
    },
  },
];
