"use server";

import { unstable_cache } from "next/cache";
import prisma from "../prisma";

import { Collection, CollectionType, Prisma } from "@prisma/client";
import { normalizeColorValue } from "../utils/color-helpers";
import { MinimalProductData } from "../product/product.types";
import { PRODUCT_CACHE_TTL, PRODUCTS_TAG } from "../constants";

export interface CategoryWithDiscountedProducts {
  id: string;
  name: string;
  image?: string;
  slug: string;
  products: (MinimalProductData & { discountPercentage: number })[];
}

export type CollectionWithProducts = Omit<Collection, "products"> & {
  products: MinimalProductData[];
};

const mapPrismaProductToMinimal = (p: any): MinimalProductData => {
  const colorVariants =
    p.variantGroups
      ?.flatMap((group: any) =>
        group.options.map((opt: any) => {
          const colorValue =
            opt.color ||
            normalizeColorValue(opt.value) ||
            normalizeColorValue(opt.name);
          return { name: opt.name, value: opt.value, color: colorValue };
        })
      )
      .filter((c: any) => !!c.color)
      .filter(
        (v: any, i: any, a: any) =>
          a.findIndex(
            (x: any) => x.color?.toLowerCase() === v.color?.toLowerCase()
          ) === i
      ) || [];

  const computedHasVariants =
    (p.variantGroups && p.variantGroups.length > 0) ||
    p.variantGroups?.some((g: any) => g.options.length > 0) ||
    false;

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    categoryId: p.categoryId,
    mainImage: p.mainImage,
    slug: p.slug,
    brand: p.brand?.name,
    category: p.category?.parent?.name,
    stockStatus: p.stockStatus,
    hasVariants: computedHasVariants,
    isActive: p.isActive,
    collections: p.collections?.map((pc: any) => ({
      id: pc.id,
      collection: pc.collection,
    })),
    colorVariants,
  };
};

