"use client";

import { type ReactNode } from "react";
import { Tab } from "./producs-tabs";
import { ProductsHeader } from "./grid-header";
import CarouselClient from "@/components/shared/product-carousel";

interface PromoSectionProps<T> {
  title: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  tabs: Tab[];
  promoBanner?: ReactNode;
  promoBannerPosition?: "left" | "right";

  itemsPerPageMobile?: number;
  itemsPerPageTablet?: number;
  itemsPerPageDesktop?: number;

  backgroundColor?: string;
  padding?: string;
  maxWidth?: string;
  showArrows?: boolean;
  showDots?: boolean;
  gap?: number;
  isLoading?: boolean;
  skeletonCount?: number;
  emptyState?: ReactNode;
  error?: ReactNode;
}

export default function PromoSection<T>({
  title,
  viewAllUrl,
  viewAllLabel = "View All",
  items,
  renderItem,
  tabs,
  promoBanner,
  promoBannerPosition = "left",

  itemsPerPageMobile = 2,
  itemsPerPageTablet = 3,
  itemsPerPageDesktop = 4,

  backgroundColor = "bg-white",
  padding = "py-4 md:py-8",
  maxWidth = "max-w-full",
  showArrows = true,
  showDots = true,
  gap = 16,
  isLoading = false,
  skeletonCount,
  emptyState,
  error,
}: PromoSectionProps<T>) {
  const hasSideBanner = !!promoBanner;

  const carouselItemsPerPageMobile = itemsPerPageMobile;
  const carouselItemsPerPageTablet = hasSideBanner ? 3 : itemsPerPageTablet;
  const carouselItemsPerPageDesktop = hasSideBanner ? 4 : itemsPerPageDesktop;

  const carouselSkeletonCount = skeletonCount || carouselItemsPerPageDesktop;

  const renderSkeleton = () => {
    return Array.from({ length: carouselSkeletonCount }).map((_, index) => (
      <div
        key={index}
        className="min-w-0 h-full flex flex-col"
        style={{ scrollSnapAlign: "start" }}>
        <div className="animate-pulse flex-1 flex flex-col">
          <div className="bg-gray-200 rounded-lg flex-1 mb-3"></div>
          <div className="bg-gray-200 rounded h-4 mb-2 w-3/4"></div>
          <div className="bg-gray-200 rounded h-3 w-1/2"></div>
        </div>
      </div>
    ));
  };

  const renderedItems = items.map(renderItem);
  const carouselItems = isLoading ? renderSkeleton() : renderedItems;

  const hasItems = items.length > 0;
  const showEmptyState = !isLoading && !hasItems && !error;
  const showError = !isLoading && error;
  const showCarousel = (isLoading || hasItems) && !error;

  const renderPromoBanner = () => {
    if (!promoBanner) return null;

    return (
      <div className="hidden md:block w-64 lg:w-72 shrink-0  h-85">
        {promoBanner}
      </div>
    );
  };

  const renderContentArea = () => {
    if (showError) {
      return (
        <div className="h-full flex items-center justify-center">{error}</div>
      );
    }

    if (showEmptyState) {
      return (
        <div className="h-full flex items-center justify-center">
          {emptyState || (
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No items found</div>
              <p className="text-sm">Try selecting a different category</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <CarouselClient
        items={carouselItems}
        itemsPerPageDesktop={carouselItemsPerPageDesktop}
        itemsPerPageTablet={carouselItemsPerPageTablet}
        itemsPerPageMobile={carouselItemsPerPageMobile}
        showArrows={showArrows && !isLoading}
        showDots={showDots && !isLoading}
        gap={gap}
      />
    );
  };

  return (
    <section className={`${padding} ${backgroundColor}`}>
      <div className={`${maxWidth} mx-auto`}>
        <ProductsHeader
          title={title}
          tabs={tabs}
          viewAllUrl={viewAllUrl}
          viewAllLabel={viewAllLabel}
          className="border-b pb-0"
        />

        <div className="block md:hidden">
          {showCarousel && (
            <CarouselClient
              items={carouselItems}
              itemsPerPageDesktop={itemsPerPageDesktop}
              itemsPerPageTablet={itemsPerPageTablet}
              itemsPerPageMobile={itemsPerPageMobile}
              showArrows={showArrows && !isLoading}
              showDots={showDots && !isLoading}
              gap={gap}
            />
          )}
          {showEmptyState &&
            (emptyState || (
              <div className="text-center py-12 text-gray-500">
                No items found
              </div>
            ))}
          {showError && error}
        </div>

        <div className="hidden md:flex gap-6 h-80">
          {promoBanner && promoBannerPosition === "left" && renderPromoBanner()}

          <div className="flex-1 min-w-0 h-full">{renderContentArea()}</div>

          {promoBanner &&
            promoBannerPosition === "right" &&
            renderPromoBanner()}
        </div>
      </div>
    </section>
  );
}
