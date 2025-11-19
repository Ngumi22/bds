"use server";

import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import {
  Prisma,
  CollectionType,
  Collection,
  ProductsOnCollections,
} from "@prisma/client";
import {
  CollectionFormData,
  collectionFormSchema,
} from "@/lib/schemas/collection";
import prisma from "../prisma";
import {
  COLLECTION_TAG,
  COLLECTIONS_CACHE_TTL,
  COLLECTIONS_TAG,
} from "../constants";
import { createCachedProductFetcher } from "./products";
import { MinimalProductData } from "../utils/flash-sale";
import {
  mapPrismaProductToMinimal,
  minimalProductSelect,
} from "../product/product.helpers";

export type CollectionWithProduct = Collection & {
  products: MinimalProductData[];
};

export interface CollectionWithProducts extends Collection {
  products: (ProductsOnCollections & {
    product: MinimalProductData;
  })[];
  productCount: number;
}

export async function createCollection(rawData: CollectionFormData) {
  try {
    const data = collectionFormSchema.parse(rawData);

    const existingSlug = await prisma.collection.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        message: "A collection with this slug already exists.",
      };
    }

    const collectionData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      collectionType: data.collectionType,
      products: {
        create: data.productIds.map((pid, index) => ({
          product: { connect: { id: pid } },
          order: index,
        })),
      },
    };

    if (data.collectionType === "FLASH_SALE") {
      collectionData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
      collectionData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    }

    const collection = await prisma.collection.create({
      data: collectionData,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    revalidateTag(COLLECTIONS_TAG);
    revalidatePath("/");
    revalidatePath("/dashboard/marketing/collections");
    revalidatePath("/products");

    return { success: true, data: collection };
  } catch (error: any) {
    console.error("CreateCollection error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A collection with this slug already exists.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to create collection.",
    };
  }
}

export async function updateCollection(
  id: string,
  rawData: CollectionFormData
) {
  try {
    const data = collectionFormSchema.parse(rawData);

    if (data.slug) {
      const existingSlug = await prisma.collection.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        return {
          success: false,
          message: "Another collection with this slug already exists.",
        };
      }
    }

    const updateData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      collectionType: data.collectionType,
    };

    if (data.collectionType === "FLASH_SALE") {
      updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
      updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    } else {
      updateData.startsAt = null;
      updateData.endsAt = null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCollection = await tx.collection.update({
        where: { id },
        data: updateData,
      });

      await tx.productsOnCollections.deleteMany({
        where: { collectionId: id },
      });

      if (data.productIds.length > 0) {
        await tx.productsOnCollections.createMany({
          data: data.productIds.map((pid, index) => ({
            collectionId: id,
            productId: pid,
            order: index,
          })),
        });
      }

      return updatedCollection;
    });

    revalidateTag(COLLECTIONS_TAG);
    revalidateTag(COLLECTION_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/marketing/collections");
    revalidatePath("/products");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("UpdateCollection error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A collection with this slug already exists.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to update collection.",
    };
  }
}

export async function deleteCollection(id: string) {
  try {
    const bannersCount = await prisma.heroBanner.count({
      where: { collectionId: id },
    });

    if (bannersCount > 0) {
      return {
        success: false,
        message:
          "Cannot delete collection with associated banners. Please reassign or delete the banners first.",
      };
    }

    await prisma.collection.delete({ where: { id } });

    revalidateTag(COLLECTIONS_TAG);
    revalidateTag(COLLECTION_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/marketing/collections");
    revalidatePath("/products");

    return { success: true };
  } catch (error: any) {
    console.error("DeleteCollection error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "Collection not found.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to delete collection.",
    };
  }
}

export const getAllCollections = unstable_cache(
  async () => {
    return prisma.collection.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
                isActive: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        banners: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
            banners: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  [COLLECTIONS_TAG],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTIONS,
  }
);

export const getCollectionById = unstable_cache(
  async (id: string) => {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
                isActive: true,
                stockStatus: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        banners: {
          select: {
            id: true,
            title: true,
            tag: true,
            description: true,
            buttonText: true,
            image: true,
            linkUrl: true,
            isActive: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            products: true,
            banners: true,
          },
        },
      },
    });
  },
  ["collection"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTION,
  }
);

export const getCollectionBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
                originalPrice: true,
                stockStatus: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        banners: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            tag: true,
            description: true,
            buttonText: true,
            image: true,
            linkUrl: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            products: true,
            banners: true,
          },
        },
      },
    });
  },
  ["collection-by-slug"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTION,
  }
);

export const getActiveCollections = unstable_cache(
  async () => {
    return prisma.collection.findMany({
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
              },
            },
          },
          orderBy: { order: "asc" },
          take: 8,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["active-collections"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTIONS,
  }
);

