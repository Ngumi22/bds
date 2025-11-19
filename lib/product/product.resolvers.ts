"use server";

import prisma from "../prisma";
import { isValidObjectId } from "./product.helpers";
import { ProductSearchParams } from "./product.types";

export interface ResolvedSearchParams extends ProductSearchParams {
  allBrandIds: string[];
  allCollectionIds: string[];
  allSubCategoryIds: string[];
  categoryAndChildrenIds: string[];
  resolvedCategoryId?: string;
  filterMustFail: {
    brands: boolean;
    collections: boolean;
    subCategories: boolean;
    category: boolean;
  };
}

type IdResolution = {
  ids: string[];
  filterMustFail: boolean;
};

async function resolveBrandIds(
  brands: string[] = [],
  brandIds: string[] = []
): Promise<IdResolution> {
  const providedBrandIds = brandIds.filter(isValidObjectId);
  let resolvedBrands: Array<{ id: string }> = [];

  if (brands.length > 0) {
    resolvedBrands = await prisma.brand.findMany({
      where: {
        OR: [
          { name: { in: brands, mode: "insensitive" } },
          { slug: { in: brands, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
  }

  const resolvedBrandIds = resolvedBrands.map((b) => b.id);
  const allBrandIds = [...new Set([...providedBrandIds, ...resolvedBrandIds])];

  const filterMustFail =
    brands.length > 0 &&
    resolvedBrands.length === 0 &&
    providedBrandIds.length === 0;

  return { ids: allBrandIds, filterMustFail };
}

async function resolveCollectionIds(
  collections: string[] = [],
  collectionIds: string[] = []
): Promise<IdResolution> {
  const providedCollectionIds = collectionIds.filter(isValidObjectId);
  let resolvedCollections: Array<{ id: string }> = [];

  if (collections.length > 0) {
    resolvedCollections = await prisma.collection.findMany({
      where: {
        OR: [
          { name: { in: collections, mode: "insensitive" } },
          { slug: { in: collections, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
  }

  const resolvedCollectionIds = resolvedCollections.map((c) => c.id);
  const allCollectionIds = [
    ...new Set([...providedCollectionIds, ...resolvedCollectionIds]),
  ];

  const filterMustFail =
    collections.length > 0 &&
    resolvedCollections.length === 0 &&
    providedCollectionIds.length === 0;

  return { ids: allCollectionIds, filterMustFail };
}

async function resolveSubCategoryIds(
  subCategories: string[] = [],
  subCategoryIds: string[] = []
): Promise<IdResolution> {
  const providedSubCategoryIds = subCategoryIds.filter(isValidObjectId);
  let resolvedSubCats: Array<{ id: string }> = [];

  if (subCategories.length > 0) {
    resolvedSubCats = await prisma.category.findMany({
      where: {
        OR: [
          { name: { in: subCategories, mode: "insensitive" } },
          { slug: { in: subCategories, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
  }

  const resolvedSubCategoryIds = resolvedSubCats.map((c) => c.id);
  const allSubCategoryIds = [
    ...new Set([...providedSubCategoryIds, ...resolvedSubCategoryIds]),
  ];

  const filterMustFail =
    subCategories.length > 0 &&
    resolvedSubCats.length === 0 &&
    providedSubCategoryIds.length === 0;

  return { ids: allSubCategoryIds, filterMustFail };
}

async function resolveCategory(
  categoryId?: string,
  category?: string
): Promise<{
  resolvedId?: string;
  childIds: string[];
  filterMustFail: boolean;
}> {
  let resolvedCategoryId: string | undefined = undefined;
  let filterMustFail = false;

  if (categoryId && isValidObjectId(categoryId)) {
    resolvedCategoryId = categoryId;
  } else if (category) {
    const resolvedCategoryFromSlug = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: category, mode: "insensitive" } },
          { slug: { equals: category, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (resolvedCategoryFromSlug) {
      resolvedCategoryId = resolvedCategoryFromSlug.id;
    } else {
      filterMustFail = true;
    }
  } else if (categoryId && !isValidObjectId(categoryId)) {
    filterMustFail = true;
  }

  let categoryAndChildrenIds: string[] = [];
  if (resolvedCategoryId) {
    const childCategories = await prisma.category.findMany({
      where: { parentId: resolvedCategoryId },
      select: { id: true },
    });
    categoryAndChildrenIds = [
      resolvedCategoryId,
      ...childCategories.map((c) => c.id),
    ];
  }

  return {
    resolvedId: resolvedCategoryId,
    childIds: categoryAndChildrenIds,
    filterMustFail,
  };
}

export async function resolveSearchParameters(
  params: ProductSearchParams
): Promise<ResolvedSearchParams> {
  const [brands, collections, subCategories, category] = await Promise.all([
    resolveBrandIds(params.brands, params.brandIds),
    resolveCollectionIds(params.collections, params.collectionIds),
    resolveSubCategoryIds(params.subCategories, params.subCategoryIds),
    resolveCategory(params.categoryId, params.category),
  ]);

  return {
    ...params,
    allBrandIds: brands.ids,
    allCollectionIds: collections.ids,
    allSubCategoryIds: subCategories.ids,
    resolvedCategoryId: category.resolvedId,
    categoryAndChildrenIds: category.childIds,
    filterMustFail: {
      brands: brands.filterMustFail,
      collections: collections.filterMustFail,
      subCategories: subCategories.filterMustFail,
      category: category.filterMustFail,
    },
  };
}
