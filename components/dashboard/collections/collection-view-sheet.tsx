"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Tag, FileText, Package } from "lucide-react";
import type { Collection } from "@prisma/client";
import { formatDate } from "@/lib/utils/form-helpers";

interface CollectionViewSheetProps {
  collection:
    | (Collection & { products?: Array<{ productId: string }> })
    | null
    | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CollectionViewSheet({
  collection,
  open,
  onOpenChange,
}: CollectionViewSheetProps) {
  if (!collection) return null;

  const productCount = collection.products?.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Collection Details</SheetTitle>
        </SheetHeader>

        <div className="mt-3 space-y-3">
          <Card>
            <CardContent className="pt-3 pb-0">
              <div className="space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{collection.name}</h3>
                    <Badge variant="secondary">
                      {collection.collectionType}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    <Tag className="h-3 w-3 mr-1" />/{collection.slug}
                  </Badge>
                </div>

                {collection.description && (
                  <div className="space-y-1 pt-3 border-t">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </p>
                    <p className="text-sm leading-relaxed">
                      {collection.description}
                    </p>
                  </div>
                )}

                <div className="space-y-1 pt-3 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products ({productCount})
                  </p>
                  {productCount > 0 ? (
                    <p className="text-sm text-foreground">
                      This collection contains {productCount} products.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No products in this collection
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created
                    </p>
                    <p className="font-medium text-sm">
                      {formatDate(collection.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Updated
                    </p>
                    <p className="font-medium text-sm">
                      {formatDate(collection.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
