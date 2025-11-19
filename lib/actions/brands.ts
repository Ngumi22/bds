"use server";

import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { brandFormSchema } from "@/lib/schemas/brands";
import prisma from "../prisma";
import { generateSlug } from "../utils/form-helpers";
import { BRAND_CACHE_TTL, BRAND_TAG, BRANDS_TAG } from "../constants";

type BrandFormData = z.infer<typeof brandFormSchema>;

export async function createBrand(formData: BrandFormData) {
  try {
    const data = brandFormSchema.parse(formData);
    const slug = data.slug?.trim() || generateSlug(data.name);

    const existing = await prisma.brand.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });

    if (existing) {
      return { success: false, error: `Brand "${data.name}" already exists.` };
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        logo: data.logo,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    revalidateTag(BRANDS_TAG);
    revalidatePath("/");
    revalidatePath("/dashboard/brands");
    revalidatePath("/products");

    return { success: true, data: brand };
  } catch (error) {
    console.error("Create brand failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A brand with this name or slug already exists.",
      };
    }

    return { success: false, error: "Failed to create brand." };
  }
}

export async function updateBrand(id: string, formData: BrandFormData) {
  try {
    const data = brandFormSchema.parse(formData);
    const slug = data.slug?.trim() || generateSlug(data.name);

    const existing = await prisma.brand.findFirst({
      where: {
        AND: [{ id: { not: id } }, { OR: [{ name: data.name }, { slug }] }],
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Another brand with name "${data.name}" or slug "${slug}" already exists.`,
      };
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        logo: data.logo,
        description: data.description,
        isActive: data.isActive,
      },
    });

    revalidateTag(BRANDS_TAG);
    revalidateTag(BRAND_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/brands");
    revalidatePath("/products");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Update brand failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Brand not found." };
    }

    return { success: false, error: "Failed to update brand." };
  }
}

export async function updateBrandStatus(id: string, isActive: boolean) {
  try {
    await prisma.brand.update({
      where: { id },
      data: { isActive },
    });

    revalidateTag(BRANDS_TAG);
    revalidateTag(BRAND_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/brands");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Update brand status failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Brand not found." };
    }

    return { success: false, error: "Failed to update brand status." };
  }
}

export async function deleteBrand(id: string) {
  try {
    const productsCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete brand with associated products. Please reassign or delete the products first.",
      };
    }

    await prisma.brand.delete({ where: { id } });

    revalidateTag(BRANDS_TAG);
    revalidateTag(BRAND_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/brands");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete brand failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Brand not found." };
    }

    return { success: false, error: "Failed to delete brand." };
  }
}

export const getAllBrands = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },
  [BRANDS_TAG],
  {
    tags: [BRANDS_TAG],
    revalidate: BRAND_CACHE_TTL.BRANDS,
  }
);

export const getBrandById = unstable_cache(
  async (id: string) => {
    return prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },
  ["brand"],
  {
    tags: [BRANDS_TAG],
    revalidate: BRAND_CACHE_TTL.BRAND,
  }
);

export const getActiveBrands = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    });
  },
  ["active-brands"],
  {
    tags: [BRANDS_TAG],
    revalidate: BRAND_CACHE_TTL.BRANDS,
  }
);

export const getBrandBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.brand.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        isActive: true,
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            mainImage: true,
            stockStatus: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  },
  ["brand-by-slug"],
  {
    tags: [BRANDS_TAG],
    revalidate: BRAND_CACHE_TTL.BRAND,
  }
);
