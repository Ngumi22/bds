"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductSpecifications({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {product.specifications.map((spec: any) => (
            <div
              key={spec.id}
              className="flex items-center gap-4 border-b pb-2">
              <span className="font-medium text-gray-700">
                {spec.specificationDef.name}
              </span>
              <span className="text-gray-900">{spec.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
