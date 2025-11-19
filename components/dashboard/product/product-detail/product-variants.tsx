"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProductVariants({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {product.variantGroups.map((group: any) => (
          <div key={group.id}>
            <h3 className="mb-3 font-semibold text-foreground">{group.name}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.options.map((option: any) => (
                <div key={option.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {option.color && (
                    <div
                      className="h-8 w-8 rounded-full border border-border"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{option.name}</p>
                    <p className="text-xs text-muted-foreground">{option.stockCount} in stock</p>
                  </div>
                  {option.inStock ? (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">In Stock</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Out of Stock</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
