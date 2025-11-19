"use client";

import { useState, useMemo } from "react";
import ProductCard from "../product/product-card";
import { type MinimalProductData } from "@/lib/product/product.types";
import { type Tab } from "./producs-tabs";
import PromoSection from "./promo-section";

export interface BrandWithProducts {
  id: string;
  slug: string;
  name: string;
  products: MinimalProductData[];
}

interface BrandProductsSectionProps {
  brandsWithProducts: BrandWithProducts[];
}

export default function HomeBrandSection({
  brandsWithProducts,
}: BrandProductsSectionProps) {
  const [activeTab, setActiveTab] = useState(brandsWithProducts[0]?.slug || "");

  const tabs: Tab[] = brandsWithProducts.map((brand) => ({
    label: brand.name,
    value: brand.slug,
    isActive: activeTab === brand.slug,
    onClick: () => setActiveTab(brand.slug),
  }));

  const filteredProducts = useMemo(() => {
    const activeBrand = brandsWithProducts.find((s) => s.slug === activeTab);
    return activeBrand ? activeBrand.products : [];
  }, [activeTab, brandsWithProducts]);

  if (brandsWithProducts.length === 0) {
    return null;
  }

  return (
    <PromoSection<MinimalProductData>
      title="Shop By Brand"
      items={filteredProducts}
      renderItem={(product) => (
        <ProductCard key={product.id} product={product} />
      )}
      tabs={tabs}
      isLoading={false}
      emptyState={
        <div className="text-center py-12">
          No products found in this brand.
        </div>
      }
      itemsPerPageDesktop={5}
      itemsPerPageTablet={4}
      itemsPerPageMobile={2}
    />
  );
}
