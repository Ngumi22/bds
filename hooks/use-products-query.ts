"use client";

import { useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useRef } from "react";
import { filterProducts } from "@/lib/product/fetchProducts";
import {
  ProductSearchParams,
  ProductSearchResult,
} from "@/lib/product/product.types";
import { searchParamsParsers } from "./searchParams";

export function useProductsQuery(initialData?: ProductSearchResult) {
  const [params] = useQueryStates(searchParamsParsers);

  const rawSearchParams = useSearchParams();
  const KNOWN_KEYS = new Set(Object.keys(searchParamsParsers));
  const searchParams: ProductSearchParams = {
    searchQuery: params.search || undefined,
    category: params.category || undefined,
    categories: params.categories || undefined,
    categoryId: params.categoryId || undefined,
    subCategories: params.subCategories || undefined,
    brands: params.brands || undefined,
    collections: params.collections || undefined,
    minPrice: params.minPrice ?? undefined,
    maxPrice: params.maxPrice ?? undefined,
    stockStatus: params.stockStatus || undefined,
    sortBy: params.sortBy as ProductSearchParams["sortBy"],
    sortOrder: params.sortOrder as "asc" | "desc",
    page: params.page,
    limit: 24,
    specifications: [],
  };

  for (const [key, value] of rawSearchParams.entries()) {
    if (!KNOWN_KEYS.has(key) && value) {
      searchParams.specifications!.push({
        key: key,
        values: value.split(",").filter(Boolean),
      });
    }
  }

  if (searchParams.specifications?.length === 0) {
    searchParams.specifications = undefined;
  }
  const initialSearchParams = useRef(JSON.stringify(searchParams));

  const isInitialState =
    initialSearchParams.current === JSON.stringify(searchParams);

  const query = useQuery({
    queryKey: ["products", searchParams],
    queryFn: () => filterProducts(searchParams),
    placeholderData: keepPreviousData,
    initialData: isInitialState ? initialData : undefined,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    isLoading: query.isLoading && !query.data,
    searchParams,
  };
}
