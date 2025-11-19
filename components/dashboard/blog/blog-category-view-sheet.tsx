"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/form-helpers";
import type { BlogCategory } from "@prisma/client";

interface BlogCategoryViewSheetProps {
  category: BlogCategory | undefined | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BlogCategoryViewSheet({
  category,
  open,
  onOpenChange,
}: BlogCategoryViewSheetProps) {
  if (!category) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{category.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Name
                </p>
                <p className="text-sm">{category.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Slug
                </p>
                <Badge variant="outline" className="text-xs">
                  {category.slug}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </p>
                <p className="text-sm">{formatDate(category.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm">{formatDate(category.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
