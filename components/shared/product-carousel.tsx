"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselClientProps {
  items: React.ReactNode[];
  itemsPerPageMobile?: number;
  itemsPerPageTablet?: number;
  itemsPerPageDesktop?: number;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function CarouselClient({
  items,
  itemsPerPageMobile = 2,
  itemsPerPageTablet = 5,
  itemsPerPageDesktop = 6,
  gap = 16,
  showArrows = true,
  showDots = true,
}: CarouselClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageMobile);
  const [columnWidth, setColumnWidth] = useState("50%");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLayout = () => {
      let perPage = itemsPerPageMobile;
      if (window.innerWidth >= 1024) perPage = itemsPerPageDesktop;
      else if (window.innerWidth >= 768) perPage = itemsPerPageTablet;
      setItemsPerPage(perPage);
      setColumnWidth(`calc((100% - ${gap * (perPage - 1)}px) / ${perPage})`);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [itemsPerPageMobile, itemsPerPageTablet, itemsPerPageDesktop, gap]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleScroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(
      "[data-carousel-item]"
    ) as HTMLElement;
    if (!card) return;
    const scrollDistance = (card.clientWidth + gap) * itemsPerPage;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollDistance : scrollDistance,
      behavior: "smooth",
    });
  };

  const handleDotClick = (index: number) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(
      "[data-carousel-item]"
    ) as HTMLElement;
    if (!card) return;
    const scrollDistance = (card.clientWidth + gap) * itemsPerPage * index;
    scrollRef.current.scrollTo({ left: scrollDistance, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScrollLeft = scrollWidth - clientWidth;
      const hasOverflow = scrollWidth > clientWidth;
      setIsScrollable(hasOverflow);
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < maxScrollLeft - 5);

      const scrollProgress = scrollLeft / maxScrollLeft;
      const page = Math.round(scrollProgress * (totalPages - 1));
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    };

    el.addEventListener("scroll", updateScroll);
    const resizeObs = new ResizeObserver(updateScroll);
    resizeObs.observe(el);

    updateScroll();
    return () => {
      el.removeEventListener("scroll", updateScroll);
      resizeObs.disconnect();
    };
  }, [items.length, totalPages]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}>
        <div
          className="grid grid-flow-col gap-2 pb-4"
          style={{ gridAutoColumns: columnWidth }}>
          {items.map((item, i) => (
            <div
              key={i}
              data-carousel-item
              className="min-w-0 animate-in fade-in slide-in-from-right-4 duration-500 ease-out"
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
            disabled={!canScrollLeft}
            className="hidden lg:flex absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md transition-all duration-300 hover:bg-gray-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md transition-all duration-300 hover:bg-gray-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100">
            <ChevronRight className="w-5 h-5 text-gray-900" />
          </button>
        </>
      )}

      {showDots && isScrollable && (
        <div className="flex lg:hidden justify-center gap-2 mt-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentPage
                  ? "bg-gray-900 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
