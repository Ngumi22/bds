"use server";

import { unstable_cache } from "next/cache";
import prisma from "../prisma";
import {
  ATLAS_SEARCH_INDEX_NAME,
  PRODUCT_CACHE_TTL,
  PRODUCTS_TAG,
} from "../constants";
import { StockStatus, Prisma } from "@prisma/client";
import { ProductCollection } from "../utils/flash-sale";
import { normalizeColorValue } from "../utils/color-helpers";

export interface MinimalProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  rating?: number;
  brand?: string;
  category?: string;
  categoryId: string;
  mainImage: string;
  slug: string;
  stockStatus: StockStatus;
  hasVariants: boolean;
  isActive: boolean;
  collections?: ProductCollection[];
  colorVariants?: Array<{
    name: string;
    value: string | null;
    color: string | null;
  }>;
}

export interface ProductSearchParams {
  categoryId?: string;
  category?: string;
  searchQuery?: string;
  subCategories?: string[];
  subCategoryIds?: string[];
  brandIds?: string[];
  brands?: string[];
  collectionIds?: string[];
  collections?: string[];
  specifications?: {
    key: string;
    values: string[];
  }[];
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus[];
  sortBy?: "name" | "price" | "createdAt" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: MinimalProductData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  availableBrands: Array<{ id: string; name: string; count: number }>;
  availableSubCategories: Array<{ id: string; name: string; count: number }>;
  availableParentCategories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  availableCollections: Array<{ id: string; name: string; count: number }>;
  availableSpecifications: Array<{
    key: string;
    values: Array<{ value: string; count: number }>;
  }>;
  availableStockStatuses: Array<{ status: StockStatus; count: number }>;
}

type RawMongoPipelineStage = { [key: string]: any };

const mapPrismaProductToMinimal = (p: any): MinimalProductData => {
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
    collections: p.collections?.map((pc: any) => ({
      id: pc.id,
      collection: pc.collection,
    })),
    colorVariants,
  };
};

