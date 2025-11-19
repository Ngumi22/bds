"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GridCarouselProps {
  items: ReactNode[];
  itemsPerPageMobile?: number;
  itemsPerPageTablet?: number;
  itemsPerPageDesktop?: number;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  autoScroll?: boolean;
}

export default function GridCarousel({
  items,
  itemsPerPageMobile = 2,
  itemsPerPageTablet = 2,
  itemsPerPageDesktop = 3,
  gap = 16,
  showArrows = true,
  showDots = true,
  autoScroll = false,
}: GridCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageMobile);
  const [isScrollable, setIsScrollable] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    "left" | "right" | null
  >(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollLeftRef = useRef(0);

  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const cardElement = scrollContainerRef.current.querySelector(
      "[data-carousel-item]"
    );
    if (!cardElement) return;

    const cardWidth = cardElement.clientWidth;
    const itemSpacing = cardWidth + gap;

    if (scrollLeft > lastScrollLeftRef.current) {
      setScrollDirection("right");
    } else if (scrollLeft < lastScrollLeftRef.current) {
      setScrollDirection("left");
    }
    lastScrollLeftRef.current = scrollLeft;

    // Calculate which page is currently visible based on scroll position
    const calculatedPage = Math.round(scrollLeft / itemSpacing / itemsPerPage);
    setCurrentPage(
      Math.max(
        0,
        Math.min(calculatedPage, Math.ceil(items.length / itemsPerPage) - 1)
      )
    );

    // Update arrow visibility
    const hasOverflow = scrollWidth > clientWidth;
    setIsScrollable(hasOverflow);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial state
    updateScrollState();

    // Listen to scroll events with debouncing for performance
    const handleScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(updateScrollState, 50);
    };

    container.addEventListener("scroll", handleScroll);

    // Also update on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [items.length, itemsPerPage, gap]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(itemsPerPageMobile);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(itemsPerPageTablet);
      } else {
        setItemsPerPage(itemsPerPageDesktop);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [itemsPerPageMobile, itemsPerPageTablet, itemsPerPageDesktop]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    setScrollDirection(direction);

    const cardWidth =
      scrollContainerRef.current.querySelector("[data-carousel-item]")
        ?.clientWidth || 0;
    const scrollDistance = (cardWidth + gap) * itemsPerPage;

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

    const cardWidth =
      scrollContainerRef.current.querySelector("[data-carousel-item]")
        ?.clientWidth || 0;
    const scrollDistance = (cardWidth + gap) * itemsPerPage * index;
    scrollContainerRef.current.scrollTo({
      left: scrollDistance,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Carousel container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide snap-x"
          style={{ scrollSnapType: "x mandatory" }}>
          <div className="grid pb-4 gap-4 grid-flow-col auto-cols-[48%] md:auto-cols-[48%] lg:auto-cols-[32%]">
            {items.map((item, index) => (
              <div
                key={index}
                data-carousel-item
                className="min-w-0 transition-all duration-500 ease-out"
                style={{ scrollSnapAlign: "start" }}>
                {item}
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Added slide and fade animations for directional transitions */
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
    </div>
  );
}
