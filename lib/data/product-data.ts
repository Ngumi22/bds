"use server";

import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma"; // Adjust path to your prisma client
import { PRODUCTS_TAG } from "@/lib/constants"; // Adjust path to your constants

/**
 * Transforms raw Prisma relational data into a clean, flat structure for the UI.
 * This prevents "Cannot convert undefined to object" errors by ensuring
 * specifications are objects, not arrays.
 */
function transformProductData(prismaProduct: any) {
  if (!prismaProduct) return null;

  // 1. Transform Variant Groups
  const variantTypes =
    prismaProduct.variantGroups?.map((group: any) => ({
      name: group.name,
      options: group.options.map((option: any) => ({
        id: option.id,
        name: option.name,
        color: option.color || undefined,
        inStock: option.inStock,
        stockCount: option.stockCount,
        priceModifier: option.priceModifier,
      })),
    })) || [];

  // 2. Flatten Specifications (CRITICAL FIX)
  // Converts [{ value: "10kg", specificationDef: { name: "Weight" } }]
  // into { "Weight": "10kg" }
  const specifications =
    prismaProduct.specifications?.reduce(
      (acc: Record<string, string>, spec: any) => {
        const key = spec.specificationDef?.name;
        const value = spec.value;
        // Only add if both key and value exist
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    ) || {};

  // 3. Map Features with Fallbacks
  const features =
    prismaProduct.features?.map((feature: any) => ({
      icon: feature.icon,
      // specific fallback in case DB column is 'name' instead of 'title'
      title: feature.title || feature.name,
      // specific fallback in case DB column is 'details' instead of 'description'
      description: feature.description || feature.details,
    })) || [];

  // 4. Calculate Delivery Date
  const deliveryDate = new Date();
  deliveryDate.setDate(
    deliveryDate.getDate() + (prismaProduct.shippingInfo?.estimatedDays || 7)
  );

  // 5. Find Active Discount
  const activeDiscount = prismaProduct.applicableDiscounts?.find(
    (discount: any) =>
      discount.discount?.isActive &&
      discount.discount?.startsAt <= new Date() &&
      (!discount.discount.expiresAt || discount.discount.expiresAt > new Date())
  );

  // 6. Return Final Shape
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    slug: prismaProduct.slug,
    sku: prismaProduct.sku || "",
    description: prismaProduct.description,
    shortDescription: prismaProduct.shortDescription || undefined,

    // Pricing & Stock
    price: Number(prismaProduct.price),
    originalPrice: prismaProduct.originalPrice
      ? Number(prismaProduct.originalPrice)
      : undefined,
    inStock:
      prismaProduct.stockStatus !== "OUT_OF_STOCK" &&
      prismaProduct.stockStatus !== "DISCONTINUED",
    stockCount: prismaProduct.stockCount || 0,
    viewingNow: prismaProduct.viewingNow || 0,

    // Metadata
    rating: prismaProduct.averageRating || 0,
    reviewCount: prismaProduct.reviewCount || 0,
    brand: prismaProduct.brand?.name || "",
    brandStory: prismaProduct.brand?.description || undefined,
    category: prismaProduct.category?.name || "",
    collection: prismaProduct.collections?.[0]?.collection?.name || undefined,

    // Transformed Data
    specifications, // <--- This is now a safe Object
    variantTypes:
      prismaProduct.variantGroups?.length > 0 ? variantTypes : undefined,
    features: features.length > 0 ? features : undefined,

    // Images
    images: [
      prismaProduct.mainImage,
      ...(prismaProduct.galleryImages || []),
    ].filter(Boolean),
    videoUrl: prismaProduct.videoUrl || undefined,

    // Shipping & Delivery
    deliveryDate: deliveryDate.toISOString().split("T")[0],
    shipsIn:
      prismaProduct.shipsIn ||
      `${prismaProduct.shippingInfo?.estimatedDays || 7} business days`,
    shipping: prismaProduct.shippingInfo
      ? {
          freeShipping: prismaProduct.shippingInfo.freeShipping,
          estimatedDays: prismaProduct.shippingInfo.estimatedDays || 7,
          returnPolicy: prismaProduct.shippingInfo.returnPolicy,
          warranty:
            prismaProduct.shippingInfo.warranty ||
            "1-year manufacturer warranty",
          estimatedDelivery: `Estimated delivery: ${
            prismaProduct.shippingInfo.estimatedDays || 7
          } business days`,
        }
      : undefined,

    // Offer Logic
    offerEndsIn: activeDiscount?.discount?.expiresAt
      ? Math.ceil(
          (new Date(activeDiscount.discount.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : undefined,

    // Reviews
    reviews:
      prismaProduct.reviews?.map((review: any) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        date: review.createdAt.toISOString().split("T")[0],
        title: review.title || "",
        content: review.comment,
        verified: review.verified,
      })) || [],

    guarantee: prismaProduct.guarantee,
    recentPurchases: prismaProduct.recentPurchases || [],
  };
}

export const getProduct = async (slug: string) =>
  unstable_cache(
    async () => {
      const prismaProduct = await prisma.product.findUnique({
        where: { slug },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          features: true,
          reviews: {
            where: {
              isPublished: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          shippingInfo: true,
          specifications: {
            include: {
              specificationDef: {
                select: {
                  name: true,
                },
              },
            },
          },
          variantGroups: {
            include: {
              options: {
                orderBy: {
                  name: "asc",
                },
              },
            },
            orderBy: {
              name: "asc",
            },
          },
          collections: {
            include: {
              collection: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
          applicableDiscounts: {
            include: {
              discount: {
                select: {
                  id: true,
                  name: true,
                  expiresAt: true,
                  isActive: true,
                  startsAt: true,
                },
              },
            },
            where: {
              discount: {
                isActive: true,
                startsAt: {
                  lte: new Date(),
                },
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            },
          },
        },
      });

      return transformProductData(prismaProduct);
    },
    [`product-${slug}`],
    {
      revalidate: 3600,
      tags: [PRODUCTS_TAG, `${PRODUCTS_TAG}:${slug}`],
    }
  )();

export const getProductFromDb = async (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          category: true,
          features: true,
          reviews: true,
          shippingInfo: true,
          specifications: {
            include: {
              specificationDef: true,
            },
          },
          variantGroups: {
            include: {
              options: true,
            },
          },
          collections: {
            include: {
              collection: true,
            },
          },
          applicableDiscounts: {
            include: {
              discount: true,
            },
          },
        },
      });
    },
    [`product-${slug}`],
    { revalidate: 3600, tags: [PRODUCTS_TAG, `${PRODUCTS_TAG}:${slug}`] }
  )();
