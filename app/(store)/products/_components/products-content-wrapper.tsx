"use client";

import { ProductsContent } from "@/components/store/products-page/content";
import { useProductsQuery } from "@/hooks/use-products-query";
import { ProductSearchResult } from "@/lib/product/product.types";

interface ProductsContentWrapperProps {
  searchParams?: Record<string, string | string[] | undefined>;
  initialData: ProductSearchResult;
}

export function ProductsContentWrapper({
  initialData,
}: ProductsContentWrapperProps) {
  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
    searchParams: activeSearchParams,
  } = useProductsQuery(initialData);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full text-center">
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error loading products
          </h3>
          <p className="text-gray-500">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !productsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
          <span className="text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <ProductsContent
      productsData={productsData!}
      isFetching={isFetching}
      // Pass the fully typed searchParams from the hook
      searchParams={activeSearchParams as any}
    />
  );
}
