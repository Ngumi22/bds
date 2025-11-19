export type MinimalProductData = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  categoryId: string;
  mainImage: string;
  slug: string;
  stockStatus:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK"
    | "DISCONTINUED"
    | "BACKORDER";
  hasVariants: boolean;
  isActive?: boolean;
};

export type CartStoreProductData = {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  stock: number;
  sku: string;
};

export type ReviewData = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images: string[];
};

export type FullProductData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  hasVariants: boolean;
  stockStatus: MinimalProductData["stockStatus"];

  brand: { name: string; slug: string; logo: string | null };
  category: { name: string; slug: string };

  specifications: Record<string, string | number | null>;

  rating: number;
  reviewCount: number;
  reviews: ReviewData[];

  variantGroups: Array<{
    name: string;
    options: Array<{
      id: string;
      value: string;
      hexCode: string | null;
      image: string | null;
    }>;
  }>;

  variants: Array<{
    id: string;
    sku: string;
    stock: number;
    price: number;
    combinations: string[];
  }>;

  sku: string;
  tags: string[];
  videoUrl: string | null;
};

export type ProductListingResult = {
  products: MinimalProductData[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  filters: {
    sortBy: string;
    search: string;
    categoryId: string | null;
  };
};

export type ServerActionResult<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};
