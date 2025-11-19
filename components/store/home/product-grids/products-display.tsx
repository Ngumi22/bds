import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProductsHeader, type ProductsHeaderProps } from "./products-header";
import { ProductsGrid, type ProductsGridProps } from "./products-grid";
import { ProductsBanner, ProductsBannerProps } from "./products-banner";

export interface ProductsDisplayProps {
  header: ProductsHeaderProps;
  grid: ProductsGridProps;
  banner?: {
    content: ReactNode;
    props?: Omit<ProductsBannerProps, "children">;
  };
  className?: string;
  containerClassName?: string;
}

export function ProductsDisplay({
  header,
  grid,
  banner,
  className,
  containerClassName,
}: ProductsDisplayProps) {
  const hasLayout = banner !== undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6 md:mb-8">
        <ProductsHeader {...header} />
      </div>

      {hasLayout ? (
        <div
          className={cn("flex gap-6 md:gap-8 lg:gap-12", containerClassName)}>
          {banner && (
            <div className="hidden lg:block shrink-0 w-full lg:max-w-xs xl:max-w-sm">
              <ProductsBanner {...banner.props}>
                {banner.content}
              </ProductsBanner>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <ProductsGrid {...grid} />
          </div>
        </div>
      ) : (
        <ProductsGrid {...grid} />
      )}

      {banner && (
        <div className="lg:hidden mt-6">
          <ProductsBanner {...banner.props}>{banner.content}</ProductsBanner>
        </div>
      )}
    </div>
  );
}
