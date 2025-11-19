"use client";

import { ProductsFilters } from "./filters";
import { ProductsSearch } from "./search";
import { ProductsSort } from "./sort";
import { ProductsGrid } from "./grid";
import { ProductsPagination } from "./pagination";
import { useProductsQuery } from "@/hooks/use-products-query";
import { cn } from "@/lib/utils";

export function ProductsContent() {
  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
    searchParams,
  } = useProductsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-black"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full text-center">
        <div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error loading products
          </h3>
          <p className="text-muted-foreground">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!productsData || productsData.products.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-60 lg:shrink-0">
          <ProductsFilters
            data={
              productsData || {
                products: [],
                totalCount: 0,
                totalPages: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPreviousPage: false,
                priceRange: { min: 0, max: 1000 },
                availableBrands: [],
                availableCategories: [],
                availableSubCategories: [],
                availableSpecifications: [],
                availableParentCategories: [],
                availableCollections: [],
                availableStockStatuses: [],
              }
            }
            searchParams={searchParams}
            isFetching={true}
          />
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[50vh] w-full">
          <div className="text-center flex flex-col items-center justify-center mx-auto">
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-sm">
              Try adjusting your filters or search terms
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-60 lg:shrink-0">
          <ProductsFilters
            data={productsData}
            searchParams={searchParams}
            isFetching={isFetching}
          />
          <div className="mt-4 md:hidden">
            <ProductsSearch />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 w-full space-y-4 transition-opacity",
            isFetching ? "opacity-50" : "opacity-100"
          )}>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Showing{" "}
              <span className="font-medium">
                {productsData.products.length}
              </span>{" "}
              of <span className="font-medium">{productsData.totalCount}</span>{" "}
              products
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center sm:justify-end w-full sm:w-auto">
              <div className="hidden sm:block flex-1">
                <ProductsSearch />
              </div>
              <ProductsSort />
            </div>
          </div>

          <ProductsGrid products={productsData.products} />

          {productsData.totalPages > 1 && (
            <div className="mt-5">
              <ProductsPagination
                currentPage={productsData.currentPage}
                totalPages={productsData.totalPages}
                hasNextPage={productsData.hasNextPage}
                hasPreviousPage={productsData.hasPreviousPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
