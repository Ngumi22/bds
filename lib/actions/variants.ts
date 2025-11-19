"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "../prisma";
import {
  PRODUCT_VARIANTS_KEY,
  PRODUCTS_TAG,
  VARIANTS_TAG,
  withCache,
} from "../constants";
import { VariantGroupSchema } from "../schemas/variant-schema";

export async function createVariantGroup(
  productId: string,
  data: {
    name: string;
    options: Array<{
      name: string;
      value?: string | null;
      color?: string | null;
      priceModifier: number;
      stockCount: number;
    }>;
  }
) {
  try {
    const validated = VariantGroupSchema.parse(data);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, hasVariants: true },
    });
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    if (!product.hasVariants) {
      await prisma.product.update({
        where: { id: productId },
        data: { hasVariants: true },
      });
    }

    const variantGroup = await prisma.variantGroup.create({
      data: {
        productId,
        name: validated.name,
        options: {
          create: validated.options.map((option) => ({
            name: option.name,
            value: option.value ?? null,
            color: option.color,
            priceModifier: option.priceModifier,
            stockCount: option.stockCount,
            inStock: option.stockCount > 0,
          })),
        },
      },
      include: { options: true },
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(VARIANTS_TAG(productId));
    revalidateTag(PRODUCT_VARIANTS_KEY(productId));
    revalidatePath(`/dashboard/products/${product.slug}`);
    revalidatePath(`/products/${product.slug}`);

    return { success: true, variantGroup };
  } catch (error) {
    console.error("Create variant group error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create variant group.",
    };
  }
}

export async function updateVariantGroup(
  id: string,
  data: {
    name: string;
    options: Array<{
      id?: string;
      name: string;
      value?: string | null;
      color?: string | null;
      priceModifier: number;
      stockCount: number;
    }>;
  }
) {
  try {
    const validated = VariantGroupSchema.parse(data);

    const existingGroup = await prisma.variantGroup.findUnique({
      where: { id },
      include: { product: { select: { id: true, slug: true } } },
    });
    if (!existingGroup) {
      return { success: false, error: "Variant group not found." };
    }

    await prisma.variantOption.deleteMany({
      where: { variantGroupId: id },
    });

    const variantGroup = await prisma.variantGroup.update({
      where: { id },
      data: {
        name: validated.name,
        options: {
          create: validated.options.map((option) => ({
            name: option.name,
            value: option.value ?? "",
            color: option.color,
            priceModifier: option.priceModifier,
            stockCount: option.stockCount,
            inStock: option.stockCount > 0,
          })),
        },
      },
      include: { options: true },
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(VARIANTS_TAG(existingGroup.product.id));
    revalidateTag(PRODUCT_VARIANTS_KEY(existingGroup.product.id));
    revalidatePath(`/dashboard/products/${existingGroup.product.slug}`);
    revalidatePath(`/products/${existingGroup.product.slug}`);

    return { success: true, variantGroup };
  } catch (error) {
    console.error("Update variant group error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update variant group.",
    };
  }
}

export async function deleteVariantGroup(id: string) {
  try {
    const existingGroup = await prisma.variantGroup.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, slug: true } },
      },
    });
    if (!existingGroup) {
      return { success: false, error: "Variant group not found." };
    }

    await prisma.variantGroup.delete({ where: { id } });

    const remaining = await prisma.variantGroup.count({
      where: { productId: existingGroup.product.id },
    });
    if (remaining === 0) {
      await prisma.product.update({
        where: { id: existingGroup.product.id },
        data: { hasVariants: false },
      });
    }

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(VARIANTS_TAG(existingGroup.product.id));
    revalidateTag(PRODUCT_VARIANTS_KEY(existingGroup.product.id));
    revalidatePath(`/dashboard/products/${existingGroup.product.slug}`);
    revalidatePath(`/products/${existingGroup.product.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Delete variant group error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete variant group.",
    };
  }
}

export const getVariantGroupsByProductId = async (productId: string) => {
  return withCache(
    [PRODUCT_VARIANTS_KEY(productId)],
    [PRODUCTS_TAG, VARIANTS_TAG(productId), PRODUCT_VARIANTS_KEY(productId)],
    async () => {
      const variantGroups = await prisma.variantGroup.findMany({
        where: { productId },
        include: { options: true },
        orderBy: { name: "asc" },
      });
      return variantGroups;
    }
  )();
};
