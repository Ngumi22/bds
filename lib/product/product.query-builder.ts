import { Prisma } from "@prisma/client";
import { ResolvedSearchParams } from "./product.resolvers";
import { ATLAS_SEARCH_INDEX_NAME } from "../constants";
import {
  DUMMY_OBJECT_ID,
  toMongoObjectId,
  toMongoObjectIds,
} from "./product.helpers";
import { ProductSearchParams } from "./product.types";

type RawMongoPipelineStage = { [key: string]: any };

export function buildPrismaWhere(
  params: ResolvedSearchParams
): Prisma.ProductWhereInput {
  const {
    allBrandIds,
    allCollectionIds,
    allSubCategoryIds,
    categoryAndChildrenIds,
    minPrice,
    maxPrice,
    stockStatus = [],
    specifications = [],
    filterMustFail,
  } = params;

  const standardAndClauses: Prisma.ProductWhereInput[] = [{ isActive: true }];

  if (filterMustFail.category) {
    return { id: DUMMY_OBJECT_ID };
  }
  if (filterMustFail.brands) {
    return { id: DUMMY_OBJECT_ID };
  }
  if (filterMustFail.collections) {
    return { id: DUMMY_OBJECT_ID };
  }
  if (filterMustFail.subCategories) {
    return { id: DUMMY_OBJECT_ID };
  }

  if (allSubCategoryIds.length > 0) {
    standardAndClauses.push({ categoryId: { in: allSubCategoryIds } });
  } else if (categoryAndChildrenIds.length > 0) {
    standardAndClauses.push({
      categoryId: { in: categoryAndChildrenIds },
    });
  }

  if (allBrandIds.length > 0) {
    standardAndClauses.push({ brandId: { in: allBrandIds } });
  }

  if (allCollectionIds.length > 0) {
    standardAndClauses.push({
      collections: {
        some: {
          collectionId: { in: allCollectionIds },
        },
      },
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Prisma.FloatFilter = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    standardAndClauses.push({ price: priceFilter });
  }

  if (stockStatus.length > 0) {
    standardAndClauses.push({ stockStatus: { in: stockStatus } });
  }

  for (const spec of specifications) {
    if (spec.values.length > 0) {
      standardAndClauses.push({
        specifications: {
          some: {
            specificationDef: { key: spec.key },
            value: {
              in: spec.values.map(String),
              mode: "insensitive",
            },
          },
        },
      });
    }
  }

  return { AND: standardAndClauses };
}

export function buildMongoMatch(
  params: ResolvedSearchParams
): RawMongoPipelineStage {
  const {
    allBrandIds,
    allCollectionIds,
    allSubCategoryIds,
    categoryAndChildrenIds,
    minPrice,
    maxPrice,
    stockStatus = [],
    specifications = [],
    filterMustFail,
  } = params;

  const mongoAndClauses: RawMongoPipelineStage[] = [{ isActive: true }];

  if (
    filterMustFail.category ||
    filterMustFail.brands ||
    filterMustFail.collections ||
    filterMustFail.subCategories
  ) {
    return { $match: { _id: toMongoObjectId(DUMMY_OBJECT_ID) } };
  }

  if (allSubCategoryIds.length > 0) {
    mongoAndClauses.push({
      categoryId: { $in: toMongoObjectIds(allSubCategoryIds) },
    });
  } else if (categoryAndChildrenIds.length > 0) {
    mongoAndClauses.push({
      categoryId: { $in: toMongoObjectIds(categoryAndChildrenIds) },
    });
  }

  if (allBrandIds.length > 0) {
    mongoAndClauses.push({
      brandId: { $in: toMongoObjectIds(allBrandIds) },
    });
  }

  if (allCollectionIds.length > 0) {
    mongoAndClauses.push({
      collectionIds: { $in: toMongoObjectIds(allCollectionIds) },
    });
  }

  const mongoPriceFilter: any = {};
  if (minPrice !== undefined) mongoPriceFilter.$gte = minPrice;
  if (maxPrice !== undefined) mongoPriceFilter.$lte = maxPrice;
  if (Object.keys(mongoPriceFilter).length > 0) {
    mongoAndClauses.push({ price: mongoPriceFilter });
  }

  if (stockStatus.length > 0) {
    mongoAndClauses.push({ stockStatus: { $in: stockStatus } });
  }

  for (const spec of specifications) {
    if (spec.values.length > 0) {
      mongoAndClauses.push({
        specs: {
          $elemMatch: {
            key: spec.key,
            value: { $in: spec.values.map(String) },
          },
        },
      });
    }
  }

  return { $match: { $and: mongoAndClauses } };
}

export function buildMongoSearchStage(
  searchQuery?: string
): RawMongoPipelineStage | undefined {
  if (!searchQuery?.trim()) return undefined;

  return {
    $search: {
      index: ATLAS_SEARCH_INDEX_NAME,
      compound: {
        should: [
          {
            autocomplete: {
              query: searchQuery.trim(),
              path: "name",
              tokenOrder: "sequential",
              score: { boost: { value: 3 } },
            },
          },
          {
            text: {
              query: searchQuery.trim(),
              path: ["slug", "shortDescription", "description"],
              fuzzy: { maxEdits: 2, prefixLength: 2 },
            },
          },
        ],
        minimumShouldMatch: 1,
      },
    },
  };
}

export function buildSortStages(
  sortBy: ProductSearchParams["sortBy"],
  sortOrder: ProductSearchParams["sortOrder"]
): { prisma: any; mongo: any; mongoField: string } {
  const sortField =
    sortBy === "popularity"
      ? "salesCount"
      : sortBy === "name"
      ? "name"
      : sortBy === "price"
      ? "price"
      : "createdAt";

  const sortOrderPrisma = sortOrder;
  const sortOrderMongo = sortOrder === "asc" ? 1 : -1;

  return {
    prisma: { [sortField]: sortOrderPrisma },
    mongo: { [sortField]: sortOrderMongo },
    mongoField: sortField,
  };
}

export function buildAggregationWhere(
  params: ResolvedSearchParams
): Prisma.ProductWhereInput {
  const aggregationAndClauses: Prisma.ProductWhereInput[] = [
    { isActive: true },
  ];

  if (params.filterMustFail.category) {
    return { id: DUMMY_OBJECT_ID };
  }

  if (params.categoryAndChildrenIds.length > 0) {
    aggregationAndClauses.push({
      categoryId: { in: params.categoryAndChildrenIds },
    });
  }

  return { AND: aggregationAndClauses };
}
