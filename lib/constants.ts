import { unstable_cache } from "next/cache";
import {
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  ShieldPlus,
  Smartphone,
} from "lucide-react";

export const WhatsappPhoneNumber = +254112725364;

export const categoryIcons = {
  laptops: Laptop,
  smartphones: Smartphone,
  "desktop-computers": Monitor,
  "softwares-and-antivirus": ShieldPlus,
  accessories: Headphones,
  gaming: Gamepad2,
};

export const PRODUCTS_TAG = "products";
export const PRODUCT_TAG = (slug: string) => `product-${slug}`;
export const ATLAS_SEARCH_INDEX_NAME = "products";

export const PRODUCT_CACHE_TTL = {
  PRODUCTS: 300, // 5 minutes
  PRODUCT: 600, // 10 minutes
  PRODUCT_DETAIL: 900, // 15 minutes for detailed product pages
} as const;

export const VARIANTS_TAG = (productId: string) => `variants-${productId}`;
export const PRODUCT_VARIANTS_KEY = (productId: string) =>
  `product:${productId}:variants`;

export const BLOG_CACHE_TTL = {
  BLOG_CATEGORIES: 300, // 5 minutes
  BLOG_CATEGORY: 600, // 10 minutes
  BLOG_POSTS: 300, // 5 minutes
  BLOG_POST: 600, // 10 minutes
} as const;

export const BLOG_CATEGORY_TAG = (id: string) => `${BLOG_CATEGORIES_TAG}:${id}`;
export const BLOG_POST_TAG = (id: string) => `${BLOG_POSTS_TAG}:${id}`;
export const BLOG_CATEGORIES_TAG = "blog-categories";
export const BLOG_POSTS_TAG = "blog-posts";

export const BRANDS_TAG = "brands";

export const BRAND_CACHE_TTL = {
  BRANDS: 300, // 5 minutes
  BRAND: 600, // 10 minutes
} as const;

// Tag helpers
export const BRAND_TAG = (id: string) => `${BRANDS_TAG}:${id}`;

export const CATEGORIES_TAG = "categories";

export const CATEGORIES_CACHE_TTL = {
  CATEGORIES: 300, // 5 minutes
  CATEGORY: 600, // 10 minutes
} as const;

// Tag helpers
export const CATEGORY_TAG = (id: string) => `${CATEGORIES_TAG}:${id}`;

export const COLLECTIONS_TAG = "collections";

// Cache TTL constants
export const COLLECTIONS_CACHE_TTL = {
  COLLECTIONS: 300, // 5 minutes
  COLLECTION: 600, // 10 minutes
} as const;

// Tag helpers
export const COLLECTION_TAG = (id: string) => `${COLLECTIONS_TAG}:${id}`;

export const FEATURES_TAG = "product-features";

export const PRODUCT_FEATURES_CACHE_TTL = {
  PRODUCT_FEATURES: 300,
} as const;

export const PRODUCT_FEATURES_TAG = (productId: string) =>
  `${FEATURES_TAG}:${productId}`;

export const MEGA_MENU_CACHE_KEYS = {
  MEGA_MENU: "mega_menu_categories",
  BRANDS: "brands_list",
  FEATURED_PRODUCTS: "featured_products",
};

export const HERO_BANNERS_TAG = "hero-banners";

export function withCache<T>(
  key: string[],
  tags: string[],
  fn: () => Promise<T>
) {
  return unstable_cache(fn, key, { tags });
}
