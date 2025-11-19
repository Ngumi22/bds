"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/form-helpers";

export function ProductInfo({ product }: { product: any }) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(product.price)}
            </p>
            {product.originalPrice && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm line-through text-muted-foreground">
                  {formatCurrency(product.originalPrice)}
                </span>
                <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
                  -{discountPercent}%
                </Badge>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tax Rate</p>
            <p className="text-lg font-semibold text-foreground">
              {(product.taxRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sales</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {product.salesCount}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Views</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {product.viewCount}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Viewing Now</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {product.viewingNow}
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Stock Status</span>
            <Badge variant="outline">{product.stockStatus}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Stock Count</span>
            <span className="font-semibold text-foreground">
              {product.stockCount} units
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Average Rating
            </span>
            <span className="font-semibold text-foreground">
              {product.averageRating.toFixed(1)} ⭐ ({product.reviewCount}{" "}
              reviews)
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-6">
          <p className="text-sm font-semibold text-foreground">Description</p>
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: product.description,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
