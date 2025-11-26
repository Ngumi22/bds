import { StockStatus } from "@prisma/client";
import { ProductCollection } from "../utils/flash-sale";

export interface MinimalProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  rating?: number;
  brand?: string;
  category?: string;
  categoryId: string;
  mainImage: string;
  slug: string;
  stockStatus: StockStatus;
  hasVariants: boolean;
  isActive: boolean;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  collections?: ProductCollection[];
  colorVariants?: Array<{
    name: string;
    value: string | null;
    color: string | null;
  }>;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  subCategories?: SubCategory[];
}
export interface ProductSearchParams {
  categoryId?: string;
  category?: string;
  categories?: string[];
  searchQuery?: string;
  subCategories?: string[];
  subCategoryIds?: string[];
  brandIds?: string[];
  brands?: string[];
  collectionIds?: string[];
  collections?: string[];
  specifications?: {
    key: string;
    values: string[];
  }[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus[];
  sortBy?: "name" | "price" | "createdAt" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: MinimalProductData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  availableBrands: Array<{ id: string; name: string; count: number }>;
  availableCategories: Category[];
  availableSubCategories: Array<{ id: string; name: string; count: number }>;
  availableParentCategories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  availableCollections: Array<{ id: string; name: string; count: number }>;
  availableSpecifications: Array<{
    key: string;
    values: Array<{ value: string; count: number }>;
  }>;
  availableStockStatuses: Array<{ status: StockStatus; count: number }>;
}
