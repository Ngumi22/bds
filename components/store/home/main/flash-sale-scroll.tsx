"use client";

import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback, useMemo } from "react";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/actions/product-filter";

interface FlashSaleScrollProps {
  title?: string;
  timeRemaining?: string;
  products: MinimalProductData[];
  onQuickAdd?: (productId: string) => void;
  onViewAll?: () => void;
}

export default function FlashSaleScroll({
  title = "FLASH DEALS",
  timeRemaining,
  products,
  onViewAll,
}: FlashSaleScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    },
    [checkScroll]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      scroll(e.deltaY > 0 ? "right" : "left");
    },
    [scroll]
  );

  const handlePaginationClick = useCallback((page: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.children[0] as HTMLElement;
    if (!cardWidth) return;

    const scrollAmount = (cardWidth.offsetWidth + 12) * 2 * page;
    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });

    setCurrentPage(page);
  }, []);

  const itemsPerPage = 2;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const shouldShowPagination = totalPages > 1;

  const memoizedProducts = useMemo(() => products, [products]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-2xl font-bold text-red-600">
            {title}
          </h2>
          {timeRemaining && (
            <div className="border-2 border-red-600 px-3 py-1 text-xs md:text-sm font-semibold text-red-600 rounded">
              {timeRemaining}
            </div>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm md:text-base font-medium transition-colors">
            View All
          </button>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow - Desktop Only */}
        {!canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-12 pb-4 md:pb-0 scrollbar-hide scroll-smooth">
          {memoizedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow - Desktop Only */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        )}

        {shouldShowPagination && (
          <div className="md:hidden flex justify-center gap-2 pt-4 px-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePaginationClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentPage === index
                    ? "bg-gray-900 w-3"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
                aria-current={currentPage === index}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
