"use client";

import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback, useMemo } from "react";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

interface Tab {
  id: string;
  label: string;
}

interface BannerConfig {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  image?: string;
}

interface CollectionSectionProps {
  title: string;
  subtitle?: string;
  tabs?: Tab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  items: MinimalProductData[];
  banner?: BannerConfig;
  showBanner?: boolean;
  onViewAll?: () => void;
  onQuickAdd?: (itemId: string) => void;
  onItemClick?: (itemId: string) => void;
  cardsPerPage?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  hideScrollButtons?: boolean;
  customCardComponent?: React.ComponentType<any>;
}

export default function CollectionSection({
  title,
  subtitle,
  tabs,
  activeTabId,
  onTabChange,
  items,
  banner,
  showBanner = true,
  onViewAll,
  onQuickAdd,
  onItemClick,
  cardsPerPage = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  hideScrollButtons = false,
  customCardComponent: CustomCardComponent,
}: CollectionSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

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

  const handleTabClick = useCallback(
    (tabId: string) => {
      onTabChange?.(tabId);

      const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect();
        const containerRect = tabsContainerRef.current?.getBoundingClientRect();
        if (containerRect) {
          setUnderlineStyle({
            width: rect.width,
            left: rect.left - containerRect.left,
          });
        }
      }
    },
    [onTabChange]
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
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const shouldShowPagination = totalPages > 1;

  const memoizedItems = useMemo(() => items, [items]);
  const CardComponent = CustomCardComponent || ProductCard;

  return (
    <div className="w-full space-y-6 md:space-y-8">
      {/* Banner Section */}
      {showBanner && banner && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* CTA Section */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {banner.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                {banner.description}
              </p>
            </div>
            <button
              onClick={banner.onCtaClick}
              className="w-full md:w-auto px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded hover:bg-gray-900 hover:text-white transition-colors duration-200">
              {banner.ctaLabel}
            </button>
          </div>

          {/* Image Section */}
          {banner.image && (
            <div className="bg-gray-200 rounded-lg overflow-hidden hidden lg:block">
              <img
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Header with Tabs and View All */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ml-4">
              View All
            </button>
          )}
        </div>

        {tabs && tabs.length > 0 && (
          <div className="relative">
            <div
              ref={tabsContainerRef}
              className="flex gap-4 md:gap-8 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`text-sm md:text-base font-medium whitespace-nowrap transition-colors duration-200 pb-3 ${
                    activeTabId === tab.id
                      ? "text-gray-900 md:text-blue-600"
                      : "text-gray-600 hover:text-gray-900 md:hover:text-gray-700"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className="hidden md:block absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300 ease-out"
              style={underlineStyle}></div>
          </div>
        )}
      </div>

      {/* Blue Underline */}
      <div className="h-1 bg-blue-600 w-24 md:w-32"></div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow - Desktop */}
        {!hideScrollButtons && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 lg:left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Products Scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          className="flex gap-3 md:gap-4 overflow-x-auto px-0 pb-12 md:pb-0 scrollbar-hide scroll-smooth">
          {memoizedItems.map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-1/2 md:w-1/3 lg:w-1/4"
              onClick={() => onItemClick?.(item.id)}>
              <CardComponent product={item} />
            </div>
          ))}
        </div>

        {/* Right Arrow - Desktop */}
        {!hideScrollButtons && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 lg:right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        )}

        {/* Mobile Scroll Buttons - Bottom Center */}
        {!hideScrollButtons && shouldShowPagination && (
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
    </div>
  );
}
