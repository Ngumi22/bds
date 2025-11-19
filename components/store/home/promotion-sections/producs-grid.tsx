"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tab as TabUI } from "./tabs";
import { ProductsHeader } from "./grid-header";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

export interface ProductGridTab {
  label: string;
  value: string;
  isActive?: boolean;
  filterFn: (product: MinimalProductData) => boolean;
}

export interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: MinimalProductData[];
  tabs: ProductGridTab[];
  onTabChange?: (activeTab: ProductGridTab) => void;
  renderCard?: (product: Record<string, any>) => React.ReactNode;
  viewAllUrl?: string;
  viewAllLabel?: string;
  className?: string;
  gridCols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xl?: number;
  };
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function ProductGrid({
  title,
  subtitle,
  products,
  tabs,
  onTabChange,
  renderCard,
  viewAllUrl,
  viewAllLabel = "View All",
  className,
  gridCols = { mobile: 2, tablet: 3, desktop: 4, xl: 5 },
  gap = 4,
  showArrows = true,
  showDots = true,
}: ProductGridProps) {
  const [activeTabValue, setActiveTabValue] = useState<string>(() => {
    const activeTab = tabs.find((tab) => tab.isActive);
    return activeTab?.value || (tabs.length > 0 ? tabs[0].value : "");
  });

  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [isScrollable, setIsScrollable] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    "left" | "right" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollLeftRef = useRef(0);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.value === activeTabValue),
    [tabs, activeTabValue]
  );

  const filteredProducts = useMemo(() => {
    if (!activeTab || typeof activeTab.filterFn !== "function") {
      return products;
    }
    return products.filter(activeTab.filterFn);
  }, [products, activeTab]);

  const handleTabClick = (tabValue: string) => {
    setActiveTabValue(tabValue);

    const newActiveTab = tabs.find((t) => t.value === tabValue);
    if (newActiveTab) {
      onTabChange?.(newActiveTab);
    }

    setCurrentPage(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const cardElement = scrollContainerRef.current.querySelector(
      "[data-carousel-item]"
    );
    if (!cardElement) return;

    const cardWidth = cardElement.clientWidth;
    const gapPixels = gap * 4;

    if (scrollLeft > lastScrollLeftRef.current) {
      setScrollDirection("right");
    } else if (scrollLeft < lastScrollLeftRef.current) {
      setScrollDirection("left");
    }
    lastScrollLeftRef.current = scrollLeft;

    const calculatedPage = Math.round(
      scrollLeft / (cardWidth + gapPixels) / itemsPerPage
    );
    setCurrentPage(
      Math.max(
        0,
        Math.min(
          calculatedPage,
          Math.ceil(filteredProducts.length / itemsPerPage) - 1
        )
      )
    );

    const hasOverflow = scrollWidth > clientWidth;
    setIsScrollable(hasOverflow);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();

    const handleScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(updateScrollState, 50);
    };

    container.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [filteredProducts.length, itemsPerPage, gap]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(gridCols.mobile || 2);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(gridCols.tablet || 3);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(gridCols.desktop || 4);
      } else {
        setItemsPerPage(gridCols.xl || 5);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [gridCols]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    setScrollDirection(direction);

    const cardElement = scrollContainerRef.current.querySelector(
      "[data-carousel-item]"
    );
    const cardWidth = cardElement?.clientWidth || 0;
    const gapPixels = gap * 4;
    const scrollDistance = (cardWidth + gapPixels) * itemsPerPage;

    if (direction === "left") {
      scrollContainerRef.current.scrollBy({
        left: -scrollDistance,
        behavior: "smooth",
      });
    } else {
      scrollContainerRef.current.scrollBy({
        left: scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const handleDotClick = (index: number) => {
    if (!scrollContainerRef.current) return;

    const direction = index > currentPage ? "right" : "left";
    setScrollDirection(direction);

    const cardElement = scrollContainerRef.current.querySelector(
      "[data-carousel-item]"
    );
    const cardWidth = cardElement?.clientWidth || 0;
    const gapPixels = gap * 4;
    const scrollDistance = (cardWidth + gapPixels) * itemsPerPage * index;
    scrollContainerRef.current.scrollTo({
      left: scrollDistance,
      behavior: "smooth",
    });
  };

  const tabsForHeader: TabUI[] = tabs.map((tab) => ({
    label: tab.label,
    value: tab.value,
    isActive: activeTabValue === tab.value,
    onClick: () => handleTabClick(tab.value),
  }));

  const gapClass =
    {
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
    }[gap] || `gap-${gap}`;

  return (
    <section className={className}>
      <ProductsHeader
        title={title}
        subtitle={subtitle}
        tabs={tabsForHeader}
        viewAllUrl={viewAllUrl}
        viewAllLabel={viewAllLabel}
        className="mb-6 sm:mb-8"
      />

      {filteredProducts.length > 0 ? (
        <div className="w-full">
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}>
              <div className={`flex gap-4 md:gap-6 pb-4 w-fit`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    data-carousel-item
                    className={`shrink-0 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 transition-all duration-500 ease-out ${
                      scrollDirection === "right"
                        ? "animate-slide-in-right animate-fade-in"
                        : scrollDirection === "left"
                        ? "animate-slide-in-left animate-fade-in"
                        : ""
                    }`}
                    style={{ scrollSnapAlign: "start" }}>
                    {renderCard ? (
                      renderCard(product)
                    ) : (
                      <ProductCard product={product} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {showArrows && isScrollable && (
              <>
                <button
                  onClick={() => handleScroll("left")}
                  className={`hidden lg:flex absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg transition z-10 ${
                    canScrollLeft
                      ? "hover:bg-gray-100 cursor-pointer opacity-100"
                      : "opacity-30 cursor-not-allowed pointer-events-none"
                  }`}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left">
                  <ChevronLeft className="w-5 h-5 text-gray-900" />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className={`hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg transition z-10 ${
                    canScrollRight
                      ? "hover:bg-gray-100 cursor-pointer opacity-100"
                      : "opacity-30 cursor-not-allowed pointer-events-none"
                  }`}
                  disabled={!canScrollRight}
                  aria-label="Scroll right">
                  <ChevronRight className="w-5 h-5 text-gray-900" />
                </button>
              </>
            )}
          </div>

          {showDots && isScrollable && (
            <div className="flex lg:hidden justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPage
                      ? "bg-gray-900 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No products found</div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