const minimalProductSelect: Prisma.ProductSelect = {
  id: true,
  name: true,
  price: true,
  originalPrice: true,
  categoryId: true,
  mainImage: true,
  brand: true,
  slug: true,
  stockStatus: true,
  hasVariants: true,
  isActive: true,
  features: true,
  category: {
    select: {
      parent: { select: { id: true, name: true, slug: true } },
    },
  },
  collections: {
    include: {
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          collectionType: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
  },
  variantGroups: {
    include: {
      options: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  },
};

interface ProductQueryOptions {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
  take: number;
  cacheKey: string;
  tags?: string[];
  revalidate?: number;
}

const cleanPrismaWhere = (where: any): Prisma.ProductWhereInput => {
  if (!where || typeof where !== "object") return where;
  const cleaned: any = {};
  for (const key in where) {
    const value = where[key];
    if (value === undefined || value === null) continue;
    if (typeof value === "object" && value !== null) {
      cleaned[key] = cleanPrismaWhere(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

export async function createCachedProductFetcher({
  where,
  orderBy = { createdAt: "desc" },
  cacheKey,
  tags = ["products"],
  revalidate = 60 * 60,
  take,
}: ProductQueryOptions) {
  const cleanWhere = cleanPrismaWhere(where);

  return unstable_cache(
    async (): Promise<MinimalProductData[]> => {
      const products = await prisma.product.findMany({
        where: cleanWhere,
        orderBy,
        take,
        select: minimalProductSelect,
      });

      return products.map(mapPrismaProductToMinimal);
    },
    [cacheKey],
    {
      tags,
      revalidate,
    }
  );
}

export const getFeaturedProducts = await createCachedProductFetcher({
  where: { featured: true, isActive: true },
  take: 10,
  cacheKey: "featured-products",
  tags: ["featured-products", "products"],
});

export const getNewArrivals = await createCachedProductFetcher({
  where: { isActive: true },
  take: 10,
  orderBy: { createdAt: "desc" },
  cacheKey: "new-arrivals",
  tags: ["new-arrivals", "products"],
});

export const getDiscountedProducts = unstable_cache(
  async (): Promise<
    (MinimalProductData & { discountPercentage: number })[]
  > => {
    const rawProducts = await prisma.product.findMany({
      where: {
        originalPrice: { not: null },
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
      select: minimalProductSelect,
    });

    return rawProducts
      .filter((p) => p.originalPrice !== null && p.price < p.originalPrice)
      .map((p) => ({
        ...mapPrismaProductToMinimal(p),
        discountPercentage: Math.round(
          ((p.originalPrice! - p.price) / p.originalPrice!) * 100
        ),
      }))
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, 10);
  },
  ["discounted-products-optimized"],
  {
    tags: ["discounted-products", "products"],
    revalidate: 60 * 60,
  }
);

export const getSpecialOffersData = unstable_cache(
  async (): Promise<CategoryWithDiscountedProducts[]> => {
    const parentCategories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: {
        id: true,
        name: true,
        image: true,
        slug: true,
        children: { select: { id: true } },
      },
    });

    const categoriesWithDiscounts = await Promise.all(
      parentCategories.map(async (category) => {
        const categoryIds = [
          category.id,
          ...category.children.map((child) => child.id),
        ];

        const cacheKey = `discounted-products-${category.id}`;
        const tags = [
          "discounted-products",
          "products",
          `category-${category.id}`,
        ];

        const fetcher = unstable_cache(
          async (): Promise<
            (MinimalProductData & { discountPercentage: number })[]
          > => {
            const rawProducts = await prisma.product.findMany({
              where: {
                categoryId: { in: categoryIds },
                originalPrice: { not: null },
                isActive: true,
              },
              orderBy: { createdAt: "desc" },
              take: 200,
              select: minimalProductSelect,
            });

            return rawProducts
              .filter(
                (p) => p.originalPrice !== null && p.price < p.originalPrice
              )
              .map((p) => ({
                ...mapPrismaProductToMinimal(p),
                discountPercentage: Math.round(
                  ((p.originalPrice! - p.price) / p.originalPrice!) * 100
                ),
              }))
              .sort((a, b) => b.discountPercentage - a.discountPercentage)
              .slice(0, 10);
          },
          [cacheKey],
          { tags, revalidate: 60 * 30 }
        );

        const discountedProducts = await fetcher();

        return {
          id: category.id,
          name: category.name,
          image: category.image ?? "",
          slug: category.slug,
          products: discountedProducts,
        };
      })
    );

    return categoriesWithDiscounts.filter((c) => c.products.length > 0);
  },
  ["special-offers-data"],
  {
    tags: ["special-offers", "categories", "products"],
    revalidate: 60 * 30,
  }
);

export const getCollectionsWithProducts = unstable_cache(
  async (productLimit: number = 5): Promise<CollectionWithProducts[]> => {
    const collections = await prisma.collection.findMany({
      where: {
        collectionType: { not: CollectionType.FLASH_SALE },
        products: { some: { product: { isActive: true } } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        collectionType: true,
        startsAt: true,
        endsAt: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const collectionsWithData = await Promise.all(
      collections.map(async (collection) => {
        const fetchProducts = await createCachedProductFetcher({
          where: {
            collections: { some: { collectionId: collection.id } },
            isActive: true,
          },
          take: productLimit,
          cacheKey: `collection-products-${collection.id}-${productLimit}`,
          tags: ["products", `collection-${collection.id}`],
        });

        const products = await fetchProducts();

        return {
          ...collection,
          products,
        };
      })
    );

    return collectionsWithData.filter((c) => c.products.length > 0);
  },
  ["home-collections-with-products"],
  {
    tags: ["collections", "products"],
    revalidate: 60 * 15,
  }
);

export interface ParentCategoryWithSubCategoriesData {
  name: string;
  slug: string;
  image: string;
  subCategories: {
    name: string;
    slug: string;
    products: MinimalProductData[];
  }[];
}

export const getParentCategoriesWithProducts = unstable_cache(
  async (): Promise<ParentCategoryWithSubCategoriesData[]> => {
    const parentCategories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: {
        name: true,
        slug: true,
        image: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            products: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
              take: 10,
              select: minimalProductSelect,
            },
          },
        },
      },
    });

    const categoriesWithProducts = parentCategories.map((parent) => {
      const subCategoriesWithProducts = parent.children.map((subCat) => ({
        name: subCat.name,
        slug: subCat.slug,
        products: subCat.products.map(mapPrismaProductToMinimal),
      }));

      return {
        name: parent.name,
        slug: parent.slug,
        image: parent.image ?? "",
        subCategories: subCategoriesWithProducts.filter(
          (s) => s.products.length > 0
        ),
      };
    });

    return categoriesWithProducts.filter((c) => c.subCategories.length > 0);
  },
  ["parent-categories-with-products"],
  {
    tags: ["categories", "products"],
    revalidate: 60 * 30,
  }
);

export interface BrandWithProducts {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  products: MinimalProductData[];
}

export const getBrandsWithProducts = unstable_cache(
  async (productLimit: number = 6): Promise<BrandWithProducts[]> => {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        products: { some: { isActive: true } },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        isActive: true,
      },
    });

    const brandsWithData = await Promise.all(
      brands.map(async (brand) => {
        const fetchProducts = await createCachedProductFetcher({
          where: {
            brandId: brand.id,
            isActive: true,
          },
          take: productLimit,
          orderBy: { createdAt: "desc" },
          cacheKey: `brand-products-${brand.id}-${productLimit}`,
          tags: [PRODUCTS_TAG, `brand-${brand.id}`],
        });

        const products = await fetchProducts();

        return {
          ...brand,
          products,
        };
      })
    );

    return brandsWithData.filter((brand) => brand.products.length > 0);
  },
  ["home-brands-with-products"],
  {
    tags: ["brands", PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);
