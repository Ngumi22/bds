"use client";

import { useMemo } from "react";
import { ProductSection } from "@/components/shared/product-section";
import { type MinimalProductData } from "@/lib/product/product.types";

interface CollectionProductsProps {
  title: string;
  products: MinimalProductData[];
}

type ProductWithCollectionTag = MinimalProductData & { _collectionTab: string };

export default function Collections({
  title,
  products,
}: CollectionProductsProps) {
  const tabs = [
    { id: "new", label: "New Arrivals" },
    { id: "featured", label: "Featured" },
    { id: "deals", label: "Best Deals" },
  ];

  const processedProducts = useMemo(() => {
    const allTaggedProducts: ProductWithCollectionTag[] = [];
    const newProducts = [...products]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .map((p) => ({ ...p, _collectionTab: "new" }));
    allTaggedProducts.push(...newProducts);

    const featuredProducts = products
      .filter((p) => p.featured)
      .map((p) => ({ ...p, _collectionTab: "featured" }));
    allTaggedProducts.push(...featuredProducts);

    const dealProducts = products
      .filter(
        (p) =>
          p.originalPrice && (p.originalPrice - p.price) / p.originalPrice > 0.1
      )
      .map((p) => ({ ...p, _collectionTab: "deals" }));
    allTaggedProducts.push(...dealProducts);

    return allTaggedProducts;
  }, [products]);

  return (
    <ProductSection
      config={{
        title: title,
        tabs: tabs,
      }}
      products={processedProducts}
      filterKey={"_collectionTab" as keyof MinimalProductData}
    />
  );
}
