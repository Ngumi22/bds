"use client";

import { useState, useMemo, useCallback } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryState, useQueryStates, parseAsString } from "nuqs";

import { FilterSheet } from "./filter-sheet";
import { FilterBadge } from "./filter-badge";

import { PriceFilter } from "./price-filter";
import { BrandFilter } from "./brand-filter";
import { StockStatusFilter } from "./stock-status-filter";
import { SpecificationsFilter } from "./specifications-filter";
import { CollectionFilter } from "./collections-filter";
import { CatFilter } from "./cat-filters";

import {
  ProductSearchParams,
  ProductSearchResult,
} from "@/lib/product/product.types";
import { formatCurrency } from "@/lib/utils/form-helpers";
import { searchParamsParsers } from "@/hooks/searchParams";

interface ProductsFiltersProps {
  data: ProductSearchResult;
  searchParams: ProductSearchParams;
  isFetching?: boolean;
}

export function ProductsFilters({ data, searchParams }: ProductsFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const [, setPage] = useQueryState("page", searchParamsParsers.page);

  const updateFilter = useCallback(
    <T,>(
      setter: (value: T | null) => Promise<URLSearchParams>,
      newValue: T | null
    ) => {
      setter(newValue);
      setPage(1);
    },
    [setPage]
  );

  const [searchQuery, setSearchQuery] = useQueryState("search", {
    ...searchParamsParsers.search,
    throttleMs: 500,
    shallow: false,
  });

  const [categories, setCategories] = useQueryState(
    "categories",
    searchParamsParsers.categories
  );
  const [subCategories, setSubCategories] = useQueryState(
    "subCategories",
    searchParamsParsers.subCategories
  );
  const [brands, setBrands] = useQueryState(
    "brands",
    searchParamsParsers.brands
  );
  const [collections, setCollections] = useQueryState(
    "collections",
    searchParamsParsers.collections
  );
  const [minPrice, setMinPrice] = useQueryState(
    "minPrice",
    searchParamsParsers.minPrice
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    "maxPrice",
    searchParamsParsers.maxPrice
  );
  const [stockStatus, setStockStatus] = useQueryState(
    "stockStatus",
    searchParamsParsers.stockStatus
  );

  const activeSpecKeys = useMemo(
    () => searchParams.specifications?.map((s) => s.key) || [],
    [searchParams.specifications]
  );

  const specParsers = useMemo(() => {
    const parsers: Record<string, typeof parseAsString> = {};
    activeSpecKeys.forEach((key) => {
      parsers[key] = parseAsString;
    });
    return parsers;
  }, [activeSpecKeys]);

  const [, setSpecQuery] = useQueryStates(specParsers, {
    shallow: false,
  });

  const hasActiveFilters =
    !!searchQuery ||
    (categories?.length ?? 0) > 0 ||
    (subCategories?.length ?? 0) > 0 ||
    (brands?.length ?? 0) > 0 ||
    (collections?.length ?? 0) > 0 ||
    minPrice !== null ||
    maxPrice !== null ||
    (stockStatus?.length ?? 0) > 0 ||
    (searchParams.specifications?.length || 0) > 0;

  const clearAllFilters = () => {
    setSearchQuery(null);
    setCategories(null);
    setSubCategories(null);
    setBrands(null);
    setMinPrice(null);
    setMaxPrice(null);
    setStockStatus(null);
    setCollections(null);
    setPage(1);

    const specClears: Record<string, null> = {};
    activeSpecKeys.forEach((key) => {
      specClears[key] = null;
    });
    setSpecQuery(specClears);
  };

  const getCategoryName = (slug: string) => {
    const parent = data.availableCategories.find((cat) => cat.slug === slug);
    if (parent) return parent.name;
    for (const parentCat of data.availableCategories) {
      const sub = parentCat.subCategories?.find(
        (subCat) => subCat.slug === slug
      );
      if (sub) return sub.name;
    }
    return slug;
  };

  const getBrandName = (id: string) => {
    return data.availableBrands.find((brand) => brand.id === id)?.name || id;
  };

  const formatSpecKey = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const DynamicSpecBadge = ({
    spec,
  }: {
    spec: { key: string; values: string[] };
  }) => {
    const [, setSpecValue] = useQueryState(spec.key, parseAsString);

    return (
      <FilterBadge
        label={formatSpecKey(spec.key)}
        key={spec.key}
        value={spec.values.join(", ")}
        onRemove={() => {
          setSpecValue(null);
          setPage(1);
        }}
      />
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <CatFilter categories={data.availableCategories} />
      <PriceFilter priceRange={data.priceRange} />
      <StockStatusFilter availableStockStatuses={data.availableStockStatuses} />
      <BrandFilter brands={data.availableBrands} />
      <CollectionFilter collections={data.availableCollections} />
      <SpecificationsFilter specifications={data.availableSpecifications} />
    </div>
  );

  return (
    <div className="w-full space-y-3">
      <div className="lg:hidden flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setSheetOpen(true)}
          className="gap-2 bg-black text-white hover:bg-white hover:border-border/90 w-32 rounded-sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="hidden lg:block">
        {hasActiveFilters && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg">Filter:</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm underline underline-offset-2 cursor-pointer hover:no-underline hover:text-red-500 transition-colors">
                Remove All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 font-normal">
              {searchQuery && (
                <FilterBadge
                  value={searchQuery}
                  onRemove={() => updateFilter(setSearchQuery, null)}
                />
              )}

              {categories?.map((slug) => (
                <FilterBadge
                  key={slug}
                  value={getCategoryName(slug)}
                  onRemove={() => {
                    const next = categories.filter((s) => s !== slug);
                    updateFilter(setCategories, next.length > 0 ? next : null);
                  }}
                />
              ))}

              {subCategories?.map((slug) => (
                <FilterBadge
                  key={slug}
                  value={getCategoryName(slug)}
                  onRemove={() => {
                    const next = subCategories.filter((s) => s !== slug);
                    updateFilter(
                      setSubCategories,
                      next.length > 0 ? next : null
                    );
                  }}
                />
              ))}

              {brands?.map((id) => (
                <FilterBadge
                  key={id}
                  value={getBrandName(id)}
                  onRemove={() => {
                    const next = brands.filter((b) => b !== id);
                    updateFilter(setBrands, next.length > 0 ? next : null);
                  }}
                />
              ))}

              {collections?.map((id) => (
                <FilterBadge
                  key={id}
                  value={getBrandName(id)}
                  onRemove={() => {
                    const next = collections.filter((c) => c !== id);
                    updateFilter(setCollections, next.length > 0 ? next : null);
                  }}
                />
              ))}

              {((minPrice !== null && minPrice !== data.priceRange.min) ||
                (maxPrice !== null && maxPrice !== data.priceRange.max)) && (
                <FilterBadge
                  value={`${formatCurrency(
                    minPrice ?? data.priceRange.min
                  )} - ${formatCurrency(maxPrice ?? data.priceRange.max)}`}
                  onRemove={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                    setPage(1);
                  }}
                />
              )}

              {stockStatus?.map((status) => (
                <FilterBadge
                  key={status}
                  value={status.replace("_", " ")}
                  onRemove={() => {
                    const next = stockStatus.filter((s) => s !== status);
                    updateFilter(setStockStatus, next.length > 0 ? next : null);
                  }}
                />
              ))}

              {searchParams.specifications?.map((spec) => (
                <DynamicSpecBadge key={spec.key} spec={spec} />
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-4 space-y-6">
          <FilterContent />
        </div>
      </div>

      <FilterSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <FilterContent />
      </FilterSheet>
    </div>
  );
}
