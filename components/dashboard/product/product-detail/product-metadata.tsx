"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Code } from "lucide-react";
import { formatDate } from "@/lib/utils/form-helpers";
import { Product } from "@prisma/client";

export function ProductMetadata({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Code className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-mono text-sm font-semibold text-foreground">
                {product.sku}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Code className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Product ID</p>
              <p className="font-mono text-xs font-semibold text-foreground">
                {product.id}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(product.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                {product.isActive ? (
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Short Description
          </p>
          <p className="text-sm text-foreground">{product.shortDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
}
