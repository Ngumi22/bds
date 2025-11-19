"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductCategoryBrand({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category & Brand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Category
            </p>
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {product.category.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category.slug}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Brand
            </p>
            <div className="flex items-center gap-2">
              {product.brand.logo && (
                <img
                  src={product.brand.logo || "/placeholder.svg"}
                  alt={product.brand.name}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {product.brand.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.brand.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
