// hooks/use-products.ts
"use client";

import { useQueryState } from "nuqs";
import { use } from "react";
import { searchProducts } from "@/lib/actions/product-filter";
import { ProductSearchParams } from "@/lib/product/product.types";

export function useProductsSearch() {
  const [searchQuery] = useQueryState("search", { defaultValue: "" });
  const [categoryId] = useQueryState("category");
  const [subCategories] = useQueryState("subCategories", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
  });
  const [brands] = useQueryState("brands", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
  });
  const [minPrice] = useQueryState("minPrice", {
    parse: (value) => (value ? Number(value) : undefined),
  });
  const [maxPrice] = useQueryState("maxPrice", {
    parse: (value) => (value ? Number(value) : undefined),
  });
  const [stockStatus] = useQueryState("stockStatus", {
    parse: (value) => value.split(",").filter(Boolean) as any,
    defaultValue: [],
  });
  const [sortBy] = useQueryState("sortBy", { defaultValue: "createdAt" });
  const [sortOrder] = useQueryState("sortOrder", { defaultValue: "desc" });
  const [page] = useQueryState("page", {
    parse: (value) => (value ? Number(value) : 1),
    defaultValue: 1,
  });

  const searchParams: ProductSearchParams = {
    searchQuery: searchQuery || undefined,
    categoryId: categoryId || undefined,
    subCategoryIds: subCategories.length > 0 ? subCategories : undefined,
    brandIds: brands.length > 0 ? brands : undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    stockStatus: stockStatus.length > 0 ? stockStatus : undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    page: page,
    limit: 24,
  };

  // Use React's use() hook to unwrap the promise
  const productsData = use(searchProducts(searchParams));

  return {
    productsData,
    searchParams,
  };
}
