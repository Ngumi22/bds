"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinimalProductData } from "@/lib/product/product.types";
import { EmptyCard, ProductCard } from "./product-card";
import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export interface TabConfig {
  id: string;
  label: string;
}

export interface ProductSectionConfig {
  title: string;
  tabs?: TabConfig[];
  icon?: React.ReactNode;
}

interface ProductSectionHeaderProps {
  title: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  icon?: React.ReactNode;
}

export function ProductSectionHeader({
  title,
  tabs,
  activeTab,
  onTabChange,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  icon,
}: ProductSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap sm:flex-nowrap">
      {/* Title Section */}
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-900">{icon}</span>}
        <h2 className="text-base md:text-lg font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
      </div>

      <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
        {tabs && tabs.length > 0 ? (
          <div className="flex items-center text-xs font-normal tracking-wider overflow-x-auto no-scrollbar">
            {tabs.map((tab, index) => (
              <Fragment key={tab.id}>
                {index > 0 && (
                  <span className="text-gray-300 mx-1 md:mx-2">|</span>
                )}
                <button
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "py-1 px-1 md:px-2 rounded-xs transition-colors whitespace-nowrap text-xs md:text-sm",
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                  aria-label={`Filter by ${tab.label}`}>
                  {tab.label.split(" ")[0]}
                </button>
              </Fragment>
            ))}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            className={cn(
              "p-1.5 border border-gray-200 transition-colors rounded-sm",
              canScrollLeft
                ? "text-gray-900 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed bg-gray-50/50"
            )}
            aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onScrollRight}
            disabled={!canScrollRight}
            className={cn(
              "p-1.5 border border-gray-200 transition-colors rounded-sm",
              canScrollRight
                ? "text-gray-900 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed bg-gray-50/50"
            )}
            aria-label="Scroll right">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: MinimalProductData[];
  onScrollChange?: (canScrollLeft: boolean, canScrollRight: boolean) => void;
  scrollTrigger?: number;
  hasBanner?: boolean;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  ({ products, onScrollChange, scrollTrigger, hasBanner = false }, ref) => {
    const [loadedProducts, setLoadedProducts] = useState<Set<string>>(
      new Set()
    );
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const updateScrollButtons = useCallback(() => {
      if (!containerRef.current || !onScrollChange) return;

      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const canScrollLeft = scrollLeft > 1;
        const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

        onScrollChange(canScrollLeft, canScrollRight);
      });
    }, [onScrollChange]);

    useEffect(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const productId = entry.target.getAttribute("data-product-id");
              if (productId) {
                setLoadedProducts((prev) => {
                  if (prev.has(productId)) return prev;
                  return new Set(prev).add(productId);
                });
                observerRef.current?.unobserve(entry.target);
              }
            }
          });
        },
        {
          rootMargin: "50px",
          threshold: 0.1,
        }
      );

      return () => {
        observerRef.current?.disconnect();
      };
    }, []);

    useEffect(() => {
      if (!observerRef.current || !containerRef.current) return;

      const wrappers = containerRef.current.querySelectorAll(
        ".product-card-wrapper"
      );
      wrappers.forEach((wrapper) => {
        observerRef.current?.observe(wrapper);
      });

      return () => {
        observerRef.current?.disconnect();
      };
    }, [products]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      updateScrollButtons();

      container.addEventListener("scroll", updateScrollButtons, {
        passive: true,
      });
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }, [updateScrollButtons]);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ left: 0, behavior: "instant" });
      }
      setLoadedProducts(new Set());
    }, [scrollTrigger]);

    const desktopClass = hasBanner
      ? "lg:w-[calc(25%-18px)]"
      : "lg:w-[calc(20%-19.2px)]";

    return (
      <>
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
          {products.length > 0
            ? products.map((product, index) => (
                <div
                  key={product.id}
                  data-product-id={product.id}
                  className={cn(
                    "product-card-wrapper shrink-0",
                    "w-[calc(50%-8px)]",
                    "sm:w-[calc(33.333%-16px)]",
                    desktopClass
                  )}
                  style={{
                    animation: loadedProducts.has(product.id)
                      ? `slideIn 0.4s ease-out ${index * 0.05}s both`
                      : "opacity-0",
                  }}>
                  <ProductCard
                    product={product}
                    isLoaded={loadedProducts.has(product.id)}
                  />
                </div>
              ))
            : [...Array(5)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className={cn(
                    "shrink-0",
                    "w-[calc(50%-8px)]",
                    "sm:w-[calc(33.333%-16px)]",
                    desktopClass
                  )}>
                  <EmptyCard />
                </div>
              ))}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

interface ProductSectionProps {
  config: ProductSectionConfig;
  products: MinimalProductData[];
  filterKey?: keyof MinimalProductData | (string & {});
  banner?: React.ReactNode;
}

export function ProductSection({
  config,
  products,
  filterKey,
  banner,
}: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(
    config.tabs?.[0]?.id || ""
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!config.tabs || !activeTab || !filterKey) {
      return products;
    }
    return products.filter(
      (product) => (product as any)[filterKey] === activeTab
    );
  }, [products, activeTab, config.tabs, filterKey]);

  const handleScroll = useCallback((direction: "left" | "right") => {
    if (!gridRef.current) return;

    const container = gridRef.current;
    const firstCard = container.querySelector(".product-card-wrapper");
    const cardWidth = firstCard ? firstCard.clientWidth : 250;
    const gap = 16;

    const isMobile = window.innerWidth < 768;
    const scrollMultiplier = isMobile ? 2 : 3;
    const scrollAmount = (cardWidth + gap) * scrollMultiplier;

    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  const handleScrollChange = useCallback((left: boolean, right: boolean) => {
    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setScrollTrigger((prev) => prev + 1);
  }, []);

  return (
    <section className="w-full py-2 md:py-6 group/section relative">
      <ProductSectionHeader
        title={config.title}
        tabs={config.tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollLeft={() => handleScroll("left")}
        onScrollRight={() => handleScroll("right")}
        icon={config.icon}
      />

      <div className="flex gap-0 lg:gap-6">
        {banner && (
          <div className="hidden lg:block shrink-0 w-[25%] mb-4">{banner}</div>
        )}

        <div className="flex-1 min-w-0">
          <ProductGrid
            ref={gridRef}
            products={filteredProducts}
            onScrollChange={handleScrollChange}
            scrollTrigger={scrollTrigger}
            hasBanner={!!banner}
          />
        </div>
      </div>
    </section>
  );
}
