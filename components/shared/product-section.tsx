"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinimalProductData } from "@/lib/product/product.types";

import { EmptyCard, ProductCard } from "./product-card";

export interface VariantOption {
  id: string;
  name: string;
  inStock: boolean;
  color?: string;
  priceModifier?: number;
}

export interface VariantType {
  name: string;
  options: VariantOption[];
}

export interface ProductQuickViewProps extends MinimalProductData {
  originalPrice: number | null;
  images: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string;
  shipping?: {
    freeShipping?: boolean;
    estimatedDays?: number;
  };
  guarantee?: string;
  inStock?: boolean;
  variantTypes?: VariantType[];
  viewingNow?: number;
}

export interface ProductCollection {
  id: string;
  name: string;
  slug: string;
}

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
}: ProductSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap sm:flex-nowrap">
      <h2 className="text-lg font-semibold transition-colors uppercase tracking-wide">
        {title}
      </h2>

      <div className="flex items-center justify-between gap-4 uppercase">
        {tabs && tabs.length > 0 ? (
          <div className="flex items-center text-xs font-medium tracking-wider">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                {index > 0 && <span className="text-gray-300 mx-1">|</span>}
                <button
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "p-1 transition-colors whitespace-nowrap text-sm",
                    activeTab === tab.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:text-black"
                  )}
                  aria-label={`Filter by ${tab.label}`}>
                  {tab.label}
                </button>
              </React.Fragment>
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
              "p-1.5 border border-gray-200 transition-colors",
              canScrollLeft
                ? "text-black hover:border-gray-400 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            )}
            aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onScrollRight}
            disabled={!canScrollRight}
            className={cn(
              "p-1.5 border border-gray-200 transition-colors",
              canScrollRight
                ? "text-black hover:border-gray-400 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
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
}

export const ProductGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  ({ products, onScrollChange, scrollTrigger }, ref) => {
    const [loadedProducts, setLoadedProducts] = React.useState<Set<string>>(
      new Set()
    );
    const observerRef = React.useRef<IntersectionObserver | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(
      ref,
      () => containerRef.current as HTMLDivElement
    );

    const updateScrollButtons = React.useCallback(() => {
      if (!containerRef.current || !onScrollChange) return;

      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;

      onScrollChange(canScrollLeft, canScrollRight);
    }, [onScrollChange]);

    React.useEffect(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const productId = entry.target.getAttribute("data-product-id");
              if (productId) {
                setLoadedProducts((prev) => new Set(prev).add(productId));
              }
            }
          });
        },
        {
          rootMargin: "50px",
        }
      );

      return () => {
        observerRef.current?.disconnect();
      };
    }, []);

    React.useEffect(() => {
      if (!observerRef.current) return;

      const cards = containerRef.current?.querySelectorAll(".product-card");
      cards?.forEach((card) => {
        observerRef.current?.observe(card);
      });

      return () => {
        cards?.forEach((card) => {
          observerRef.current?.unobserve(card);
        });
      };
    }, [products]);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      updateScrollButtons();

      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }, [updateScrollButtons]);

    React.useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
      setLoadedProducts(new Set());
    }, [scrollTrigger]);

    return (
      <>
        <div
          ref={containerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
          {products.length > 0
            ? products.map((product, index) => (
                <div
                  key={product.id}
                  data-product-id={product.id}
                  className="product-card shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]"
                  style={{
                    animation: loadedProducts.has(product.id)
                      ? `slideIn 0.4s ease-out ${index * 0.05}s both`
                      : "none",
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
                  className="shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
                  <EmptyCard />
                </div>
              ))}
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
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
  filterKey?: keyof MinimalProductData;
}

export function ProductSection({
  config,
  products,
  filterKey,
}: ProductSectionProps) {
  const [activeTab, setActiveTab] = React.useState<string>(
    config.tabs?.[0]?.id || ""
  );
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [scrollTrigger, setScrollTrigger] = React.useState(0);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const filteredProducts = React.useMemo(() => {
    if (!config.tabs || !activeTab || !filterKey) {
      return products;
    }
    return products.filter((product) => product[filterKey] === activeTab);
  }, [products, activeTab, config.tabs, filterKey]);

  const handleScroll = React.useCallback((direction: "left" | "right") => {
    if (!gridRef.current) return;

    const container = gridRef.current;
    const cardWidth =
      container.querySelector(".product-card")?.clientWidth || 200;
    const gap = 16;
    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile
      ? (cardWidth + gap) * 2
      : (cardWidth + gap) * 3;

    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  const handleScrollChange = React.useCallback(
    (left: boolean, right: boolean) => {
      setCanScrollLeft(left);
      setCanScrollRight(right);
    },
    []
  );

  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
    setScrollTrigger((prev) => prev + 1);
  }, []);

  return (
    <section className="w-full py-2 md:py-6">
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

      <ProductGrid
        ref={gridRef}
        products={filteredProducts}
        onScrollChange={handleScrollChange}
        scrollTrigger={scrollTrigger}
      />
    </section>
  );
}
