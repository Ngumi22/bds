"use client";

import { ProductsFilters } from "./filters";
import { ProductsSearch } from "./search";
import { ProductsSort } from "./sort";
import { ProductsGrid } from "./grid";
import { ProductsPagination } from "./pagination";
import { cn } from "@/lib/utils";
import { ProductSearchResult } from "@/lib/product/product.types";

export function ProductsContent({
  productsData,
  isFetching,
  searchParams,
}: {
  productsData: ProductSearchResult;
  isFetching: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (!productsData || productsData.products.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-60 lg:shrink-0">
          <ProductsFilters
            data={productsData}
            searchParams={searchParams}
            isFetching={isFetching}
          />
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[50vh] w-full">
          <div className="text-center flex flex-col items-center justify-center mx-auto">
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-gray-500 max-w-sm">
              Try adjusting your filters or search terms
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 flex-1">
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-8">
        <div className="flex items-center w-full lg:w-60 lg:shrink-0">
          <ProductsFilters
            data={productsData}
            searchParams={searchParams}
            isFetching={isFetching}
          />

          <div className="md:hidden">
            <ProductsSort />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 w-full space-y-4 transition-opacity duration-300",
            isFetching ? "opacity-50 pointer-events-none" : "opacity-100"
          )}>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <p className="hidden md:block text-sm text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-medium">
                {productsData.products.length}
              </span>{" "}
              of <span className="font-medium">{productsData.totalCount}</span>{" "}
              products
            </p>

            <div className="hidden flex-1 sm:flex flex-col sm:flex-row gap-3 items-center sm:justify-end w-full sm:w-auto">
              <ProductsSearch />

              <ProductsSort />
            </div>
          </div>

          <ProductsGrid products={productsData.products} />

          {productsData.totalPages > 1 && (
            <div className="mt-5 flex justify-center">
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
