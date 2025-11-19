"use client";

import { useMemo, useState } from "react";
import { ProductsDisplay } from "./product-display";
import { MinimalProductData } from "@/lib/product/product.types";

interface Tab {
  id: string;
  label: string;
}

interface CollectionDisplay {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  products: MinimalProductData[];
  tabs?: Tab[];
}

interface DynamicHomeDisplayProps {
  collections: CollectionDisplay[];
}

export default function DynamicHomeDisplay({
  collections,
}: DynamicHomeDisplayProps) {
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  const handleTabClick = (collectionId: string, tabId: string) => {
    setActiveTabs((prev) => ({ ...prev, [collectionId]: tabId }));
  };

  const filterProductsByTab = (
    products: MinimalProductData[],
    tabId: string
  ) => {
    switch (tabId) {
      case "newest":
      case "newarrivals":
        return [...products].sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

      case "featured":
        return products.filter((p) => p.featured === true);

      case "hotdeals":
        return products.filter(
          (p) => p.originalPrice && p.price < p.originalPrice
        );

      default:
        return products;
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 md:py-12">
      <div className="px-4 mx-auto space-y-16">
        {collections.map((collection) => {
          const tabs = collection.tabs || [
            { id: "newest", label: "Newest" },
            { id: "featured", label: "Featured" },
            { id: "hotdeals", label: "Hot Deals" },
          ];

          const activeTabId = activeTabs[collection.id] || tabs[0].id;
          const filteredProducts = useMemo(
            () => filterProductsByTab(collection.products, activeTabId),
            [collection.products, activeTabId]
          );

          return (
            <ProductsDisplay
              key={collection.slug}
              header={{
                title: collection.title,
                tabs: tabs.map((tab) => ({
                  label: tab.label,
                  isActive: activeTabId === tab.id,
                  onClick: () => handleTabClick(collection.id, tab.id),
                })),
                viewAllUrl: `/collections/${collection.slug}`,
                viewAllLabel: "View All",
              }}
              grid={{
                products: filteredProducts,
                showNavigation: true,
              }}
            />
          );
        })}
      </div>
    </main>
  );
}
