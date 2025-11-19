"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "../product/product-card";
import { MinimalProductData } from "@/lib/product/product.types";
import CarouselClient from "@/components/shared/product-carousel";

export interface CollectionWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  collectionType: string;
  products: MinimalProductData[];
}

interface CollectionsDisplayProps {
  collections: CollectionWithProducts[];
  className?: string;
}

export function CollectionsDisplay({
  collections,
  className,
}: CollectionsDisplayProps) {
  const [activeCollection, setActiveCollection] =
    useState<CollectionWithProducts | null>(collections[0] || null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

  const handleCollectionChange = useCallback(
    (collection: CollectionWithProducts) => {
      setActiveCollection(collection);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, collection: CollectionWithProducts) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCollectionChange(collection);
      }
    },
    [handleCollectionChange]
  );

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
    if (tabsRef.current && tabsContainerRef.current && activeCollection) {
      const activeButton = tabsRef.current.querySelector(
        `[data-collection="${activeCollection.id}"]`
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
  }, [activeCollection]);

  const updateScrollButtons = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
      updateUnderline();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateUnderline();
      updateScrollButtons();
    });

    resizeObserver.observe(container);

    updateUnderline();
    updateScrollButtons();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons, updateUnderline]);

  useEffect(() => {
    if (activeCollection) {
      requestAnimationFrame(() => {
        updateUnderline();
        updateScrollButtons();
      });
    }
  }, [activeCollection, updateUnderline, updateScrollButtons]);

  const productCards = useMemo(() => {
    if (!activeCollection?.products?.length) return [];
    return activeCollection.products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ));
  }, [activeCollection]);

  if (!collections || collections.length === 0) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <section className="space-y-4">
          <div className="text-start space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold text-balance">
              Collections
            </h2>
            <p className="text-muted-foreground text-pretty">
              Explore our curated collections
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No collections available at the moment.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-start space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold text-balance">
              Collections
            </h2>
            <p className="text-muted-foreground text-pretty">
              Explore our curated collections
            </p>
          </div>
          <Link href="/collections">
            <Button
              variant="ghost"
              className="shrink-0 bg-transparent hover:underline hover:underline-offset-4">
              See all Collections <ArrowRight className="h-4 w-4 ml-4" />
            </Button>
          </Link>
        </div>

        {/* Tabs */}
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
              className="flex-1 overflow-x-auto scrollbar-hide mx-8 md:mx-0">
              <div
                ref={tabsRef}
                className="flex justify-start md:justify-center gap-6 md:gap-8 relative min-w-max px-2">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    data-collection={collection.id}
                    onClick={() => setActiveCollection(collection)}
                    onKeyDown={(e) => handleKeyDown(e, collection)}
                    role="tab"
                    aria-selected={activeCollection?.id === collection.id}
                    aria-controls={`items-${collection.id}`}
                    tabIndex={activeCollection?.id === collection.id ? 0 : -1}
                    className={cn(
                      "relative px-3 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      "hover:text-black rounded-sm",
                      activeCollection?.id === collection.id
                        ? "text-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}>
                    {collection.name}
                  </button>
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

        {/* Product Carousel */}
        {activeCollection && activeCollection.products.length > 0 ? (
          <CarouselClient
            items={productCards}
            itemsPerPageMobile={2}
            itemsPerPageTablet={3}
            itemsPerPageDesktop={5}
            gap={16}
            showArrows
            showDots
          />
        ) : (
          <div className="text-start py-12">
            <p className="text-muted-foreground">
              No products found in this collection.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
