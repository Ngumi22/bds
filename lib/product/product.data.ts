"use server";

import prisma from "../prisma";
import {
  mapPrismaProductToMinimal,
  minimalProductSelect,
} from "./product.helpers";
import { MinimalProductData } from "./product.types";
import { Prisma } from "@prisma/client";

type RawMongoPipelineStage = { [key: string]: any };

interface ProductFetchResult {
  products: MinimalProductData[];
  totalCount: number;
}

export async function fetchProductsStandard(
  standardWhere: Prisma.ProductWhereInput,
  prismaSort: any,
  skip: number,
  limit: number
): Promise<ProductFetchResult> {
  const [standardProducts, standardTotalCount] = await Promise.all([
    prisma.product.findMany({
      where: standardWhere,
      select: minimalProductSelect,
      orderBy: prismaSort,
      skip,
      take: limit,
    }),
    prisma.product.count({ where: standardWhere }),
  ]);

  return {
    products: standardProducts.map(mapPrismaProductToMinimal),
    totalCount: standardTotalCount,
  };
}

export async function fetchProductsWithTextSearch(
  searchStage: RawMongoPipelineStage,
  matchStage: RawMongoPipelineStage,
  mongoSort: any,
  mongoSortField: string,
  skip: number,
  limit: number
): Promise<ProductFetchResult> {
  const finalMongoSort: any = { _score: -1, ...mongoSort, _id: 1 };

  const idPipelineStages: RawMongoPipelineStage[] = [
    searchStage,
    matchStage,
    { $sort: finalMongoSort },
    { $skip: skip },
    { $limit: limit },
    { $project: { _id: 1, _score: { $meta: "searchScore" } } },
  ];

  const countPipeline: RawMongoPipelineStage[] = [
    searchStage,
    matchStage,
    { $count: "totalCount" },
  ];

  const [rawIdResult, rawCountResult]: [any, any] = await Promise.all([
    prisma.$runCommandRaw({
      aggregate: "products",
      pipeline: idPipelineStages,
      cursor: {},
    }),
    prisma.$runCommandRaw({
      aggregate: "products",
      pipeline: countPipeline,
      cursor: {},
    }),
  ]);

  const rawIds = rawIdResult?.cursor?.firstBatch || [];
  const totalCount = rawCountResult?.cursor?.firstBatch?.[0]?.totalCount || 0;

  if (totalCount === 0 || rawIds.length === 0) {
    return { products: [], totalCount: 0 };
  }

  const productIds: string[] = rawIds
    .map((p: any) => p?._id?.$oid || p?._id?.toString())
    .filter(Boolean);

  const foundProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: minimalProductSelect,
  });

  const sortedProducts = productIds
    .map((id) => foundProducts.find((p) => p.id === id))
    .filter(Boolean);

  return {
    products: sortedProducts.map(mapPrismaProductToMinimal),
    totalCount,
  };
}
