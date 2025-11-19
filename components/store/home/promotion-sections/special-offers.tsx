"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

export type ProductWithDiscount = MinimalProductData & {
  discountPercentage: number;
};

export interface CategoryWithDiscountedProducts {
  id: string;
  name: string;
  slug: string;
  products: ProductWithDiscount[];
}

interface SpecialOffersProps {
  categoriesWithProducts: CategoryWithDiscountedProducts[];
  className?: string;
}

export function SpecialOffers({
  categoriesWithProducts,
  className,
}: SpecialOffersProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithDiscountedProducts | null>(
      categoriesWithProducts[0] || null
    );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleCategoryChange = useCallback(
    (category: CategoryWithDiscountedProducts) => {
      setActiveCategory(category);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, category: CategoryWithDiscountedProducts) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCategoryChange(category);
      }
    },
    [handleCategoryChange]
  );

  const updateScrollButtons = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollTabs = useCallback((direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? tabsContainerRef.current.scrollLeft - scrollAmount
          : tabsContainerRef.current.scrollLeft + scrollAmount;

      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  }, []);

  const updateUnderline = useCallback(() => {
    if (tabsRef.current && tabsContainerRef.current && activeCategory) {
      const activeButton = tabsRef.current.querySelector(
        `[data-category="${activeCategory.id}"]`
      ) as HTMLElement;
      if (activeButton) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const { scrollLeft } = tabsContainerRef.current;

        setUnderlineStyle({
          left: buttonRect.left - containerRect.left + scrollLeft,
          width: buttonRect.width,
        });
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
      updateUnderline();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    resizeObserverRef.current = new ResizeObserver(() => {
      updateUnderline();
      updateScrollButtons();
    });

    resizeObserverRef.current.observe(container);
    updateUnderline();
    updateScrollButtons();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserverRef.current?.disconnect();
    };
  }, [updateScrollButtons, updateUnderline]);

  useEffect(() => {
    if (activeCategory) {
      requestAnimationFrame(() => {
        updateUnderline();
        updateScrollButtons();
      });
    }
  }, [activeCategory, updateUnderline, updateScrollButtons]);

  const productCards = useMemo(() => {
    const productsToShow = activeCategory ? activeCategory.products : [];

    return productsToShow.map((product: ProductWithDiscount) => (
      <ProductCard key={product.id} product={product} />
    ));
  }, [activeCategory]);

  if (!categoriesWithProducts || categoriesWithProducts.length === 0) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <section className="space-y-4">
          <div className="text-start space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold text-balance">
              Special Offers
            </h2>
            <p className="text-muted-foreground text-pretty">
              Exclusive discounts on premium electronics
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No special offers available at the moment.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <section className="space-y-4">
        <div className="text-start space-y-2">
          <h2 className="text-lg md:text-2xl font-semibold text-balance">
            Special Offers
          </h2>
          <p className="text-muted-foreground text-pretty">
            Exclusive discounts on premium electronics
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs("left")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              ref={tabsContainerRef}
              className="flex-1 overflow-x-auto scrollbar-hide mx-8 md:mx-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div
                ref={tabsRef}
                className="flex justify-start md:justify-center gap-6 md:gap-8 relative min-w-max px-2">
                {categoriesWithProducts.map((category) => (
                  <Button
                    key={category.id}
                    data-category={category.id}
                    onClick={() => handleCategoryChange(category)}
                    onKeyDown={(e) => handleKeyDown(e, category)}
                    role="tab"
                    aria-selected={activeCategory?.id === category.id}
                    aria-controls={`products-${category.id}`}
                    tabIndex={activeCategory?.id === category.id ? 0 : -1}
                    className={cn(
                      "relative px-3 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      "hover:text-black rounded-sm",
                      activeCategory?.id === category.id
                        ? "text-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}>
                    {category.name}
                  </Button>
                ))}

                <div
                  className="absolute bottom-0 h-0.5 bg-black rounded-full transition-all duration-200 ease-out"
                  style={{
                    left: `${underlineStyle.left}px`,
                    width: `${underlineStyle.width}px`,
                  }}
                />
              </div>
            </div>

            {canScrollRight && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs("right")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {activeCategory && (
          <div
            id={`products-${activeCategory.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeCategory.id}`}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {productCards}
          </div>
        )}

        {activeCategory && activeCategory.products.length === 0 && (
          <div className="text-start py-12">
            <p className="text-muted-foreground">
              No discounted products found in this category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