export const getCollectionsByType = unstable_cache(
  async (collectionType: CollectionType) => {
    return prisma.collection.findMany({
      where: { collectionType },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
                originalPrice: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["collections-by-type"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTIONS,
  }
);

export const getCollectionsByTypeString = unstable_cache(
  async (collectionType: string) => {
    const validTypes = Object.values(CollectionType);
    if (!validTypes.includes(collectionType as CollectionType)) {
      throw new Error(`Invalid collection type: ${collectionType}`);
    }

    return prisma.collection.findMany({
      where: { collectionType: collectionType as CollectionType },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                price: true,
                originalPrice: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["collections-by-type-string"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTIONS,
  }
);

export const getCollectionsWithProducts = unstable_cache(
  async (): Promise<CollectionWithProducts[]> => {
    const collections = await prisma.collection.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return collections.map((collection) => ({
      ...collection,
      products: collection.products.map((p) => ({
        ...p,
        product: p.product as MinimalProductData,
      })),
      productCount: collection.products.length,
    }));
  },
  ["collections-with-products"],
  {
    tags: [COLLECTIONS_TAG],
    revalidate: COLLECTIONS_CACHE_TTL.COLLECTION,
  }
);

export interface FlashSaleData {
  products: MinimalProductData[];
  saleEndDate: Date;
  collectionName: string;
  collectionId: string;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hasEnded: boolean;
  };
}

export const getFlashSaleData = unstable_cache(
  async (): Promise<FlashSaleData | null> => {
    try {
      const now = new Date();

      const flashSaleCollection = await prisma.collection.findFirst({
        where: {
          collectionType: CollectionType.FLASH_SALE,
          OR: [
            { startsAt: { lte: now }, endsAt: { gte: now } },
            { startsAt: null, endsAt: null },
            { startsAt: { lte: now }, endsAt: null },
            { startsAt: null, endsAt: { gte: now } },
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          endsAt: true,
        },
      });

      if (!flashSaleCollection) return null;

      const flashSaleProducts = await (
        await createCachedProductFetcher({
          where: {
            collections: {
              some: { collection: { slug: flashSaleCollection.slug } },
            },
          },
          take: 6,
          cacheKey: `flash-sale-products-${flashSaleCollection.slug}`,
          tags: ["flash-sale", "products"],
          revalidate: 60 * 10, // 10 minutes
        })
      )();

      if (flashSaleProducts.length === 0) return null;

      const saleEndDate =
        flashSaleCollection.endsAt ??
        new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Calculate time left on the server
      const calculateTimeLeft = (endDate: Date) => {
        const now = Date.now();
        const difference = endDate.getTime() - now;

        if (difference <= 0) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            hasEnded: true,
          };
        }

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          hasEnded: false,
        };
      };

      const timeLeft = calculateTimeLeft(saleEndDate);

      return {
        products: flashSaleProducts.slice(0, 6), // Limit to 6 products
        saleEndDate,
        collectionName: flashSaleCollection.name,
        collectionId: flashSaleCollection.id,
        timeLeft,
      };
    } catch (error) {
      console.error("Error fetching flash sale data:", error);
      return null;
    }
  },
  ["flash-sale-data"],
  {
    tags: ["flash-sale", "products"],
    revalidate: 60 * 10, // 10 minutes
  }
);

export async function getCollectionsWithProductsData() {
  const now = new Date();

  const collections = await prisma.collection.findMany({
    where: {
      OR: [
        // Collections with no end date
        { endsAt: null },
        // Or collections that haven't ended yet
        { endsAt: { gte: now } },
      ],
      // Only show collections that have started (if startsAt exists)
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
      ],
      // Optional: you can add isActive if you have it in the schema
      // isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      collectionType: true,
      startsAt: true,
      endsAt: true,
      products: {
        orderBy: { order: "asc" },
        select: {
          product: {
            select: minimalProductSelect,
          },
        },
      },
      banners: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 1,
        select: {
          title: true,
          tag: true,
          description: true,
          image: true,
          linkUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return collections.map((collection) => {
    const banner = collection.banners[0];
    const products = collection.products.map((p) =>
      mapPrismaProductToMinimal(p.product)
    );

    return {
      id: collection.id,
      title: collection.name,
      subtitle: collection.description ?? banner?.description ?? "",
      slug: collection.slug,
      bannerImage: banner?.image ?? null,
      collectionType: collection.collectionType,
      startsAt: collection.startsAt,
      endsAt: collection.endsAt,
      seo: {
        title:
          banner?.title ??
          `${
            collection.name
          } | ${collection.collectionType.toLowerCase()} Collection`,
        description:
          banner?.description ??
          collection.description ??
          `Discover top tech in our ${collection.name} collection.`,
        keywords: [
          collection.slug.replace(/-/g, " "),
          collection.collectionType.toLowerCase(),
          ...new Set(
            products.flatMap((p) => (p.brand ? [p.brand.toLowerCase()] : []))
          ),
        ],
      },
      products,
    };
  });
}
