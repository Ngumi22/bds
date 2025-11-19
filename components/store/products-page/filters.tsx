"use client";

import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryState, useQueryStates, type UseQueryStateOptions } from "nuqs";

import { FilterSheet } from "./filter-sheet";
import { FilterBadge } from "./filter-badge";
import type { StockStatus } from "@prisma/client";

import { PriceFilter } from "./price-filter";
import { BrandFilter } from "./brand-filter";
import { StockStatusFilter } from "./stock-status-filter";
import { SpecificationsFilter } from "./specifications-filter";

import { CollectionFilter } from "./collections-filter";
import {
  ProductSearchParams,
  ProductSearchResult,
} from "@/lib/product/product.types";
import { CatFilter } from "./cat-filters";
import { formatCurrency } from "@/lib/utils/form-helpers";

interface ProductsFiltersProps {
  data: ProductSearchResult;
  searchParams: ProductSearchParams;
  isFetching: boolean;
}

export function ProductsFilters({
  data,
  searchParams,
  isFetching,
}: ProductsFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useQueryState("search");

  const [categories, setCategories] = useQueryState("categories", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
    serialize: (value) => value.join(","),
  });

  const [subCategories, setSubCategories] = useQueryState("subCategories", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
    serialize: (value) => value.join(","),
  });

  const [brands, setBrands] = useQueryState("brands", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
    serialize: (value) => value.join(","),
  });

  const [collections, setCollections] = useQueryState("collections", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
    serialize: (value) => value.join(","),
  });

  const [minPrice, setMinPrice] = useQueryState("minPrice", {
    parse: (value) => (value ? Number(value) : null),
  });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", {
    parse: (value) => (value ? Number(value) : null),
  });

  const [stockStatus, setStockStatus] = useQueryState("stockStatus", {
    parse: (value) => value.split(",").filter(Boolean) as StockStatus[],
    defaultValue: [],
    serialize: (value) => value.join(","),
  });

  const activeSpecKeys = useMemo(
    () => searchParams.specifications?.map((s) => s.key) || [],
    [searchParams.specifications]
  );

  const specQueryConfig = useMemo(() => {
    const config: Record<string, UseQueryStateOptions<string[]>> = {};
    activeSpecKeys.forEach((key) => {
      config[key] = {
        parse: (v: string) => (v ? v.split(",").filter(Boolean) : []),
        serialize: (v: string[]) => (v && v.length > 0 ? v.join(",") : ""),
      };
    });
    return config;
  }, [activeSpecKeys]);

  const [, setSpecQuery] = useQueryStates(specQueryConfig, {
    shallow: false,
    clearOnDefault: true,
  });

  const hasActiveFilters =
    searchQuery ||
    categories.length > 0 ||
    subCategories.length > 0 ||
    brands.length > 0 ||
    collections.length > 0 ||
    minPrice !== null ||
    maxPrice !== null ||
    stockStatus.length > 0 ||
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
    const [, setSpecValue] = useQueryState(spec.key);

    const handleRemove = () => {
      setSpecValue(null);
    };

    return (
      <FilterBadge
        label={formatSpecKey(spec.key)}
        key={spec.key}
        value={spec.values.join(", ")}
        onRemove={handleRemove}
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
        {/* Active Filters Section - Only shown when filters are applied */}
        {hasActiveFilters && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg ">Filter:</h3>
              <p
                onClick={clearAllFilters}
                className="h-6 text-sm underline underline-offset-2 cursor-pointer hover:no-underline hover:text-red-300">
                Remove All
              </p>
            </div>
            <div className="flex flex-wrap gap-2 font-normal">
              {searchQuery && (
                <FilterBadge
                  value={searchQuery}
                  onRemove={() => setSearchQuery(null)}
                />
              )}

              {categories.map((slug) => (
                <FilterBadge
                  key={slug}
                  value={getCategoryName(slug)}
                  onRemove={() =>
                    setCategories(
                      categories.filter((s) => s !== slug).length > 0
                        ? categories.filter((s) => s !== slug)
                        : null
                    )
                  }
                />
              ))}

              {subCategories.map((slug) => (
                <FilterBadge
                  key={slug}
                  value={getCategoryName(slug)}
                  onRemove={() =>
                    setSubCategories(
                      subCategories.filter((s) => s !== slug).length > 0
                        ? subCategories.filter((s) => s !== slug)
                        : null
                    )
                  }
                />
              ))}

              {brands.map((id) => (
                <FilterBadge
                  key={id}
                  value={getBrandName(id)}
                  onRemove={() =>
                    setBrands(
                      brands.filter((b) => b !== id).length > 0
                        ? brands.filter((b) => b !== id)
                        : null
                    )
                  }
                />
              ))}

              {collections.map((id) => (
                <FilterBadge
                  key={id}
                  value={getBrandName(id)}
                  onRemove={() =>
                    setCollections(
                      collections.filter((b) => b !== id).length > 0
                        ? collections.filter((b) => b !== id)
                        : null
                    )
                  }
                />
              ))}

              {((minPrice && minPrice !== data.priceRange.min) ||
                (maxPrice && maxPrice !== data.priceRange.max)) && (
                <FilterBadge
                  value={`${formatCurrency(
                    minPrice ?? data.priceRange.min
                  )} - ${formatCurrency(maxPrice ?? data.priceRange.max)}`}
                  onRemove={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                />
              )}

              {stockStatus.map((status) => (
                <FilterBadge
                  key={status}
                  value={status.replace("_", " ")}
                  onRemove={() =>
                    setStockStatus(
                      stockStatus.filter((s) => s !== status).length > 0
                        ? stockStatus.filter((s) => s !== status)
                        : null
                    )
                  }
                />
              ))}

              {searchParams.specifications?.map((spec) => (
                <DynamicSpecBadge key={spec.key} spec={spec} />
              ))}
            </div>
          </div>
        )}

        {/* Filter controls - always shown */}
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
