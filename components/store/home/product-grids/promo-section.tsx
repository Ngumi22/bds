"use client";

import { type ReactNode } from "react";
import GridCarousel from "./grid-carousel";
import { Tab } from "./products-tabs";
import { ProductsHeader } from "./products-header";

interface PromoSectionProps<T> {
  title: string;
  subtitle?: string;
  viewAllUrl?: string;
  viewAllLabel?: string;

  items: T[];
  renderItem: (item: T, index: number) => ReactNode;

  tabs: Tab[];

  promoBanner?: ReactNode;
  promoBannerPosition?: "left" | "top" | "right" | "bottom";

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
}

export default function PromoSection<T>({
  title,
  subtitle,
  viewAllUrl,
  viewAllLabel = "View All",

  items,
  renderItem,

  tabs,

  promoBanner,
  promoBannerPosition = "left",

  itemsPerPageMobile = 2,
  itemsPerPageTablet = 2,
  itemsPerPageDesktop = 3,
  backgroundColor = "bg-gray-50",
  padding = "py-8 sm:py-12",
  maxWidth = "max-w-7xl",
  showArrows = true,
  showDots = true,
  gap = 16,

  isLoading = false,
  skeletonCount = 6,
  emptyState,
}: PromoSectionProps<T>) {
  const renderSkeleton = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={index}
        className="min-w-0 animate-pulse"
        style={{ scrollSnapAlign: "start" }}>
        <div className="bg-gray-200 rounded-lg aspect-3/4 mb-2"></div>
        <div className="bg-gray-200 rounded h-4 mb-2"></div>
        <div className="bg-gray-200 rounded h-3 w-2/3"></div>
      </div>
    ));
  };

  const renderedItems = items.map(renderItem);

  const carouselItems = isLoading ? renderSkeleton() : renderedItems;

  const hasItems = items.length > 0;
  const showEmptyState = !isLoading && !hasItems;
  const showCarousel = isLoading || hasItems;

  const getGridLayout = () => {
    if (!promoBanner) return "grid-cols-1";
    switch (promoBannerPosition) {
      case "left":
      case "right":
        return "grid-cols-1 lg:grid-cols-4";
      case "top":
      case "bottom":
      default:
        return "grid-cols-1";
    }
  };

  const getPromoBannerColumnSpan = () => {
    if (!promoBanner) return "lg:col-span-4";
    switch (promoBannerPosition) {
      case "left":
      case "right":
        return "lg:col-span-3";
      case "top":
      case "bottom":
      default:
        return "lg:col-span-4";
    }
  };

  const renderPromoBanner = () => {
    if (!promoBanner) return null;
    const bannerClasses = {
      left: "hidden lg:block order-1",
      right: "hidden lg:block order-2",
      top: "order-1 mb-4 sm:mb-6",
      bottom: "order-3 mt-4 sm:mt-6",
    };
    return (
      <div className={bannerClasses[promoBannerPosition]}>{promoBanner}</div>
    );
  };

  return (
    <section className={`${padding} ${backgroundColor}`}>
      <div className={`${maxWidth} mx-auto px-4 sm:px-6`}>
        <div className="mb-6 sm:mb-8">
          <ProductsHeader
            title={title}
            subtitle={subtitle}
            tabs={tabs}
            viewAllUrl={viewAllUrl}
            viewAllLabel={viewAllLabel}
            className="border-b-0 pb-0"
          />
        </div>

        <div className={`grid ${getGridLayout()} gap-4 sm:gap-6`}>
          {renderPromoBanner()}

          <div className={getPromoBannerColumnSpan()}>
            {showCarousel && (
              <GridCarousel
                items={carouselItems}
                itemsPerPageMobile={itemsPerPageMobile}
                itemsPerPageTablet={itemsPerPageTablet}
                itemsPerPageDesktop={itemsPerPageDesktop}
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
          </div>
        </div>
      </div>
    </section>
  );
}
