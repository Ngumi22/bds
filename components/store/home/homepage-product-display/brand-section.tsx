"use client";

import { useMemo } from "react";
import { MinimalProductData } from "@/lib/product/product.types";
import { ProductSection } from "@/components/shared/product-section";

// Define the input data structure
export interface BrandWithProducts {
  id: string;
  slug: string;
  name: string;
  products: MinimalProductData[];
}

interface BrandProductsSectionProps {
  brandsWithProducts: BrandWithProducts[];
}

// Define the internal type with the custom tag
type ProductWithBrandTag = MinimalProductData & { _brandSlug: string };

export default function BrandSection({
  brandsWithProducts,
}: BrandProductsSectionProps) {
  // 1. Create Tabs from Brands
  const tabs = useMemo(() => {
    return brandsWithProducts.map((brand) => ({
      id: brand.slug,
      label: brand.name,
    }));
  }, [brandsWithProducts]);

  // 2. Flatten products and tag them with the brand slug
  const flattenedTestProducts = useMemo(() => {
    return brandsWithProducts.flatMap((brand) =>
      brand.products.map((product) => ({
        ...product,
        _brandSlug: brand.slug, // This is the tag we filter by
      }))
    ) as ProductWithBrandTag[];
  }, [brandsWithProducts]);

  // Return null if no brands exist
  if (brandsWithProducts.length === 0) {
    return null;
  }

  return (
    <ProductSection
      config={{
        title: "POPULAR BRANDS", // Static title since this is a collection of brands
        tabs: tabs,
      }}
      products={flattenedTestProducts}
      // Cast the string to satisfy TypeScript
      filterKey={"_brandSlug" as keyof MinimalProductData}
    />
  );
}
