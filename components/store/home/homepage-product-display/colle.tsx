"use client";

import { useMemo } from "react";
import { ProductSection } from "@/components/shared/product-section";
import { type MinimalProductData } from "@/lib/product/product.types";

interface CollectionProductsProps {
  title: string;
  products: MinimalProductData[];
}

// Define the internal type to handle the custom filtering tag
type ProductWithCollectionTag = MinimalProductData & { _collectionTab: string };

export default function Colle({ title, products }: CollectionProductsProps) {
  // 1. Define the Tabs
  const tabs = [
    { id: "new", label: "New Arrivals" },
    { id: "featured", label: "Featured" },
    { id: "deals", label: "Best Deals" },
  ];

  // 2. Transform the data:
  // We process the raw products into groups, tag them, and merge them into one big list.
  const processedProducts = useMemo(() => {
    const allTaggedProducts: ProductWithCollectionTag[] = [];

    // Logic for "New" (Sorted by Date)
    const newProducts = [...products]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .map((p) => ({ ...p, _collectionTab: "new" }));
    allTaggedProducts.push(...newProducts);

    // Logic for "Featured" (Boolean check)
    const featuredProducts = products
      .filter((p) => p.featured)
      .map((p) => ({ ...p, _collectionTab: "featured" }));
    allTaggedProducts.push(...featuredProducts);

    // Logic for "Deals" (Math check)
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
      // We use the custom tag we created above as the filter key
      filterKey={"_collectionTab" as keyof MinimalProductData}
    />
  );
}
