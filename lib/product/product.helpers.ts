import { Prisma } from "@prisma/client";
import { normalizeColorValue } from "../utils/color-helpers";
import { MinimalProductData } from "./product.types";

export const minimalProductSelect: Prisma.ProductSelect = {
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
  featured: true,
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

export const DUMMY_OBJECT_ID = "000000000000000000000000";

export const isValidObjectId = (id?: string): id is string =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

export const toMongoObjectIds = (ids: string[]) =>
  ids.map((id) => ({ $oid: id }));

export const toMongoObjectId = (id: string) => ({ $oid: id });

export const mapPrismaProductToMinimal = (p: any): MinimalProductData => {
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
    featured: p.featured,
    collections: p.collections?.map((pc: any) => ({
      id: pc.id,
      collection: pc.collection,
    })),
    colorVariants,
  };
};
