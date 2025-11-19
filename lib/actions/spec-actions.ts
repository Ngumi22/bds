"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import prisma from "../prisma";

const PRODUCTS_TAG = "products";
const SPECIFICATIONS_TAG = "specifications";

const SPEC_TAG = (productId: string) => `specs-${productId}`;

// 🔹 Get specifications for a product (cached)
export const getProductSpecifications = unstable_cache(
  async (productId: string) => {
    const specs = await prisma.productSpecificationValue.findMany({
      where: { productId },
      include: { specificationDef: true },
    });
    return specs;
  },
  ["getProductSpecifications"],
  {
    revalidate: 60,
  }
);

export async function addSpecification(
  productId: string,
  specificationDefId: string,
  value: string
) {
  try {
    const specification = await prisma.productSpecificationValue.create({
      data: { productId, specificationDefId, value },
      include: { specificationDef: true },
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(SPECIFICATIONS_TAG);

    return { success: true, specification };
  } catch (error) {
    console.error("Add specification error:", error);
    return { success: false, message: "Failed to add specification." };
  }
}

export async function updateSpecification(id: string, value: string) {
  try {
    const updated = await prisma.productSpecificationValue.update({
      where: { id },
      data: { value },
      include: { specificationDef: true },
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(SPECIFICATIONS_TAG);

    return { success: true, updated };
  } catch (error) {
    console.error("Update specification error:", error);
    return { success: false, message: "Failed to update specification." };
  }
}

export async function deleteSpecification(id: string) {
  try {
    await prisma.productSpecificationValue.delete({ where: { id } });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(SPECIFICATIONS_TAG);

    return { success: true };
  } catch (error) {
    console.error("Delete specification error:", error);
    return { success: false, message: "Failed to delete specification." };
  }
}
