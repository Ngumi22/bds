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

/**
 * Helper to ensure search params are always arrays.
 * Next.js passes single params as strings and multiple as arrays.
 * Prisma 'in' operators requires arrays.
 */
function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

async function resolveBrandIds(
  brands: string[] | string = [],
  brandIds: string[] | string = []
): Promise<IdResolution> {
  // 1. Normalize inputs to ensure they are arrays
  const brandNamesArr = normalizeToArray(brands);
  const brandIdsArr = normalizeToArray(brandIds);

  const providedBrandIds = brandIdsArr.filter(isValidObjectId);
  let resolvedBrands: Array<{ id: string }> = [];

  if (brandNamesArr.length > 0) {
    resolvedBrands = await prisma.brand.findMany({
      where: {
        OR: [
          // 2. Use the normalized array here
          { name: { in: brandNamesArr, mode: "insensitive" } },
          { slug: { in: brandNamesArr, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
  }

  const resolvedBrandIds = resolvedBrands.map((b) => b.id);
  const allBrandIds = [...new Set([...providedBrandIds, ...resolvedBrandIds])];

  const filterMustFail =
    brandNamesArr.length > 0 &&
    resolvedBrands.length === 0 &&
    providedBrandIds.length === 0;

  return { ids: allBrandIds, filterMustFail };
}

async function resolveCollectionIds(
  collections: string[] | string = [],
  collectionIds: string[] | string = []
): Promise<IdResolution> {
  // 1. Normalize inputs
  const collectionNamesArr = normalizeToArray(collections);
  const collectionIdsArr = normalizeToArray(collectionIds);

  const providedCollectionIds = collectionIdsArr.filter(isValidObjectId);
  let resolvedCollections: Array<{ id: string }> = [];

  if (collectionNamesArr.length > 0) {
    resolvedCollections = await prisma.collection.findMany({
      where: {
        OR: [
          // 2. Use normalized array
          { name: { in: collectionNamesArr, mode: "insensitive" } },
          { slug: { in: collectionNamesArr, mode: "insensitive" } },
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
    collectionNamesArr.length > 0 &&
    resolvedCollections.length === 0 &&
    providedCollectionIds.length === 0;

  return { ids: allCollectionIds, filterMustFail };
}

async function resolveSubCategoryIds(
  subCategories: string[] | string = [],
  subCategoryIds: string[] | string = []
): Promise<IdResolution> {
  // 1. Normalize inputs (Fixing the reported crash)
  const subCategoryNamesArr = normalizeToArray(subCategories);
  const subCategoryIdsArr = normalizeToArray(subCategoryIds);

  const providedSubCategoryIds = subCategoryIdsArr.filter(isValidObjectId);
  let resolvedSubCats: Array<{ id: string }> = [];

  if (subCategoryNamesArr.length > 0) {
    resolvedSubCats = await prisma.category.findMany({
      where: {
        OR: [
          // 2. Use normalized array
          { name: { in: subCategoryNamesArr, mode: "insensitive" } },
          { slug: { in: subCategoryNamesArr, mode: "insensitive" } },
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
    subCategoryNamesArr.length > 0 &&
    resolvedSubCats.length === 0 &&
    providedSubCategoryIds.length === 0;

  return { ids: allSubCategoryIds, filterMustFail };
}

async function resolveCategory(
  categoryId?: string | string[],
  category?: string | string[]
): Promise<{
  resolvedId?: string;
  childIds: string[];
  filterMustFail: boolean;
}> {
  // Handle edge case where primary category might be an array (take first)
  const catIdStr = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const catSlugStr = Array.isArray(category) ? category[0] : category;

  let resolvedCategoryId: string | undefined = undefined;
  let filterMustFail = false;

  if (catIdStr && isValidObjectId(catIdStr)) {
    resolvedCategoryId = catIdStr;
  } else if (catSlugStr) {
    const resolvedCategoryFromSlug = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: catSlugStr, mode: "insensitive" } },
          { slug: { equals: catSlugStr, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (resolvedCategoryFromSlug) {
      resolvedCategoryId = resolvedCategoryFromSlug.id;
    } else {
      filterMustFail = true;
    }
  } else if (catIdStr && !isValidObjectId(catIdStr)) {
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
