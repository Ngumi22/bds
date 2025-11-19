"use client";

import type { MinimalProductData } from "@/lib/product/product.types";
import Link from "next/link";
import CarouselClient from "./product-carousel";
import ProductCard from "../store/home/product/product-card";

interface ProductCarouselProps {
  sectionId: string;
  title: string;
  products: MinimalProductData[];
  href?: string;
  timer?: React.ReactNode;
  itemsPerView?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function ProductCarousel({
  sectionId,
  title,
  products,
  href,
  timer,
  itemsPerView = 5,
  showArrows = true,
  showDots = true,
}: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <section id={sectionId} className="w-full py-4">
      <div className="md:container mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {timer && <div>{timer}</div>}
          </div>

          {href && (
            <Link href={href} className="text-black text-sm font-medium">
              View All
            </Link>
          )}
        </div>

        <CarouselClient
          items={products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          itemsPerPageMobile={2}
          itemsPerPageTablet={4}
          itemsPerPageDesktop={itemsPerView}
          showArrows={showArrows}
          showDots={showDots}
        />
      </div>
    </section>
  );
}
