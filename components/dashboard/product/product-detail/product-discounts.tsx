"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

export function ProductDiscounts({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Applicable Discounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {product.applicableDiscounts.map((discount: any) => (
            <div key={discount.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-semibold text-foreground">{discount.name}</p>
                <p className="text-xs text-muted-foreground">Code: {discount.code}</p>
              </div>
              <div className="text-right">
                {discount.isFreeShipping ? (
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Free Shipping</Badge>
                ) : (
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    {discount.type === "PERCENTAGE" ? `${discount.value}%` : `$${discount.value}`}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
