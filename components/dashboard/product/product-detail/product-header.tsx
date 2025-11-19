"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2 } from "lucide-react";
import Link from "next/link";

export function ProductHeader({ product }: { product: any }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-full p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/products/${product.slug}/edit`}>
              <Button variant="outline" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {product.isActive ? (
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
              Active
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
              Inactive
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
              Featured
            </Badge>
          )}
          <Badge variant="outline">{product.stockStatus}</Badge>
        </div>
      </div>
    </div>
  );
}
