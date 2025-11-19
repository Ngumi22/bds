"use server";

import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { categoryFormSchema } from "@/lib/schemas/category";
import prisma from "../prisma";
import { generateSlug } from "../utils/form-helpers";
import {
  CATEGORIES_CACHE_TTL,
  CATEGORIES_TAG,
  CATEGORY_TAG,
  MEGA_MENU_CACHE_KEYS,
} from "../constants";

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export async function createCategory(formData: CategoryFormData) {
  try {
    const data = categoryFormSchema.parse(formData);
    const slug = data.slug?.trim() || generateSlug(data.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return {
        success: false,
        error: `A category with slug "${slug}" already exists.`,
      };
    }

    if (data.parentId && data.parentId !== "none") {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parentCategory) {
        return {
          success: false,
          error: "Parent category not found.",
        };
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        image: data.image,
        isActive: data.isActive,
        parentId:
          data.parentId && data.parentId !== "none" ? data.parentId : null,
      },
    });

    revalidateTag(CATEGORIES_TAG);
    revalidatePath("/");
    revalidatePath("/dashboard/categories");
    revalidatePath("/products");

    return { success: true, category: newCategory };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }
    console.error("Create category failed:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, formData: CategoryFormData) {
  try {
    const data = categoryFormSchema.parse(formData);
    const slug = data.slug?.trim() || generateSlug(data.name);

    const existingSlug = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existingSlug) {
      return {
        success: false,
        error: `Another category with slug "${slug}" already exists.`,
      };
    }

    if (data.parentId && data.parentId !== "none") {
      if (data.parentId === id) {
        return {
          success: false,
          error: "Category cannot be its own parent.",
        };
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parentCategory) {
        return {
          success: false,
          error: "Parent category not found.",
        };
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        image: data.image,
        isActive: data.isActive,
        parentId:
          data.parentId && data.parentId !== "none" ? data.parentId : null,
      },
    });

    revalidateTag(CATEGORIES_TAG);
    revalidateTag(CATEGORY_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/categories");
    revalidatePath("/products");

    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error("Update category failed:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    return { success: false, error: "Failed to update category" };
  }
}

export async function updateCategoryStatus(id: string, isActive: boolean) {
  try {
    await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    revalidateTag(CATEGORIES_TAG);
    revalidateTag(CATEGORY_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/categories");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Update category status failed:", error);
    return { success: false, error: "Failed to update category status" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete category with associated products. Please reassign or delete the products first.",
      };
    }

    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete category with subcategories. Please delete or reassign the subcategories first.",
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidateTag(CATEGORIES_TAG);
    revalidateTag(CATEGORY_TAG(id));
    revalidatePath("/");
    revalidatePath("/dashboard/categories");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete category failed:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export const getAllCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },
  [CATEGORIES_TAG],
  {
    tags: [CATEGORIES_TAG],
    revalidate: CATEGORIES_CACHE_TTL.CATEGORIES,
  }
);

export const getCategoryById = unstable_cache(
  async (id: string) => {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },
  ["category"],
  {
    tags: [CATEGORIES_TAG],
    revalidate: CATEGORIES_CACHE_TTL.CATEGORY,
  }
);

export const getActiveCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },
  ["active-categories"],
  {
    tags: [CATEGORIES_TAG],
    revalidate: CATEGORIES_CACHE_TTL.CATEGORIES,
  }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            mainImage: true,
            stockStatus: true,
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },
  ["category-by-slug"],
  {
    tags: [CATEGORIES_TAG],
    revalidate: CATEGORIES_CACHE_TTL.CATEGORY,
  }
);

export const getCategoryTree = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.filter((category) => !category.parentId);
  },
  ["category-tree"],
  {
    tags: [CATEGORIES_TAG],
    revalidate: CATEGORIES_CACHE_TTL.CATEGORIES,
  }
);

export const getBrands = unstable_cache(
  async () => {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, logo: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: brands };
  },
  [MEGA_MENU_CACHE_KEYS.BRANDS],
  { revalidate: 3600, tags: [MEGA_MENU_CACHE_KEYS.BRANDS] }
);

export const getFeaturedProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        mainImage: true,
        categoryId: true,
        brand: { select: { name: true, logo: true } },
      },
      take: 2,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products };
  },
  [MEGA_MENU_CACHE_KEYS.FEATURED_PRODUCTS],
  { revalidate: 3600, tags: [MEGA_MENU_CACHE_KEYS.FEATURED_PRODUCTS] }
);

export const getMegaMenuCategories = unstable_cache(
  async () => {
    const [categories, brandsRes, featuredRes] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          children: {
            where: { isActive: true },
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      getBrands(),
      getFeaturedProducts(),
    ]);

    const brands = brandsRes.data;
    const featuredProducts = featuredRes.data;

    const transformed = categories.map((cat) => {
      const allCategoryIds = [cat.id, ...cat.children.map((child) => child.id)];

      const matchedProducts = featuredProducts.filter((p) =>
        allCategoryIds.includes(p.categoryId ?? "")
      );

      const featuredProductList =
        matchedProducts.length > 0
          ? matchedProducts.map((product) => ({
              name: product.name,
              price: product.price,
              mainImage: product.mainImage ?? "/placeholder.svg",
            }))
          : [
              {
                name: "Coming Soon",
                price: 0,
                mainImage: "/placeholder.svg",
              },
            ];

      return {
        name: cat.name,
        href: `/category/${cat.slug}`,
        subcategories: cat.children.map((child) => ({
          name: child.name,
          href: `/category/${child.slug}`,
        })),
        featuredProducts: featuredProductList,
        brands: brands.slice(0, 6).map((b) => ({
          name: b.name,
          logo: b.logo ?? "/placeholder-logo.svg",
        })),
        promotion: {
          title: `Discover ${cat.name}`,
          description: `Explore the latest ${cat.name} products.`,
          cta: "Shop Now",
        },
      };
    });

    return { success: true, data: transformed };
  },
  [MEGA_MENU_CACHE_KEYS.MEGA_MENU],
  { revalidate: 3600, tags: [MEGA_MENU_CACHE_KEYS.MEGA_MENU] }
);
