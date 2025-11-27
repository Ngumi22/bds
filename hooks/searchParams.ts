import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
  createSerializer,
} from "nuqs/server";
import { StockStatus } from "@prisma/client";

export const searchParamsParsers = {
  search: parseAsString,
  page: parseAsInteger.withDefault(1),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sortBy: parseAsString.withDefault("createdAt"),
  sortOrder: parseAsString.withDefault("desc"),
  categories: parseAsArrayOf(parseAsString),
  subCategories: parseAsArrayOf(parseAsString),
  brands: parseAsArrayOf(parseAsString),
  collections: parseAsArrayOf(parseAsString),
  stockStatus: parseAsArrayOf(
    parseAsStringEnum<StockStatus>(Object.values(StockStatus))
  ),
  categoryId: parseAsString,
  category: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
export const serializeSearchParams = createSerializer(searchParamsParsers);
