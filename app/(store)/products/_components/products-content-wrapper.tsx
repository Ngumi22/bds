"use client";

import { ProductsContent } from "@/components/store/products-page/content";
import { useProductsQuery } from "@/hooks/use-products-query";
import { ProductSearchResult } from "@/lib/product/product.types";

export function ProductsContentWrapper({
  searchParams,
  initialData,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  initialData: ProductSearchResult;
}) {
  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useProductsQuery(initialData);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full text-center">
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
      <div className="flex items-center justify-center min-h-screen w-full">
        Loading...
      </div>
    );
  }

  return (
    <ProductsContent
      productsData={productsData!}
      isFetching={isFetching}
      searchParams={searchParams}
    />
  );
}
