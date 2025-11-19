"use client";

import type React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback, useMemo } from "react";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

interface CategoryScrollProps {
  title: string;
  subtitle?: string;
  items: MinimalProductData[];
  onQuickAdd?: (itemId: string) => void;
  onViewAll?: () => void;
  showScrollButtons?: boolean;
}

export default function CategoryScroll({
  title,
  subtitle,
  items,
  onViewAll,
  showScrollButtons = true,
}: CategoryScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600 mt-1">
              {subtitle}
            </p>
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
        {/* Left Arrow */}
        {showScrollButtons && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Items Scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-12 pb-12 md:pb-0 scrollbar-hide scroll-smooth">
          {memoizedItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>

        {/* Right Arrow */}
        {showScrollButtons && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        )}

        {/* Mobile Scroll Buttons - Bottom Center */}
        {showScrollButtons && (
          <div className="md:hidden flex justify-center gap-2 pt-4 px-4">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Scroll left">
                <ChevronLeft size={20} />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Scroll right">
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
