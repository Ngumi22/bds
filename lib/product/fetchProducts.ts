"use server";

import { unstable_cache } from "next/cache";
import { PRODUCT_CACHE_TTL, PRODUCTS_TAG } from "../constants";
import { ProductSearchParams, ProductSearchResult } from "./product.types";
import { resolveSearchParameters } from "./product.resolvers";
import {
  buildAggregationWhere,
  buildMongoMatch,
  buildMongoSearchStage,
  buildPrismaWhere,
  buildSortStages,
} from "./product.query-builder";
import {
  fetchProductsStandard,
  fetchProductsWithTextSearch,
} from "./product.data";
import { fetchSearchFacets } from "./product.facets";

export const filterProducts = unstable_cache(
  async (params: ProductSearchParams): Promise<ProductSearchResult> => {
    const {
      searchQuery,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 24,
    } = params;

    const skip = (page - 1) * limit;
    const hasSearchQuery = !!searchQuery?.trim();

    const resolvedParams = await resolveSearchParameters(params);

    const standardWhere = buildPrismaWhere(resolvedParams);
    const aggregationWhere = buildAggregationWhere(resolvedParams);
    const mongoMatch = buildMongoMatch(resolvedParams);
    const searchStage = buildMongoSearchStage(searchQuery);
    const {
      prisma: prismaSort,
      mongo: mongoSort,
      mongoField: mongoSortField,
    } = buildSortStages(sortBy, sortOrder);

    const [productResult, facetResult] = await Promise.all([
      hasSearchQuery
        ? fetchProductsWithTextSearch(
            searchStage!,
            mongoMatch,
            mongoSort,
            mongoSortField,
            skip,
            limit
          )
        : fetchProductsStandard(standardWhere, prismaSort, skip, limit),

      fetchSearchFacets(
        aggregationWhere,
        standardWhere,
        resolvedParams,
        hasSearchQuery,
        searchStage,
        mongoMatch
      ),
    ]);

    const { products, totalCount } = productResult;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      ...facetResult,
    };
  },
  undefined,
  {
    tags: [PRODUCTS_TAG, "all"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);
