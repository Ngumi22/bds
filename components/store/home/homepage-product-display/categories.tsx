"use client";

import { useState, useMemo } from "react";
import { type MinimalProductData } from "@/lib/product/product.types";
import { type Tab } from "./producs-tabs";
import PromoSection from "./promo-section";
import { ProductCard } from "@/components/shared/product-card";

interface CategoriesProductsProps {
  title: string;
  products: MinimalProductData[];
  promoBanner?: React.ReactNode;
  promoBannerPosition?: "left" | "right";
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export default function CategoriesProducts({
  title,
  products,
  promoBanner,
  promoBannerPosition = "left",
  isLoading = false,
  error = false,
  onRetry,
}: CategoriesProductsProps) {
  const [activeTab, setActiveTab] = useState("new");

  const filteredProducts = useMemo(() => {
    if (error) return [];

    switch (activeTab) {
      case "new":
        return [...products].sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

      case "featured":
        return products.filter((p) => p.featured);
      case "deals":
        return products.filter(
          (p) =>
            p.originalPrice &&
            (p.originalPrice - p.price) / p.originalPrice > 0.1
        );
      default:
        return products;
    }
  }, [activeTab, products, error]);

  const tabs: Tab[] = [
    {
      label: "New",
      value: "new",
      isActive: activeTab === "new",
      onClick: () => setActiveTab("new"),
    },
    {
      label: "Featured",
      value: "featured",
      isActive: activeTab === "featured",
      onClick: () => setActiveTab("featured"),
    },
    {
      label: "Best Deals",
      value: "deals",
      isActive: activeTab === "deals",
      onClick: () => setActiveTab("deals"),
    },
  ];

  const errorState = error ? (
    <div className="text-center">
      <div className="text-lg font-medium mb-2 text-red-600">
        Failed to load products
      </div>
      <button
        onClick={onRetry}
        className="text-blue-600 hover:text-blue-800 underline">
        Try again
      </button>
    </div>
  ) : undefined;

  const emptyState = (
    <div className="text-center">
      <div className="text-lg font-medium mb-2">No products found</div>
      <p className="text-sm text-gray-600">Try selecting a different filter</p>
    </div>
  );

  return (
    <PromoSection
      title={title}
      items={filteredProducts}
      renderItem={(product) => (
        <ProductCard key={product.id} product={product} isLoaded={true} />
      )}
      tabs={tabs}
      promoBanner={promoBanner}
      isLoading={isLoading}
      emptyState={emptyState}
      error={errorState}
      itemsPerPageDesktop={4}
      itemsPerPageTablet={3}
      itemsPerPageMobile={2}
    />
  );
}
