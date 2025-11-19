"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import CollectionForm from "../../../../../../components/dashboard/collections/collection-form";
import { type Collection, CollectionType } from "@prisma/client";
import type { CollectionFormData } from "@/lib/schemas/collection";

import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/actions/collections";
import { formatDate, formatDateTime } from "@/lib/utils/form-helpers";
import CollectionViewSheet from "../../../../../../components/dashboard/collections/collection-view-sheet";
import { MinimalProductData } from "@/lib/product/product.types";

type CollectionWithProducts = Collection & {
  products?: { productId: string }[];
};

type CollectionPageProps = {
  products: MinimalProductData[];
  collectionsData: CollectionWithProducts[];
};

export default function CollectionsPage({
  collectionsData,
  products,
}: CollectionPageProps) {
  const [collections, setCollections] =
    useState<CollectionWithProducts[]>(collectionsData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<
    CollectionWithProducts | undefined
  >();
  const [viewingCollection, setViewingCollection] = useState<
    CollectionWithProducts | undefined
  >();
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);

  // Helpers
  const formatDateTimeForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const safeISOString = (value?: string | Date | null) =>
    value ? new Date(value).toISOString() : "";

  // CRUD Handlers
  const handleCreateCollection = async (data: CollectionFormData) => {
    try {
      const res = await createCollection(data);
      if (res.success && res.data) {
        setCollections((prev) => [res.data, ...prev]);
        toast.success("Collection created successfully");
        setIsSheetOpen(false);
      } else {
        toast.error(res.message || "Failed to create collection");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while creating collection");
    }
  };

  const handleEditCollection = async (data: CollectionFormData) => {
    if (!editingCollection) return;
    try {
      const res = await updateCollection(editingCollection.id, data);
      if (res.success && res.data) {
        setCollections((prev) =>
          prev.map((c) => (c.id === res.data.id ? res.data : c))
        );
        toast.success("Collection updated successfully");
        setEditingCollection(undefined);
        setIsSheetOpen(false);
      } else {
        toast.error(res.message || "Failed to update collection");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while updating collection");
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const res = await deleteCollection(id);
      if (res.success) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        toast.success("Collection deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete collection");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while deleting collection");
    }
  };

  const handleViewCollection = (collection: CollectionWithProducts) => {
    setViewingCollection(collection);
    setIsViewSheetOpen(true);
  };

  const openCreateSheet = () => {
    setEditingCollection(undefined);
    setIsSheetOpen(true);
  };

  const openEditSheet = (collection: CollectionWithProducts) => {
    setEditingCollection(collection);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-4 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold mb-2">Collections</h1>
          <Button variant="outline" onClick={openCreateSheet} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="group pb-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{collection.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewCollection(collection)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditSheet(collection)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={
                        collection.collectionType === CollectionType.STATIC
                          ? "secondary"
                          : "default"
                      }>
                      {collection.collectionType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      /{collection.slug}
                    </span>
                  </div>

                  <CardDescription className="line-clamp-2 space-y-2">
                    {collection.description && <p>{collection.description}</p>}

                    {(collection.startsAt || collection.endsAt) && (
                      <div className="flex flex-col items-start gap-1 text-xs text-black">
                        {collection.startsAt &&
                          new Date(collection.startsAt) > new Date() && (
                            <span>
                              Starts: {formatDateTime(collection.startsAt)}
                            </span>
                          )}

                        {collection.endsAt &&
                          new Date(collection.endsAt) > new Date() && (
                            <span>
                              Ends: {formatDateTime(collection.endsAt)}
                            </span>
                          )}

                        {collection.endsAt &&
                          new Date(collection.endsAt) <= new Date() && (
                            <span className="text-red-500 font-medium">
                              Ended on {formatDateTime(collection.endsAt)}
                            </span>
                          )}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="flex items-center my-auto justify-between text-xs border-t bg-muted/50">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>
                      {collection.products?.length ?? 0}{" "}
                      {collection.products?.length === 1
                        ? "product"
                        : "products"}
                    </span>
                  </div>
                  <span className="text-xs">
                    Updated {formatDate(collection.updatedAt)}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first collection
              </p>
              <Button variant="outline" onClick={openCreateSheet}>
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingCollection ? "Edit Collection" : "Create New Collection"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <CollectionForm
              collection={
                editingCollection
                  ? {
                      id: editingCollection.id,
                      name: editingCollection.name,
                      slug: editingCollection.slug,
                      description: editingCollection.description ?? undefined,
                      collectionType: editingCollection.collectionType,
                      productIds:
                        editingCollection.products?.map((p) => p.productId) ??
                        [],
                      startsAt: formatDateTimeForInput(
                        safeISOString(editingCollection.startsAt)
                      ),
                      endsAt: formatDateTimeForInput(
                        safeISOString(editingCollection.endsAt)
                      ),
                    }
                  : undefined
              }
              onSubmit={
                editingCollection
                  ? handleEditCollection
                  : handleCreateCollection
              }
              products={products}
              onOpenChange={() => setIsSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <CollectionViewSheet
        collection={viewingCollection}
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
      />
    </div>
  );
}
