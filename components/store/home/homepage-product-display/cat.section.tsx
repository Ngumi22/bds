"use client";

import * as React from "react";
import { ProductSection } from "@/components/shared/product-section";
import { ParentCategoryWithSubCategoriesData } from "@/lib/actions/products";
import { MinimalProductData } from "@/lib/product/product.types";
import { PromoBanner } from "@/components/shared/promo-banner";

interface CatSectionProps {
  category: ParentCategoryWithSubCategoriesData;
}

type ProductWithFilter = MinimalProductData & { _subCatSlug: string };

export default function CatSection({ category }: CatSectionProps) {
  const tabs = React.useMemo(() => {
    return category.subCategories.map((sub) => ({
      id: sub.slug,
      label: sub.name,
    }));
  }, [category]);

  const flattenedTestProducts = React.useMemo(() => {
    return category.subCategories.flatMap((sub) =>
      sub.products.map((product) => ({
        ...product,
        _subCatSlug: sub.slug,
      }))
    ) as ProductWithFilter[];
  }, [category]);

  if (!category.subCategories.length) return null;

  return (
    <ProductSection
      config={{
        title: category.name,
        tabs: tabs,
      }}
      products={flattenedTestProducts}
      filterKey={"_subCatSlug" as keyof MinimalProductData}
      banner={
        <PromoBanner
          title={`${category.name} Offers!`}
          description={`Huge Savings on ${category.name}`}
          image={category.image}
          buttonText="Explore Deals"
          backgroundColor="bg-gray-900"
        />
      }
    />
  );
}
