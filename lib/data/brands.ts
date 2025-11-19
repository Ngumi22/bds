"use server";

import { unstable_cache } from "next/cache";

import prisma from "../prisma";

const _getAllBrands = unstable_cache(
  async () => {
    return await prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  ["brands"],
  {
    revalidate: 3600,
    tags: ["brands"],
  }
);

export async function getAllBrands() {
  return await _getAllBrands();
}

export async function getBrandById(id: string) {
  const _getBrandById = unstable_cache(
    async () => {
      return await prisma.brand.findUnique({
        where: { id },
      });
    },
    [`brand:${id}`],
    {
      revalidate: 3600,
      tags: [`brand:${id}`],
    }
  );

  return _getBrandById();
}
