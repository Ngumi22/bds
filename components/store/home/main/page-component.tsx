"use client";

import { useState, useMemo } from "react";
import CollectionSection from "./collection-section";
import { useRouter } from "next/navigation";
import { MinimalProductData } from "@/lib/product/product.types";

interface HomeClientProps {
  featuredProducts: MinimalProductData[];
  laptopProducts: MinimalProductData[];
  phoneProducts: MinimalProductData[];
}

export default function HomeClient({
  featuredProducts,
  laptopProducts,
  phoneProducts,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState("new");
  const router = useRouter();

  const memoizedFeaturedProducts = useMemo(
    () => featuredProducts,
    [featuredProducts]
  );
  const memoizedLaptopProducts = useMemo(
    () => laptopProducts,
    [laptopProducts]
  );
  const memoizedPhoneProducts = useMemo(() => phoneProducts, [phoneProducts]);

  const CATEGORY_TABS = [
    { id: "new", label: "New Products" },
    { id: "best", label: "Best Sellers" },
    { id: "featured", label: "Featured Products" },
  ];

  const BANNER_CONFIG = {
    title: "Cosmopolis",
    description: "Huge Saving on Computers & Laptops",
    ctaLabel: "SHOP NOW",
    onCtaClick: () => console.log("Shop Now clicked"),
    image: "/modern-laptop.png",
  };

  return (
    <main className="bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-16 md:space-y-20">
        <CollectionSection
          title="COMPUTERS & LAPTOPS"
          tabs={CATEGORY_TABS}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          items={memoizedLaptopProducts}
          banner={BANNER_CONFIG}
          showBanner={true}
          onViewAll={() => router.push("/products")}
          cardsPerPage={{
            mobile: 2,
            tablet: 3,
            desktop: 4,
          }}
        />

        <CollectionSection
          title="PHONES AND TABLETS"
          subtitle="Latest tech products"
          items={memoizedPhoneProducts}
          onViewAll={() => router.push("/products")}
          showBanner={false}
        />

        <CollectionSection
          title="FEATURED ITEMS"
          tabs={[
            { id: "all", label: "All" },
            { id: "sale", label: "On Sale" },
            { id: "trending", label: "Trending" },
          ]}
          activeTabId="all"
          onTabChange={(id) => console.log("Tab changed to:", id)}
          items={memoizedFeaturedProducts}
          onViewAll={() => router.push("/products")}
          hideScrollButtons={false}
        />
      </div>
    </main>
  );
}
