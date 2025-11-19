"use client";

import { useState, useMemo } from "react";
import ProductCard from "../product/product-card";
import { type MinimalProductData } from "@/lib/product/product.types";
import { type Tab } from "./producs-tabs";
import PromoSection from "./promo-section";
import { CollectionWithProducts } from "@/lib/actions/products";

interface CollectionsSectionProps {
  collections: CollectionWithProducts[];
}

export default function CollectionsSection({
  collections,
}: CollectionsSectionProps) {
  const [activeTab, setActiveTab] = useState(collections[0]?.slug || "");

  const tabs: Tab[] = collections.map((collection) => ({
    label: collection.name,
    value: collection.slug,
    isActive: activeTab === collection.slug,
    onClick: () => setActiveTab(collection.slug),
  }));

  const filteredProducts = useMemo(() => {
    const activeSubCategory = collections.find((s) => s.slug === activeTab);
    return activeSubCategory ? activeSubCategory.products : [];
  }, [activeTab, collections]);

  if (collections.length === 0) {
    return null;
  }

  return (
    <PromoSection<MinimalProductData>
      title="Collections"
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
