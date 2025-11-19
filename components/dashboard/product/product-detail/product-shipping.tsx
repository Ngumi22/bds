"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, RotateCcw, Shield } from "lucide-react";

export function ProductShipping({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping & Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <Truck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Delivery</p>
              <p className="text-sm text-muted-foreground">
                {product.shippingInfo.estimatedDelivery}
              </p>
              {product.shippingInfo.freeShipping && (
                <Badge className="mt-2 bg-green-500/20 text-green-700 dark:text-green-400">
                  Free Shipping
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <RotateCcw className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Returns</p>
              <p className="text-sm text-muted-foreground">
                {product.shippingInfo.returnPolicy}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Warranty</p>
              <p className="text-sm text-muted-foreground">
                {product.shippingInfo.warranty}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