const minimalProductSelect: Prisma.ProductSelect = {
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

export const searchProducts = unstable_cache(
  async (params: ProductSearchParams): Promise<ProductSearchResult> => {
    const {
      categoryId,
      searchQuery,
      subCategoryIds = [],
      category,
      subCategories = [],
      brands = [],
      brandIds = [],
      collectionIds = [],
      collections = [],
      specifications = [],
      minPrice,
      maxPrice,
      stockStatus = [],
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 24,
    } = params;

    const skip = (page - 1) * limit;

    const isValidObjectId = (id?: string) =>
      typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

    const providedBrandIds = (brandIds || []).filter(isValidObjectId);
    const providedSubCategoryIds = (subCategoryIds || []).filter(
      isValidObjectId
    );
    const providedCollectionIds = (collectionIds || []).filter(isValidObjectId);

    const [
      resolvedBrands,
      resolvedCollections,
      resolvedCategoryFromSlug,
      resolvedSubCats,
    ] = await Promise.all([
      brands.length > 0
        ? prisma.brand.findMany({
            where: {
              OR: [
                { name: { in: brands, mode: "insensitive" } },
                { slug: { in: brands, mode: "insensitive" } },
              ],
            },
            select: { id: true },
          })
        : Promise.resolve([]),

      collections.length > 0
        ? prisma.collection.findMany({
            where: {
              OR: [
                { name: { in: collections, mode: "insensitive" } },
                { slug: { in: collections, mode: "insensitive" } },
              ],
            },
            select: { id: true },
          })
        : Promise.resolve([]),

      category && !isValidObjectId(categoryId)
        ? prisma.category.findFirst({
            where: {
              OR: [
                { name: { equals: category, mode: "insensitive" } },
                { slug: { equals: category, mode: "insensitive" } },
              ],
            },
            select: { id: true },
          })
        : Promise.resolve(null),

      subCategories.length > 0
        ? prisma.category.findMany({
            where: {
              OR: [
                { name: { in: subCategories, mode: "insensitive" } },
                { slug: { in: subCategories, mode: "insensitive" } },
              ],
            },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    const resolvedBrandIds = resolvedBrands.map((b) => b.id);
    const allBrandIds = [
      ...new Set([...providedBrandIds, ...resolvedBrandIds]),
    ];

    const resolvedCollectionIds = resolvedCollections.map((c) => c.id);
    const allCollectionIds = [
      ...new Set([...providedCollectionIds, ...resolvedCollectionIds]),
    ];

    const resolvedSubCategoryIds = resolvedSubCats.map((c) => c.id);
    const allSubCategoryIds = [
      ...new Set([...providedSubCategoryIds, ...resolvedSubCategoryIds]),
    ];

    let resolvedCategoryId: string | undefined = undefined;
    let categoryWasProvidedBySlug = false;

    if (categoryId) {
      if (isValidObjectId(categoryId)) {
        resolvedCategoryId = categoryId;
      } else {
        categoryWasProvidedBySlug = true;
      }
    }

    if (resolvedCategoryFromSlug) {
      resolvedCategoryId = resolvedCategoryFromSlug.id;
      categoryWasProvidedBySlug = false;
    } else if (category && !resolvedCategoryId) {
      categoryWasProvidedBySlug = true;
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

    const aggregationAndClauses: Prisma.ProductWhereInput[] = [
      { isActive: true },
    ];

    if (resolvedCategoryId) {
      aggregationAndClauses.push({
        categoryId: { in: categoryAndChildrenIds },
      });
    }

    const aggregationWhere: Prisma.ProductWhereInput = {
      AND: aggregationAndClauses,
    };

    const standardAndClauses: Prisma.ProductWhereInput[] = [{ isActive: true }];

    if (categoryWasProvidedBySlug) {
      standardAndClauses.push({ categoryId: "000000000000000000000000" });
    } else if (allSubCategoryIds.length > 0) {
      standardAndClauses.push({ categoryId: { in: allSubCategoryIds } });
    } else if (resolvedCategoryId) {
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

    if (specifications.length > 0) {
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
    }

    const standardWhere: Prisma.ProductWhereInput = {
      AND: standardAndClauses,
    };

    const toMongoObjectIds = (ids: string[]) => ids.map((id) => ({ $oid: id }));
    const toMongoObjectId = (id: string) => ({ $oid: id });

    const mongoAndClauses: RawMongoPipelineStage[] = [{ isActive: true }];

    if (categoryWasProvidedBySlug) {
      mongoAndClauses.push({
        categoryId: toMongoObjectId("000000000000000000000000"),
      });
    } else if (allSubCategoryIds.length > 0) {
      mongoAndClauses.push({
        categoryId: { $in: toMongoObjectIds(allSubCategoryIds) },
      });
    } else if (resolvedCategoryId) {
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

    if (specifications.length > 0) {
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
    }

    const sortField =
      sortBy === "popularity"
        ? "salesCount"
        : sortBy === "name"
        ? "name"
        : sortBy === "price"
        ? "price"
        : "createdAt";

    const sortOrderMongo = sortOrder === "asc" ? 1 : -1;

    let products: MinimalProductData[] = [];
    let totalCount = 0;

    const hasSearchQuery = !!searchQuery?.trim();

    const mongoMatch: RawMongoPipelineStage = { $and: mongoAndClauses };

    let searchStage: RawMongoPipelineStage | undefined = undefined;
    if (hasSearchQuery) {
      searchStage = {
        $search: {
          index: ATLAS_SEARCH_INDEX_NAME,
          compound: {
            should: [
              {
                autocomplete: {
                  query: searchQuery!.trim(),
                  path: "name",
                  tokenOrder: "sequential",
                  score: { boost: { value: 3 } },
                },
              },
              {
                text: {
                  query: searchQuery!.trim(),
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

    if (hasSearchQuery) {
      // searchStage is now defined in scope
      const matchStage: RawMongoPipelineStage = { $match: mongoMatch };

      const mongoSort: any = { _score: -1 };
      mongoSort[sortField] = sortOrderMongo;
      mongoSort._id = 1;
      const sortStage: RawMongoPipelineStage = { $sort: mongoSort };

      const idPipelineStages: RawMongoPipelineStage[] = [
        searchStage!, // Use non-null assertion as we're inside hasSearchQuery
        matchStage,
        sortStage,
        { $skip: skip },
        { $limit: limit },
        { $project: { _id: 1, _score: { $meta: "searchScore" } } },
      ];

      const rawIdResult: any = await prisma.$runCommandRaw({
        aggregate: "products",
        pipeline: idPipelineStages,
        cursor: {},
      });

      const rawIds = rawIdResult?.cursor?.firstBatch || [];

      const productIds: string[] = rawIds
        .map((p: any) => {
          if (!p || !p._id) return "";
          if (p._id.$oid && typeof p._id.$oid === "string") {
            return p._id.$oid;
          }
          if (typeof p._id === "string") return p._id;
          if (p._id.toString) return p._id.toString();
          return "";
        })
        .filter(Boolean)
        .filter((id: string) => id !== "[object Object]");

      const countPipeline: RawMongoPipelineStage[] = [
        searchStage!, // Use non-null assertion
        matchStage,
        { $count: "totalCount" },
      ];
      const rawCountResult: any = await prisma.$runCommandRaw({
        aggregate: "products",
        pipeline: countPipeline,
        cursor: {},
      });
      totalCount = rawCountResult?.cursor?.firstBatch?.[0]?.totalCount || 0;

      let foundProducts: any[] = [];
      if (productIds.length > 0) {
        foundProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: minimalProductSelect,
        });
      }

      const sortedProducts = productIds
        .map((id) => foundProducts.find((p) => p.id === id))
        .filter(Boolean);

      products = sortedProducts.map(mapPrismaProductToMinimal);
    } else {
      const orderBy: any = {};
      orderBy[sortField] = sortOrder;

      const [standardProducts, standardTotalCount] = await Promise.all([
        prisma.product.findMany({
          where: standardWhere,
          select: minimalProductSelect,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where: standardWhere }),
      ]);

      products = standardProducts.map(mapPrismaProductToMinimal);
      totalCount = standardTotalCount;
    }

    const getAvailableParentCategories = async () => {
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
          count: parentCat.children.reduce(
            (sum, c) => sum + c._count.products,
            0
          ),
        }))
        .filter((c) => c.count > 0);
    };

    const [
      priceRange,
      availableBrands,
      availableSubCategories,
      availableSpecificationsData,
      availableParentCategoriesData,
      availableCollectionsData,
      availableStockStatusesData,
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

      resolvedCategoryId
        ? prisma.category.findMany({
            where: {
              parentId: resolvedCategoryId,
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

      (async () => {
        const specDefinitionsWhere = resolvedCategoryId
          ? { categoryId: resolvedCategoryId }
          : {};
        const specDefinitions = await prisma.specificationDefinition.findMany({
          where: specDefinitionsWhere,
          select: { id: true, key: true, name: true },
        });
        if (specDefinitions.length === 0) return [];
        const specIdToKeyMap = new Map(
          specDefinitions.map((def) => [
            def.id,
            { key: def.key, name: def.name },
          ])
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
      })(),

      getAvailableParentCategories(),

      prisma.collection.findMany({
        where: { products: { some: { product: aggregationWhere } } },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: { where: { product: standardWhere } },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      // This (async) block now correctly checks for `searchStage`
      (async () => {
        if (hasSearchQuery && searchStage) {
          // If a text search is active, we MUST use the $search pipeline
          // Create a $match stage that includes all filters EXCEPT stockStatus
          const mongoMatchWithoutStock = {
            $and: mongoAndClauses.filter((clause) => !clause.stockStatus),
          };

          const stockPipeline: RawMongoPipelineStage[] = [
            searchStage, // This variable is now in scope!
            { $match: mongoMatchWithoutStock },
            { $group: { _id: "$stockStatus", count: { $sum: 1 } } },
          ];

          const rawStockResult: any = await prisma.$runCommandRaw({
            aggregate: "products",
            pipeline: stockPipeline,
            cursor: {},
          });

          const groups = rawStockResult?.cursor?.firstBatch || [];

          // Normalize the MongoDB result
          return groups
            .map((g: any) => ({
              status: g._id, // MongoDB result uses _id
              count: g.count, // MongoDB result uses count
            }))
            .filter(
              (g: any) =>
                g.status === StockStatus.IN_STOCK ||
                g.status === StockStatus.OUT_OF_STOCK
            );
        } else {
          // If no text search, the simple Prisma groupBy is correct and fast

          // Create a 'where' clause that includes all filters EXCEPT stockStatus
          const stockStatusAggregationWhere: Prisma.ProductWhereInput = {
            AND: standardAndClauses.filter((clause) => !clause.stockStatus),
          };

          const prismaGroups = await prisma.product.groupBy({
            by: ["stockStatus"],
            _count: { _all: true },
            where: stockStatusAggregationWhere,
          });

          // Process the Prisma result
          return prismaGroups
            .filter(
              (g) =>
                g.stockStatus === StockStatus.IN_STOCK ||
                g.stockStatus === StockStatus.OUT_OF_STOCK
            )
            .map((g) => ({ status: g.stockStatus, count: g._count._all }));
        }
      })(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0,
      },
      availableBrands: availableBrands.map((b) => ({
        id: b.id,
        name: b.name,
        count: b._count.products,
      })),
      availableSubCategories: availableSubCategories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.products,
      })),
      availableParentCategories: availableParentCategoriesData,
      availableCollections: availableCollectionsData.map(
        (c: { id: string; name: string; _count: { products: number } }) => ({
          id: c.id,
          name: c.name,
          count: c._count.products,
        })
      ),
      availableSpecifications: availableSpecificationsData,
      availableStockStatuses: availableStockStatusesData,
    };
  },
  undefined,

  {
    tags: [PRODUCTS_TAG, "all"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);
