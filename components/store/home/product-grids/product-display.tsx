"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProductsBanner, ProductsBannerProps } from "./products-banner";
import { ProductsHeader, ProductsHeaderProps } from "./products-header";
import { ProductsGrid, ProductsGridProps } from "./products-grid";

export interface ProductsDisplayProps {
  header: ProductsHeaderProps;
  grid: ProductsGridProps;
  banner?: {
    content: ReactNode;
    props?: Omit<ProductsBannerProps, "children">;
  };
  type?: "collection" | "category" | "promotion";
  className?: string;
  containerClassName?: string;
}

export function ProductsDisplay({
  header,
  grid,
  banner,
  type = "category",
  className,
  containerClassName,
}: ProductsDisplayProps) {
  const hasBanner = !!banner;

  return (
    <section
      className={cn(
        "w-full",
        type === "collection" && "bg-muted/30 py-6 md:py-8 rounded-2xl",
        className
      )}>
      <div className="mb-4">
        <ProductsHeader {...header} />
      </div>

      {hasBanner ? (
        <div
          className={cn("flex gap-6 md:gap-8 lg:gap-12", containerClassName)}>
          <aside className="hidden lg:block shrink-0 w-full lg:max-w-xs xl:max-w-sm">
            <ProductsBanner {...banner.props}>{banner.content}</ProductsBanner>
          </aside>

          <div className="flex-1 min-w-0">
            <ProductsGrid {...grid} />
          </div>
        </div>
      ) : (
        <ProductsGrid {...grid} />
      )}

      {hasBanner && (
        <div className="lg:hidden mt-6">
          <ProductsBanner {...banner.props}>{banner.content}</ProductsBanner>
        </div>
      )}
    </section>
  );
}
