import { z } from "zod";
import { ProductSchema, StockStatusEnum } from "../schemas/product";

export type Product = z.infer<typeof ProductSchema>;

export type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  author: string;
  title: string | null;
  verified: boolean;
  helpful: number;
  images: string[];
  isPublished: boolean;
  createdAt: Date;
};

export type FullProductData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;

  price: number;
  originalPrice: number | null;
  taxRate: number | null;

  guarantee: string | null;

  deliveryDate: string | null;
  shipsIn: string | null;
  recentPurchases: string[];

  mainImage: string;
  galleryImages: string[];
  videoUrl: string | null;

  sku: string | null;
  isActive: boolean;
  hasVariants: boolean;
  stockStatus: z.infer<typeof StockStatusEnum>;
  stockCount: number | null;
  viewingNow: number | null;

  category: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    isActive: boolean;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    isActive: boolean;
  };

  specifications: Record<string, string>;

  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;

  averageRating: number;
  reviewCount: number;
  reviews: ReviewData[];

  variantGroups: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      color: string | null;
      inStock: boolean;
      stockCount: number;
      priceModifier: number;
    }>;
  }>;

  variants: Array<{
    id: string;
    sku: string | null;
    stock: number;
    price: number;
    combinations: string[];
    variantOptionIds: string[];
  }>;

  shippingInfo: {
    id: string;
    freeShipping: boolean;
    estimatedDelivery: string | null;
    returnPolicy: string | null;
    warranty: string | null;
  } | null;

  featured: boolean;
  salesCount: number;
  viewCount: number;

  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;

  createdAt: Date;
  updatedAt: Date;
};

export function transformSpecifications(
  specifications: Array<{
    id: string;
    value: string;
    specificationDef: {
      id: string;
      key: string;
      name: string;
    };
  }>
): Record<string, string> {
  return specifications.reduce((acc, spec) => {
    acc[spec.specificationDef.key] = spec.value;
    return acc;
  }, {} as Record<string, string>);
}

export function calculateVariants(
  variantGroups: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      color: string | null;
      inStock: boolean;
      stockCount: number;
      priceModifier: number;
    }>;
  }>,
  basePrice: number,
  baseSku: string | null
): FullProductData["variants"] {
  if (variantGroups.length === 0) return [];

  // Generate all possible combinations
  const generateCombinations = (groups: typeof variantGroups): string[][] => {
    if (groups.length === 0) return [[]];

    const firstGroup = groups[0];
    const restCombinations = generateCombinations(groups.slice(1));

    const combinations: string[][] = [];
    for (const option of firstGroup.options) {
      for (const rest of restCombinations) {
        combinations.push([option.name, ...rest]);
      }
    }
    return combinations;
  };

  const combinations = generateCombinations(variantGroups);

  return combinations.map((combination, index) => {
    const variantOptionIds: string[] = [];
    let totalPriceModifier = 0;
    let totalStock = Infinity;

    combination.forEach((optionName, groupIndex) => {
      const option = variantGroups[groupIndex].options.find(
        (opt) => opt.name === optionName
      );
      if (option) {
        variantOptionIds.push(option.id);
        totalPriceModifier += option.priceModifier;
        totalStock = Math.min(totalStock, option.stockCount);
      }
    });

    return {
      id: `variant-${index}`,
      sku: baseSku ? `${baseSku}-${index + 1}` : null,
      stock: totalStock,
      price: basePrice + totalPriceModifier,
      combinations: combination,
      variantOptionIds,
    };
  });
}
