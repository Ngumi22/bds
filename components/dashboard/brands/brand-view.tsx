"use client";

import { CheckCircle, Ban } from "lucide-react";
import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function BrandViewSheet({
  brand,
  open,
  onOpenChange,
}: {
  brand: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90%] sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Brand Details</SheetTitle>
          <SheetDescription>
            View information about {brand.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 p-4">
          {brand.logo && (
            <div className="flex justify-center">
              <div className="h-40 w-40 overflow-hidden bg-muted">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  height={128}
                  width={128}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 bg-card p-2">
            <h3 className="text-sm font-semibold">Basic Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <p className="mt-1 text-sm">{brand.name}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="mt-1 text-sm font-mono text-muted-foreground">
                  {brand.slug}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <p className="mt-1">
                  {brand.isActive ? (
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
                  Created
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(brand.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(brand.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {brand.description && (
            <div className="space-y-4 bg-card p-4">
              <h3 className="text-sm font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {brand.description}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
