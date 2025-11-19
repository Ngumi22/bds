"use client";

import { useState, useMemo } from "react";
import ProductCard from "../product/product-card";
import { type MinimalProductData } from "@/lib/product/product.types";
import { type Tab } from "./producs-tabs";
import PromoSection from "./promo-section";
import { ParentCategoryWithSubCategoriesData } from "@/lib/actions/products";

interface CategoryProductsSectionProps {
  categoriesWithSubs: ParentCategoryWithSubCategoriesData;
}

export default function CategorySection({
  categoriesWithSubs,
}: CategoryProductsSectionProps) {
  const [activeTab, setActiveTab] = useState(
    categoriesWithSubs.subCategories[0]?.slug || ""
  );

  const tabs: Tab[] = categoriesWithSubs.subCategories.map((subCat) => ({
    label: subCat.name,
    value: subCat.slug,
    isActive: activeTab === subCat.slug,
    onClick: () => setActiveTab(subCat.slug),
  }));

  const filteredProducts = useMemo(() => {
    const activeSubCategory = categoriesWithSubs.subCategories.find(
      (s) => s.slug === activeTab
    );
    return activeSubCategory ? activeSubCategory.products : [];
  }, [activeTab, categoriesWithSubs.subCategories]);

  if (categoriesWithSubs.subCategories.length === 0) {
    return null;
  }

  return (
    <PromoSection<MinimalProductData>
      title={categoriesWithSubs.name}
      items={filteredProducts}
      renderItem={(product) => (
        <ProductCard key={product.id} product={product} />
      )}
      tabs={tabs}
      isLoading={false}
      emptyState={
        <div className="text-center py-12">
          No products found in this category.
        </div>
      }
      itemsPerPageDesktop={5}
      itemsPerPageTablet={4}
      itemsPerPageMobile={2}
    />
  );
}
