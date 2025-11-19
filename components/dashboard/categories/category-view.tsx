"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, Ban, FolderTree, Package, ListTree } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

import { deleteSpecification } from "@/lib/actions/specifications";
import EditSpecificationDialog from "./editSpecificationDialog";
import {
  CategoryWithRelations,
  SpecificationDefinition,
} from "@/lib/types/categories";

export default function CategoryViewSheet({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [specToDelete, setSpecToDelete] = useState<string | null>(null);
  const [specToEdit, setSpecToEdit] = useState<SpecificationDefinition | null>(
    null
  );

  const handleDeleteSpec = async () => {
    if (!specToDelete) return;

    startTransition(async () => {
      const result = await deleteSpecification(specToDelete);

      if (result.success) {
        toast.success("Specification deleted successfully");
        setSpecToDelete(null);
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to delete specification");
      }
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[90%] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Category Details</SheetTitle>
            <SheetDescription>
              View information about {category.name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3 space-y-4">
            {category.image && (
              <div className="flex justify-center">
                <div className="h-24 w-24 overflow-hidden bg-muted">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    height={128}
                    width={128}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 bg-card p-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="mt-1 text-sm">{category.name}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Slug
                  </label>
                  <p className="mt-1 text-sm font-mono text-muted-foreground">
                    {category.slug}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <p className="mt-1">
                    {category.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Type
                  </label>
                  <p className="mt-1 text-sm">
                    {category.parentId ? "Child Category" : "Parent Category"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Products
                  </label>
                  <p className="mt-1">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {category.products?.length || 0}{" "}
                      {category.products?.length === 1 ? "Product" : "Products"}
                    </Badge>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Specifications
                  </label>
                  <p className="mt-1">
                    <Badge variant="secondary" className="gap-1">
                      <ListTree className="h-3 w-3" />
                      {category.specifications?.length || 0}{" "}
                      {category.specifications?.length === 1 ? "Spec" : "Specs"}
                    </Badge>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(category.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {!category.parentId && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ListTree className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Specifications</h3>
                  {category.specifications &&
                    category.specifications.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {category.specifications.length}
                      </Badge>
                    )}
                </div>

                {category.specifications &&
                category.specifications.length > 0 ? (
                  <div className="space-y-3">
                    {category.specifications.map((spec, index) => (
                      <div
                        key={spec.id}
                        className="group relative overflow-hidden bg-card p-4 transition-colors hover:bg-accent">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">
                                {spec.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="h-5 text-xs">
                                {spec.key}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-start gap-1">
                            <Badge variant="outline" className="h-5 text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 py-12">
                    <ListTree className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No specifications defined
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Add specifications to define product attributes
                    </p>
                  </div>
                )}
              </div>
            )}

            {!category.parentId && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Subcategories</h3>
                  {category.children && category.children.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {category.children.length}
                    </Badge>
                  )}
                </div>

                {category.children && category.children.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.children.map((child) => (
                      <div
                        key={child.id}
                        className="group relative overflow-hidden bg-card p-4 transition-colors hover:bg-accent">
                        <div className="flex items-start gap-3">
                          {child.image ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted">
                              <Image
                                src={child.image || "/placeholder.svg"}
                                alt={child.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-border bg-muted">
                              <FolderTree className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium">
                              {child.name}
                            </h4>
                            <p className="mt-0.5 truncate text-xs font-mono text-muted-foreground">
                              {child.slug}
                            </p>
                            <div className="mt-2">
                              {child.isActive ? (
                                <Badge
                                  variant="default"
                                  className="h-5 gap-1 text-xs">
                                  <CheckCircle className="h-2.5 w-2.5" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="h-5 gap-1 text-xs">
                                  <Ban className="h-2.5 w-2.5" />
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 py-12">
                    <FolderTree className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No subcategories yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Child categories will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!specToDelete}
        onOpenChange={(open) => !open && setSpecToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Specification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this specification? This action
              cannot be undone and will remove all associated product values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpec}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {specToEdit && (
        <EditSpecificationDialog
          specification={specToEdit}
          category={category}
          open={!!specToEdit}
          onOpenChange={(open) => !open && setSpecToEdit(null)}
          onSuccess={() => {
            setSpecToEdit(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
