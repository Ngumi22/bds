"use client";

import { useQueryState } from "nuqs";
import { StockStatus } from "@prisma/client";
import { useMemo } from "react";
import { transformFilters, TransformedFilter } from "@/lib/filter-transforms";

export function useFilterManager(data: any) {
  const [searchQuery, setSearchQuery] = useQueryState("search");
  const [categoryId, setCategoryId] = useQueryState("category");
  const [subCategories, setSubCategories] = useQueryState("subCategories", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
  });
  const [brands, setBrands] = useQueryState("brands", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
  });
  const [minPrice, setMinPrice] = useQueryState("minPrice", {
    parse: (value) => (value ? Number(value) : undefined),
  });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", {
    parse: (value) => (value ? Number(value) : undefined),
  });
  const [stockStatus, setStockStatus] = useQueryState("stockStatus", {
    parse: (value) => value.split(",").filter(Boolean) as StockStatus[],
    defaultValue: [],
  });
  const [specs, setSpecs] = useQueryState("specs", {
    parse: (value) => {
      try {
        return JSON.parse(value) as Array<{ key: string; values: string[] }>;
      } catch {
        return [];
      }
    },
    serialize: (value) => JSON.stringify(value),
    defaultValue: [],
  });

  // Remove actions
  const removeActions = useMemo(
    () => ({
      search: () => setSearchQuery(null),
      category: () => setCategoryId(null),
      subCategory: (value: string) => {
        const newSubCategories = subCategories.filter((id) => id !== value);
        setSubCategories(newSubCategories.length > 0 ? newSubCategories : null);
      },
      brand: (value: string) => {
        const newBrands = brands.filter((id) => id !== value);
        setBrands(newBrands.length > 0 ? newBrands : null);
      },
      price: () => {
        setMinPrice(null);
        setMaxPrice(null);
      },
      stockStatus: (value: StockStatus) => {
        const newStatus = stockStatus.filter((s) => s !== value);
        setStockStatus(newStatus.length > 0 ? newStatus : null);
      },
      spec: (value: { key: string; values: string[] }) => {
        const newSpecs = specs.filter((s) => s.key !== value.key);
        setSpecs(newSpecs.length > 0 ? newSpecs : null);
      },
    }),
    [
      searchQuery,
      categoryId,
      subCategories,
      brands,
      minPrice,
      maxPrice,
      stockStatus,
      specs,
    ]
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery(null);
    setCategoryId(null);
    setSubCategories(null);
    setBrands(null);
    setMinPrice(null);
    setMaxPrice(null);
    setStockStatus(null);
    setSpecs(null);
  };

  // Current search params for transformation
  const currentSearchParams = useMemo(
    () => ({
      searchQuery: searchQuery || undefined,
      categoryId: categoryId || undefined,
      subCategoryIds: subCategories.length > 0 ? subCategories : undefined,
      brandIds: brands.length > 0 ? brands : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      stockStatus: stockStatus.length > 0 ? stockStatus : undefined,
      specs: specs.length > 0 ? specs : undefined,
    }),
    [
      searchQuery,
      categoryId,
      subCategories,
      brands,
      minPrice,
      maxPrice,
      stockStatus,
      specs,
    ]
  );

  // Transform filters for display
  const transformedFilters: TransformedFilter[] = useMemo(
    () =>
      transformFilters({
        searchParams: currentSearchParams,
        context: {
          categories: data?.availableSubCategories,
          brands: data?.availableBrands,
          priceRange: data?.priceRange,
        },
        removeActions,
      }),
    [currentSearchParams, data, removeActions]
  );

  const hasActiveFilters = transformedFilters.length > 0;

  return {
    // State
    searchQuery,
    categoryId,
    subCategories,
    brands,
    minPrice,
    maxPrice,
    stockStatus,
    specs,

    // Actions
    setSearchQuery,
    setCategoryId,
    setSubCategories,
    setBrands,
    setMinPrice,
    setMaxPrice,
    setStockStatus,
    setSpecs,

    // Derived state
    transformedFilters,
    hasActiveFilters,
    clearAllFilters,

    // Current params for passing to child components
    currentSearchParams,
  };
}
