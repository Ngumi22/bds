"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertCircle } from "lucide-react"

export function ProductInventory({ product }: { product: any }) {
  const isLowStock = product.stockCount < 10 && product.stockCount > 0
  const isOutOfStock = product.stockCount === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Inventory Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Stock Count</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{product.stockCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">units available</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Stock Status</p>
            <div className="mt-2">
              {product.stockStatus === "IN_STOCK" && (
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">In Stock</Badge>
              )}
              {product.stockStatus === "LOW_STOCK" && (
                <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Low Stock</Badge>
              )}
              {product.stockStatus === "OUT_OF_STOCK" && (
                <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Out of Stock</Badge>
              )}
              {product.stockStatus === "BACKORDER" && (
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">Backorder</Badge>
              )}
              {product.stockStatus === "DISCONTINUED" && (
                <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400">Discontinued</Badge>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Viewing Now</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{product.viewingNow}</p>
            <p className="mt-1 text-xs text-muted-foreground">users browsing</p>
          </div>
        </div>

        {isLowStock && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Low stock warning: Only {product.stockCount} units left
            </p>
          </div>
        )}

        {isOutOfStock && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-400">This product is currently out of stock</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
