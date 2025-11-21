"use client";

import { useMemo } from "react";
import { MinimalProductData } from "@/lib/product/product.types";
import { ProductSection } from "@/components/shared/product-section";

export interface BrandWithProducts {
  id: string;
  slug: string;
  name: string;
  products: MinimalProductData[];
}

interface BrandProductsSectionProps {
  brandsWithProducts: BrandWithProducts[];
}

type ProductWithBrandTag = MinimalProductData & { _brandSlug: string };

export default function BrandSection({
  brandsWithProducts,
}: BrandProductsSectionProps) {
  const tabs = useMemo(() => {
    return brandsWithProducts.map((brand) => ({
      id: brand.slug,
      label: brand.name,
    }));
  }, [brandsWithProducts]);

  const flattenedTestProducts = useMemo(() => {
    return brandsWithProducts.flatMap((brand) =>
      brand.products.map((product) => ({
        ...product,
        _brandSlug: brand.slug,
      }))
    ) as ProductWithBrandTag[];
  }, [brandsWithProducts]);

  if (brandsWithProducts.length === 0) {
    return null;
  }

  return (
    <ProductSection
      config={{
        title: "POPULAR BRANDS",
        tabs: tabs,
      }}
      products={flattenedTestProducts}
      filterKey={"_brandSlug" as keyof MinimalProductData}
    />
  );
}
