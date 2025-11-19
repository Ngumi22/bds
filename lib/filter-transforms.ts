import { StockStatus } from "@prisma/client";

export interface FilterTransform<T = any> {
  type: string;
  displayName: string;
  formatValue: (value: T, context?: any) => string;
  extractValues?: (params: any, context?: any) => T[];
}

export const searchFilterTransform: FilterTransform<string> = {
  type: "search",
  displayName: "Search",
  formatValue: (value: string) => value,
  extractValues: (params) => (params.searchQuery ? [params.searchQuery] : []),
};

export const categoryFilterTransform: FilterTransform<string> = {
  type: "category",
  displayName: "Category",
  formatValue: (
    value: string,
    context?: { categories?: Array<{ id: string; name: string }> }
  ) => {
    return context?.categories?.find((cat) => cat.id === value)?.name || value;
  },
  extractValues: (params) => (params.categoryId ? [params.categoryId] : []),
};

export const subCategoryFilterTransform: FilterTransform<string> = {
  type: "subCategory",
  displayName: "Subcategory",
  formatValue: (
    value: string,
    context?: { categories?: Array<{ id: string; name: string }> }
  ) => {
    return context?.categories?.find((cat) => cat.id === value)?.name || value;
  },
  extractValues: (params) => params.subCategoryIds || [],
};

export const brandFilterTransform: FilterTransform<string> = {
  type: "brand",
  displayName: "Brand",
  formatValue: (
    value: string,
    context?: { brands?: Array<{ id: string; name: string }> }
  ) => {
    return context?.brands?.find((brand) => brand.id === value)?.name || value;
  },
  extractValues: (params) => params.brandIds || [],
};

export const priceFilterTransform: FilterTransform<{
  min?: number;
  max?: number;
}> = {
  type: "price",
  displayName: "Price Range",
  formatValue: (
    value: { min?: number; max?: number },
    context?: { priceRange?: { min: number; max: number } }
  ) => {
    const min = value.min ?? context?.priceRange?.min ?? 0;
    const max = value.max ?? context?.priceRange?.max ?? "∞";
    return `$${min} - $${max}`;
  },
  extractValues: (params) => {
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      return [{ min: params.minPrice, max: params.maxPrice }];
    }
    return [];
  },
};

export const stockStatusFilterTransform: FilterTransform<StockStatus> = {
  type: "stockStatus",
  displayName: "Status",
  formatValue: (status: StockStatus) => {
    const statusMap: Record<StockStatus, string> = {
      [StockStatus.IN_STOCK]: "In Stock",
      [StockStatus.LOW_STOCK]: "Low Stock",
      [StockStatus.OUT_OF_STOCK]: "Out of Stock",
      [StockStatus.BACKORDER]: "Backorder",
      [StockStatus.DISCONTINUED]: "Discontinued",
    };
    return statusMap[status] || status.replace("_", " ");
  },
  extractValues: (params) => params.stockStatus || [],
};

export const specFilterTransform: FilterTransform<{
  key: string;
  values: string[];
}> = {
  type: "spec",
  displayName: "Specification",
  formatValue: (spec: { key: string; values: string[] }) => {
    const formatKey = (key: string) =>
      key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const formatValue = (value: string) => {
      // Common value formatting rules
      return value
        .replace(/(\d+)(gb)/gi, "$1GB")
        .replace(/(\d+)(tb)/gi, "$1TB")
        .replace(/(\d+)(mb)/gi, "$1MB")
        .replace(/(\d+)(hz)/gi, "$1Hz")
        .toUpperCase();
    };

    return `${formatKey(spec.key)}: ${spec.values.map(formatValue).join(", ")}`;
  },
  extractValues: (params) => params.specs || [],
};

// Collection of all transformers
export const filterTransforms = {
  search: searchFilterTransform,
  category: categoryFilterTransform,
  subCategory: subCategoryFilterTransform,
  brand: brandFilterTransform,
  price: priceFilterTransform,
  stockStatus: stockStatusFilterTransform,
  spec: specFilterTransform,
} as const;

// Main transformation function
export interface TransformedFilter {
  type: string;
  displayName: string;
  displayValue: string;
  originalValue: any;
  removeAction: () => void;
}

export interface TransformFiltersParams {
  searchParams: any;
  context?: {
    categories?: Array<{ id: string; name: string }>;
    brands?: Array<{ id: string; name: string }>;
    priceRange?: { min: number; max: number };
  };
  removeActions: Record<string, (value?: any) => void>;
}

export function transformFilters({
  searchParams,
  context = {},
  removeActions,
}: TransformFiltersParams): TransformedFilter[] {
  const transformed: TransformedFilter[] = [];

  // Process each filter type
  Object.entries(filterTransforms).forEach(([key, transform]) => {
    const values = transform.extractValues?.(searchParams) || [];

    values.forEach((value) => {
      // Use type assertion to help TypeScript infer the correct type for each transform
      const displayValue = (
        transform.formatValue as (v: typeof value, c?: typeof context) => string
      )(value, context);

      transformed.push({
        type: transform.type,
        displayName: transform.displayName,
        displayValue,
        originalValue: value,
        removeAction: () => removeActions[transform.type]?.(value),
      });
    });
  });

  return transformed;
}
