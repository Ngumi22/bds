"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  FEATURES_TAG,
  PRODUCT_FEATURES_CACHE_TTL,
  PRODUCT_FEATURES_TAG,
  PRODUCT_TAG,
  PRODUCTS_TAG,
} from "../constants";

export const getProductFeatures = unstable_cache(
  async (productId: string) => {
    return prisma.productFeature.findMany({
      where: { productId },
      orderBy: { id: "asc" },
    });
  },
  ["product-features"],
  {
    tags: [FEATURES_TAG],
    revalidate: PRODUCT_FEATURES_CACHE_TTL.PRODUCT_FEATURES,
  }
);

export async function addFeature(
  productId: string,
  title: string,
  description: string,
  icon: string
) {
  try {
    if (!title.trim() || !description.trim() || !icon.trim()) {
      return {
        success: false,
        error: "Title, description, and icon are required.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const feature = await prisma.productFeature.create({
      data: {
        productId,
        title: title.trim(),
        description: description.trim(),
        icon: icon.trim(),
      },
    });

    revalidateTag(FEATURES_TAG);
    revalidateTag(PRODUCT_FEATURES_TAG(productId));
    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(product.slug));
    revalidatePath(`/dashboard/products/${productId}`);
    revalidatePath(`/products/${product.slug}`);

    return { success: true, feature };
  } catch (error) {
    console.error("Add feature error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { success: false, error: "Product not found." };
    }

    return { success: false, error: "Failed to add feature." };
  }
}

export async function updateFeature(
  featureId: string,
  title: string,
  description: string,
  icon: string
) {
  try {
    if (!title.trim() || !description.trim() || !icon.trim()) {
      return {
        success: false,
        error: "Title, description, and icon are required.",
      };
    }

    const existingFeature = await prisma.productFeature.findUnique({
      where: { id: featureId },
      include: {
        product: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!existingFeature) {
      return { success: false, error: "Feature not found." };
    }

    const feature = await prisma.productFeature.update({
      where: { id: featureId },
      data: {
        title: title.trim(),
        description: description.trim(),
        icon: icon.trim(),
      },
    });

    revalidateTag(FEATURES_TAG);
    revalidateTag(PRODUCT_FEATURES_TAG(existingFeature.productId));
    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(existingFeature.product.slug));
    revalidatePath(`/dashboard/products/${existingFeature.productId}`);
    revalidatePath(`/products/${existingFeature.product.slug}`);

    return { success: true, feature };
  } catch (error) {
    console.error("Update feature error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Feature not found." };
    }

    return { success: false, error: "Failed to update feature." };
  }
}

export async function deleteFeature(featureId: string) {
  try {
    const feature = await prisma.productFeature.findUnique({
      where: { id: featureId },
      include: {
        product: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!feature) {
      return { success: false, error: "Feature not found." };
    }

    await prisma.productFeature.delete({
      where: { id: featureId },
    });

    revalidateTag(FEATURES_TAG);
    revalidateTag(PRODUCT_FEATURES_TAG(feature.productId));
    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(feature.product.slug));
    revalidatePath(`/dashboard/products/${feature.productId}`);
    revalidatePath(`/products/${feature.product.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Delete feature error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Feature not found." };
    }

    return { success: false, error: "Failed to delete feature." };
  }
}

export const getFeaturesByProductId = unstable_cache(
  async (productId: string) => {
    const features = await prisma.productFeature.findMany({
      where: { productId },
      orderBy: { id: "asc" },
    });

    return { success: true, features };
  },
  ["features-by-product"],
  {
    tags: [FEATURES_TAG],
    revalidate: PRODUCT_FEATURES_CACHE_TTL.PRODUCT_FEATURES,
  }
);

export async function updateFeatureOrder(featureIds: string[]) {
  try {
    if (featureIds.length === 0) {
      return { success: true };
    }

    const firstFeature = await prisma.productFeature.findUnique({
      where: { id: featureIds[0] },
      select: { productId: true, product: { select: { slug: true } } },
    });

    if (!firstFeature) {
      return { success: false, error: "Feature not found." };
    }

    revalidateTag(FEATURES_TAG);
    revalidateTag(PRODUCT_FEATURES_TAG(firstFeature.productId));
    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(firstFeature.product.slug));
    revalidatePath(`/dashboard/products/${firstFeature.productId}`);
    revalidatePath(`/products/${firstFeature.product.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Update feature order error:", error);
    return { success: false, error: "Failed to update feature order." };
  }
}

export const getFeaturesWithProducts = unstable_cache(
  async () => {
    const features = await prisma.productFeature.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
          },
        },
      },
      orderBy: { productId: "asc" },
    });

    return { success: true, features };
  },
  ["features-with-products"],
  {
    tags: [FEATURES_TAG],
    revalidate: PRODUCT_FEATURES_CACHE_TTL.PRODUCT_FEATURES,
  }
);
