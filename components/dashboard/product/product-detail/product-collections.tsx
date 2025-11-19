"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProductCollections({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {product.collections.map((collection: any) => (
            <Badge
              key={collection.id}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80">
              {collection.name}
            </Badge>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This product is featured in {product.collections.length} collection
          {product.collections.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
