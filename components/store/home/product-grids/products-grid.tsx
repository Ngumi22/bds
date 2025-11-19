"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinimalProductData } from "@/lib/product/product.types";
import ProductCard from "../product/product-card";

export interface ProductsGridProps {
  products: MinimalProductData[];
  showNavigation?: boolean;
  className?: string;
}

export function ProductsGrid({
  products,
  showNavigation = true,
  className,
}: ProductsGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollPage = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;

      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScroll();

    // Add listeners
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    // Cleanup listeners
    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]); // Re-run effect if products change

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto scroll-smooth pb-4",
          "snap-x snap-mandatory" // CSS Scroll Snap for native mobile scrolling
        )}>
        <div className="flex flex-nowrap gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "snap-start shrink-0",
                "w-[calc(50%-8px)]",
                "md:w-[calc(33.33%-12px)] lg:w-[calc(25%-18px)]"
              )}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* 1. SMALL SCREEN NAVIGATION: Circle Buttons (Visible on screens < md) */}
      {showNavigation && (
        <div className="flex justify-center gap-3 mt-4 px-4 md:hidden">
          <button
            onClick={() => scrollPage("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
              !canScrollLeft
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:opacity-90 cursor-pointer"
            )}
            aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollPage("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
              !canScrollRight
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:opacity-90 cursor-pointer"
            )}
            aria-label="Scroll right">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. LARGE SCREEN NAVIGATION: Absolute Chevron Buttons (Visible on screens >= md) */}
      {showNavigation && (
        <div className="hidden md:flex absolute inset-y-0 left-0 right-0">
          {" "}
          {/* FIX: Removed pointer-events-none */}
          {/* LEFT CHEVRON BUTTON */}
          <button
            onClick={() => scrollPage("left")}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10",
              // FIX: Removed pointer-events-auto from button, it's now implied by wrapper fix
              "-translate-x-1/2",
              "flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md transition-all",
              canScrollLeft
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Scroll left">
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          {/* RIGHT CHEVRON BUTTON */}
          <button
            onClick={() => scrollPage("right")}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10",
              // FIX: Removed pointer-events-auto from button
              "translate-x-1/2",
              "flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md transition-all",
              canScrollRight
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Scroll right">
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      )}
    </div>
  );
}
