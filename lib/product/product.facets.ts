"use server";

import prisma from "../prisma";
import { Prisma, StockStatus } from "@prisma/client";
import { Category, ProductSearchResult, SubCategory } from "./product.types";
import { ResolvedSearchParams } from "./product.resolvers";

type RawMongoPipelineStage = { [key: string]: any };

type FacetResult = Omit<
  ProductSearchResult,
  | "products"
  | "totalCount"
  | "totalPages"
  | "currentPage"
  | "hasNextPage"
  | "hasPreviousPage"
>;

export async function fetchSearchFacets(
  aggregationWhere: Prisma.ProductWhereInput,
  standardWhere: Prisma.ProductWhereInput,
  params: ResolvedSearchParams,
  hasSearchQuery: boolean,
  searchStage?: RawMongoPipelineStage,
  mongoMatch?: RawMongoPipelineStage
): Promise<FacetResult> {
  const [
    priceRange,
    availableBrandsData,
    availableSubCategoriesData,
    availableSpecificationsData,
    availableParentCategoriesData,
    availableCollectionsData,
    availableStockStatusesData,
    availableCategoriesData,
  ] = await Promise.all([
    prisma.product.aggregate({
      where: aggregationWhere,
      _min: { price: true },
      _max: { price: true },
    }),

    prisma.brand.findMany({
      where: { products: { some: aggregationWhere } },
      select: {
        id: true,
        name: true,
        _count: { select: { products: { where: standardWhere } } },
      },
      orderBy: { name: "asc" },
    }),

    params.resolvedCategoryId
      ? prisma.category.findMany({
          where: {
            parentId: params.resolvedCategoryId,
            products: { some: aggregationWhere },
          },
          select: {
            id: true,
            name: true,
            _count: { select: { products: { where: standardWhere } } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),

    fetchAvailableSpecifications(standardWhere, params.resolvedCategoryId),

    fetchAvailableParentCategories(standardWhere),

    prisma.collection.findMany({
      where: {
        NOT: { collectionType: "FLASH_SALE" },
        products: {
          some: { product: aggregationWhere },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: {
              where: { product: standardWhere },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    fetchAvailableStockStatuses(
      standardWhere,
      hasSearchQuery,
      searchStage,
      mongoMatch
    ),
    fetchAvailableCategories(standardWhere),
  ]);

  return {
    priceRange: {
      min: priceRange._min.price || 0,
      max: priceRange._max.price || 0,
    },
    availableBrands: availableBrandsData
      .map((b) => ({
        id: b.id,
        name: b.name,
        count: b._count.products,
      }))
      .filter((b) => b.count > 0),
    availableSubCategories: availableSubCategoriesData
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.products,
      }))
      .filter((c) => c.count > 0),
    availableParentCategories: availableParentCategoriesData,
    availableCollections: availableCollectionsData
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.products,
      }))
      .filter((c) => c.count > 0),
    availableSpecifications: availableSpecificationsData,
    availableStockStatuses: availableStockStatusesData,
    availableCategories: availableCategoriesData,
  };
}

async function fetchAvailableParentCategories(
  standardWhere: Prisma.ProductWhereInput
) {
  const parentCategoriesWithCounts = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: {
          _count: { select: { products: { where: standardWhere } } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return parentCategoriesWithCounts
    .map((parentCat) => ({
      id: parentCat.id,
      name: parentCat.name,
      slug: parentCat.slug,
      count: parentCat.children.reduce((sum, c) => sum + c._count.products, 0),
    }))
    .filter((c) => c.count > 0);
}

async function fetchAvailableSpecifications(
  standardWhere: Prisma.ProductWhereInput,
  resolvedCategoryId?: string
) {
  const specDefinitionsWhere = resolvedCategoryId
    ? { categoryId: resolvedCategoryId }
    : {};
  const specDefinitions = await prisma.specificationDefinition.findMany({
    where: specDefinitionsWhere,
    select: { id: true, key: true, name: true },
  });
  if (specDefinitions.length === 0) return [];

  const specIdToKeyMap = new Map(
    specDefinitions.map((def) => [def.id, { key: def.key, name: def.name }])
  );

  const specValueGroups = await prisma.productSpecificationValue.groupBy({
    by: ["specificationDefId", "value"],
    where: {
      specificationDefId: { in: specDefinitions.map((d) => d.id) },
      product: standardWhere,
    },
    _count: { value: true },
    orderBy: { value: "asc" },
  });

  const specsMap = new Map<
    string,
    { key: string; values: Array<{ value: string; count: number }> }
  >();

  for (const group of specValueGroups) {
    const specDef = specIdToKeyMap.get(group.specificationDefId);
    if (!specDef) continue;
    if (!specsMap.has(specDef.key))
      specsMap.set(specDef.key, { key: specDef.key, values: [] });
    specsMap.get(specDef.key)!.values.push({
      value: group.value,
      count: group._count.value,
    });
  }
  return Array.from(specsMap.values());
}

async function fetchAvailableStockStatuses(
  standardWhere: Prisma.ProductWhereInput,
  hasSearchQuery: boolean,
  searchStage?: RawMongoPipelineStage,
  mongoMatch?: RawMongoPipelineStage
) {
  const filtersWithoutStock = (
    (standardWhere.AND as Prisma.ProductWhereInput[]) || []
  ).filter((clause) => !clause.stockStatus);

  const stockAggregationWhere: Prisma.ProductWhereInput = {
    AND: filtersWithoutStock,
  };

  if (hasSearchQuery && searchStage && mongoMatch) {
    const mongoFiltersWithoutStock =
      (mongoMatch?.$match?.$and || []).filter(
        (clause: any) => !clause.stockStatus
      ) || [];

    const stockPipeline: RawMongoPipelineStage[] = [
      searchStage,
      { $match: { $and: mongoFiltersWithoutStock } },
      { $group: { _id: "$stockStatus", count: { $sum: 1 } } },
    ];

    const rawStockResult: any = await prisma.$runCommandRaw({
      aggregate: "products",
      pipeline: stockPipeline,
      cursor: {},
    });

    const groups = rawStockResult?.cursor?.firstBatch || [];
    return groups
      .map((g: any) => ({ status: g._id, count: g.count }))
      .filter(
        (g: any) =>
          g.status === StockStatus.IN_STOCK ||
          g.status === StockStatus.OUT_OF_STOCK
      );
  } else {
    const prismaGroups = await prisma.product.groupBy({
      by: ["stockStatus"],
      _count: { _all: true },
      where: stockAggregationWhere,
    });

    return prismaGroups
      .filter(
        (g) =>
          g.stockStatus === StockStatus.IN_STOCK ||
          g.stockStatus === StockStatus.OUT_OF_STOCK
      )
      .map((g) => ({ status: g.stockStatus, count: g._count._all }));
  }
}

async function fetchAvailableCategories(
  standardWhere: Prisma.ProductWhereInput
): Promise<Category[]> {
  const parentCategoriesWithData = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: { where: standardWhere } },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const availableCategories = parentCategoriesWithData.map((parentCat) => {
    const subCategories: SubCategory[] = parentCat.children
      .map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        count: child._count.products,
      }))
      .filter((child) => child.count > 0);

    const totalCount = subCategories.reduce(
      (sum, child) => sum + (child.count || 0),
      0
    );

    return {
      id: parentCat.id,
      name: parentCat.name,
      slug: parentCat.slug,
      count: totalCount,
      subCategories: subCategories,
    };
  });

  return availableCategories.filter((parent) => parent.count > 0);
}
