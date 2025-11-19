"use server";

import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

const CATEGORY_TAG = "categories";

const _getAllCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  [CATEGORY_TAG],
  {
    revalidate: 3600,
    tags: [CATEGORY_TAG],
  }
);

const _getAllParentCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: {
        specifications: true,
        _count: { select: { products: true } },
        children: {
          include: {
            specifications: true,
            _count: { select: { products: true } },
            children: {
              include: {
                specifications: true,
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  [CATEGORY_TAG],
  {
    revalidate: 3600,
    tags: [CATEGORY_TAG],
  }
);

export async function getAllParentCategories() {
  return await _getAllParentCategories();
}

export async function getAllCategories() {
  return await _getAllCategories();
}

export async function getCategoryById(id: string) {
  const _getCategoryById = unstable_cache(
    async () => {
      return await prisma.category.findUnique({
        where: { id },
      });
    },
    [`${CATEGORY_TAG}:${id}`],
    {
      revalidate: 3600,
      tags: [`${CATEGORY_TAG}:${id}`],
    }
  );

  return await _getCategoryById();
}
