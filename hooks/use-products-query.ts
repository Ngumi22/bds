"use client";

import { useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { StockStatus } from "@prisma/client";
import { filterProducts } from "@/lib/product/fetchProducts";
import { ProductSearchParams } from "@/lib/product/product.types";

const RESERVED_PARAMS = new Set([
  "search",
  "category",
  "categories",
  "subCategories",
  "brands",
  "collections",
  "minPrice",
  "maxPrice",
  "stockStatus",
  "sortBy",
  "sortOrder",
  "page",
  "categoryId",
]);

export function useProductsQuery() {
  const urlParams = useSearchParams();

  const page = Number(urlParams.get("page") || "1");
  const minPrice = Number(urlParams.get("minPrice") || undefined);
  const maxPrice = Number(urlParams.get("maxPrice") || undefined);
  const stockStatus = urlParams.get("stockStatus")?.split(",") || [];

  const searchParams: ProductSearchParams = {
    searchQuery: urlParams.get("search") || undefined,
    category: urlParams.get("category") || undefined,
    categories: urlParams.get("categories")?.split(",").filter(Boolean),
    categoryId: urlParams.get("categoryId") || undefined,
    subCategories: urlParams.get("subCategories")?.split(",").filter(Boolean),
    brands: urlParams.get("brands")?.split(",").filter(Boolean),
    collections: urlParams.get("collections")?.split(",").filter(Boolean),
    minPrice: isNaN(minPrice) ? undefined : minPrice,
    maxPrice: isNaN(maxPrice) ? undefined : maxPrice,
    stockStatus:
      stockStatus.length > 0 ? (stockStatus as StockStatus[]) : undefined,
    sortBy: (urlParams.get("sortBy") as any) || "createdAt",
    sortOrder: (urlParams.get("sortOrder") as any) || "desc",
    page: page < 1 ? 1 : page,
    limit: 24,
    specifications: [],
  };

  for (const [key, value] of urlParams.entries()) {
    if (!RESERVED_PARAMS.has(key) && value) {
      searchParams.specifications!.push({
        key: key,
        values: value.split(",").filter(Boolean),
      });
    }
  }

  if (searchParams.specifications?.length === 0) {
    searchParams.specifications = undefined;
  }

  const query = useQuery({
    queryKey: ["products", searchParams],

    queryFn: () => filterProducts(searchParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    searchParams,
  };
}
