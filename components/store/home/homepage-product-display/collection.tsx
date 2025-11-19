"use client";

import { useState, useMemo } from "react";
import ProductCard from "../product/product-card";
import { type MinimalProductData } from "@/lib/product/product.types";
import { type Tab } from "./producs-tabs";
import PromoSection from "./promo-section";

export default function CollectionProducts({
  title,
  products,
}: {
  title: string;
  products: MinimalProductData[];
}) {
  const [activeTab, setActiveTab] = useState("new");

  const filteredProducts = useMemo(() => {
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
  }, [activeTab]);

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

  return (
    <PromoSection
      title={title}
      items={filteredProducts}
      renderItem={(product) => (
        <ProductCard key={product.id} product={product} />
      )}
      tabs={tabs}
      isLoading={false}
      emptyState={
        <div className="text-center py-12">No products match this filter.</div>
      }
      itemsPerPageDesktop={5}
      itemsPerPageTablet={4}
      itemsPerPageMobile={2}
    />
  );
}
