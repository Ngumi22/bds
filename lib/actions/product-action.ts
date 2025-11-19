"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { CollectionType, Prisma } from "@prisma/client";

import prisma from "../prisma";
import {
  ProductFormSchema,
  ProductUpdateFormValues,
  ProductUpdateSchema,
  type ProductFormValues,
} from "../schemas/product";
import {
  BRAND_TAG,
  CATEGORY_TAG,
  PRODUCT_CACHE_TTL,
  PRODUCT_TAG,
  PRODUCTS_TAG,
} from "../constants";
import { MinimalProductData } from "../types/product";

async function checkProductExists(
  name: string,
  slug: string,
  excludeId?: string
) {
  return await prisma.product.findFirst({
    where: {
      OR: [{ name }, { slug }],
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true, name: true, slug: true },
  });
}

async function executeTransaction<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A record with these details already exists");
      }
      if (error.code === "P2025") {
        throw new Error("Record not found");
      }
    }
    throw error;
  }
}

export async function createProduct(data: ProductFormValues) {
  try {
    const validated = ProductFormSchema.parse(data);

    const existingProduct = await checkProductExists(
      validated.name,
      validated.slug
    );
    if (existingProduct) {
      return {
        success: false,
        error: `A product with the name "${validated.name}" or slug "${validated.slug}" already exists.`,
      };
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: validated.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return { success: false, error: "Selected category does not exist." };
    }

    const brandExists = await prisma.brand.findUnique({
      where: { id: validated.brandId },
      select: { id: true },
    });
    if (!brandExists) {
      return { success: false, error: "Selected brand does not exist." };
    }

    const product = await executeTransaction(async () => {
      return await prisma.product.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          shortDescription: validated.shortDescription,
          description: validated.description,
          price: validated.price,
          originalPrice: validated.originalPrice,
          taxRate: validated.taxRate,
          guarantee: validated.guarantee,
          deliveryDate: validated.deliveryDate,
          shipsIn: validated.shipsIn,
          recentPurchases: validated.recentPurchases,
          mainImage: validated.mainImage,
          galleryImages: validated.galleryImages,
          videoUrl: validated.videoUrl,
          sku: validated.sku,
          isActive: validated.isActive,
          hasVariants: validated.hasVariants,
          stockStatus: validated.stockStatus,
          stockCount: validated.stockCount,
          featured: validated.featured,
          categoryId: validated.categoryId,
          brandId: validated.brandId,
          createdById: validated.createdById,

          shippingInfo: validated.shippingInfo
            ? {
                create: {
                  freeShipping: validated.shippingInfo.freeShipping,
                  estimatedDelivery: validated.shippingInfo.estimatedDelivery,
                  returnPolicy: validated.shippingInfo.returnPolicy,
                  warranty: validated.shippingInfo.warranty,
                },
              }
            : undefined,
        },
        include: {
          category: true,
          brand: true,
          shippingInfo: true,
        },
      });
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(product.slug));
    revalidateTag(CATEGORY_TAG(validated.categoryId));
    revalidateTag(BRAND_TAG(validated.brandId));
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return { success: true, product };
  } catch (error) {
    console.error("Create product error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product.",
    };
  }
}

export async function updateProduct(id: string, data: ProductUpdateFormValues) {
  try {
    const validated = ProductUpdateSchema.parse(data);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, categoryId: true, brandId: true },
    });
    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    if (validated.name || validated.slug) {
      const duplicate = await checkProductExists(
        validated.name || "",
        validated.slug || "",
        id
      );
      if (duplicate) {
        return {
          success: false,
          error: `Another product with that name or slug already exists.`,
        };
      }
    }

    if (validated.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validated.categoryId },
        select: { id: true },
      });
      if (!categoryExists) {
        return { success: false, error: "Selected category does not exist." };
      }
    }

    if (validated.brandId) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: validated.brandId },
        select: { id: true },
      });
      if (!brandExists) {
        return { success: false, error: "Selected brand does not exist." };
      }
    }

    const { id: _, shippingInfo, ...scalarData } = validated;

    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        shippingInfo: { select: { id: true } },
      },
    });

    const product = await executeTransaction(async () => {
      return await prisma.product.update({
        where: { id },
        data: {
          ...scalarData,
          ...(shippingInfo !== undefined && {
            shippingInfo: currentProduct?.shippingInfo
              ? {
                  update: {
                    freeShipping: shippingInfo?.freeShipping,
                    estimatedDelivery: shippingInfo?.estimatedDelivery,
                    returnPolicy: shippingInfo?.returnPolicy,
                    warranty: shippingInfo?.warranty,
                  },
                }
              : {
                  create: {
                    freeShipping: shippingInfo?.freeShipping,
                    estimatedDelivery: shippingInfo?.estimatedDelivery,
                    returnPolicy: shippingInfo?.returnPolicy,
                    warranty: shippingInfo?.warranty,
                  },
                },
          }),
        },
        include: {
          category: true,
          brand: true,
          shippingInfo: true,
        },
      });
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(product.slug));

    if (
      validated.categoryId &&
      validated.categoryId !== existingProduct.categoryId
    ) {
      revalidateTag(CATEGORY_TAG(existingProduct.categoryId));
    }
    if (validated.brandId && validated.brandId !== existingProduct.brandId) {
      revalidateTag(BRAND_TAG(existingProduct.brandId));
    }

    if (validated.categoryId) {
      revalidateTag(CATEGORY_TAG(validated.categoryId));
    }
    if (validated.brandId) {
      revalidateTag(BRAND_TAG(validated.brandId));
    }

    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, product };
  } catch (error) {
    console.error("Update product error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, categoryId: true, brandId: true },
    });
    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    await executeTransaction(async () => {
      await prisma.product.delete({ where: { id } });
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(existingProduct.slug));
    revalidateTag(CATEGORY_TAG(existingProduct.categoryId));
    revalidateTag(BRAND_TAG(existingProduct.brandId));
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product.",
    };
  }
}

export async function updateProductStatus(
  productId: string,
  isActive: boolean
) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, categoryId: true, brandId: true },
    });
    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    revalidateTag(PRODUCTS_TAG);
    revalidateTag(PRODUCT_TAG(product.slug));
    revalidateTag(CATEGORY_TAG(existingProduct.categoryId));
    revalidateTag(BRAND_TAG(existingProduct.brandId));
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating product status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update product status.",
    };
  }
}

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductFormValues | null> => {
    if (!slug) {
      console.error("Slug is required but was not provided");
      return null;
    }

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: { select: { id: true } },
          brand: { select: { id: true } },
          shippingInfo: {
            select: {
              id: true,
              freeShipping: true,
              estimatedDelivery: true,
              returnPolicy: true,
              warranty: true,
            },
          },
        },
      });

      if (!product) return null;

      const formValues: ProductFormValues = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        taxRate: product.taxRate,
        guarantee: product.guarantee ?? null,
        deliveryDate: product.deliveryDate ?? null,
        shipsIn: product.shipsIn ?? null,
        recentPurchases: product.recentPurchases ?? [],
        mainImage: product.mainImage,
        galleryImages: product.galleryImages ?? [],
        videoUrl: product.videoUrl ?? null,
        sku: product.sku ?? null,
        isActive: product.isActive,
        hasVariants: product.hasVariants,
        stockStatus: product.stockStatus,
        stockCount: product.stockCount,
        categoryId: product.category?.id || "",
        brandId: product.brand?.id || "",
        createdById: product.createdById ?? null,
        featured: product.featured,
        shippingInfo: product.shippingInfo
          ? {
              id: product.shippingInfo.id,
              freeShipping: product.shippingInfo.freeShipping,
              estimatedDelivery: product.shippingInfo.estimatedDelivery ?? null,
              returnPolicy: product.shippingInfo.returnPolicy ?? null,
              warranty: product.shippingInfo.warranty ?? null,
            }
          : null,
      };

      return formValues;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
  },
  ["product-by-slug"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCT_DETAIL,
  }
);

export const getAllProducts = unstable_cache(
  async (): Promise<MinimalProductData[]> => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        categoryId: true,
        mainImage: true,
        slug: true,
        stockStatus: true,
        hasVariants: true,
        isActive: true,
        featured: true,
        stockCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  },
  [PRODUCTS_TAG],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getActiveProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["active-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        featured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        shortDescription: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  },
  ["featured-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getProductsByCategory = unstable_cache(
  async (categoryId: string) => {
    return prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-by-category"],
  {
    tags: [PRODUCTS_TAG, "categories"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getProductsByMainCategory = unstable_cache(
  async (categoryId: string) => {
    return prisma.product.findMany({
      where: {
        OR: [
          { categoryId },
          {
            category: {
              parentId: categoryId,
            },
          },
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-by-category"],
  {
    tags: [PRODUCTS_TAG, "categories"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getProductsByBrand = unstable_cache(
  async (brandId: string) => {
    return prisma.product.findMany({
      where: {
        brandId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-by-brand"],
  {
    tags: [PRODUCTS_TAG, "brands"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

export const getProductDetail = unstable_cache(
  async (slug: string) => {
    return prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        shippingInfo: true,
        features: {
          orderBy: { id: "asc" },
        },
        reviews: {
          where: { isPublished: true },
          select: {
            id: true,
            rating: true,
            comment: true,
            author: true,
            title: true,
            verified: true,
            helpful: true,
            images: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        variantGroups: {
          include: {
            options: {
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });
  },
  ["product-detail"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCT_DETAIL,
  }
);

export const getProductsByCollectionType = unstable_cache(
  async (collectionType: CollectionType) => {
    return prisma.collection.findMany({
      where: {
        collectionType,
        products: {
          some: {
            product: {
              isActive: true,
            },
          },
        },
      },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                mainImage: true,
                stockStatus: true,
                featured: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-by-collection-type"],
  {
    tags: [PRODUCTS_TAG, "collections"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Flash sale products with date range
export const getFlashSaleProducts = unstable_cache(
  async () => {
    const currentDate = new Date();

    return prisma.collection.findMany({
      where: {
        collectionType: "FLASH_SALE",
        // You might want to add date range filtering here if you add start/end dates to collections
        products: {
          some: {
            product: {
              isActive: true,
            },
          },
        },
      },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                mainImage: true,
                stockStatus: true,
                featured: true,
                // Calculate discount percentage
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["flash-sale-products"],
  {
    tags: [PRODUCTS_TAG, "collections"],
    revalidate: 60, // Shorter cache for flash sales
  }
);

// Seasonal collections
export const getSeasonalCollections = unstable_cache(
  async () => {
    return prisma.collection.findMany({
      where: {
        collectionType: "SEASONAL",
        products: {
          some: {
            product: {
              isActive: true,
            },
          },
        },
      },
      include: {
        products: {
          where: {
            product: {
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                mainImage: true,
                stockStatus: true,
                featured: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
          take: 12, // Limit products per seasonal collection
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["seasonal-collections"],
  {
    tags: [PRODUCTS_TAG, "collections"],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Related products (based on category and brand)
export const getRelatedProducts = unstable_cache(
  async (productId: string, limit: number = 8) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        brandId: true,
        category: {
          select: {
            id: true,
            parentId: true,
          },
        },
      },
    });

    if (!product) {
      return [];
    }

    return prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [
          // Same category
          { categoryId: product.categoryId },
          // Same brand
          { brandId: product.brandId },
          // Same parent category
          ...(product.category?.parentId
            ? [{ category: { parentId: product.category.parentId } }]
            : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        // Prioritize same category and brand
        { categoryId: "desc" },
        { brandId: "desc" },
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });
  },
  ["related-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Discounted products (products with original price > current price)
export const getDiscountedProducts = unstable_cache(
  async (limit: number = 12) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        originalPrice: {
          gt: prisma.product.fields.price, // originalPrice > price
        },
        price: {
          gt: 0, // Ensure price is positive
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        // Calculate discount percentage
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        // Order by highest discount percentage first
        {
          originalPrice: "desc",
        },
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });
  },
  ["discounted-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Recently viewed products (you'll need to track views separately)
export const getRecentlyViewedProducts = unstable_cache(
  async (productIds: string[]) => {
    if (productIds.length === 0) {
      return [];
    }

    return prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      // Maintain the order from the input array
      orderBy: {
        id: "asc", // This will be overridden by client-side sorting
      },
    });
  },
  ["recently-viewed-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Best selling products (based on salesCount)
export const getBestSellingProducts = unstable_cache(
  async (limit: number = 12) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        salesCount: {
          gt: 0, // Only products that have been sold
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        salesCount: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ salesCount: "desc" }, { featured: "desc" }],
      take: limit,
    });
  },
  ["best-selling-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// New arrivals (recently created products)
export const getNewArrivals = unstable_cache(
  async (limit: number = 12) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  ["new-arrivals"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Products with highest ratings
export const getTopRatedProducts = unstable_cache(
  async (limit: number = 12) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        averageRating: {
          gte: 4.0, // Only highly rated products
        },
        reviewCount: {
          gte: 5, // Minimum number of reviews
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        featured: true,
        averageRating: true,
        reviewCount: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
      take: limit,
    });
  },
  ["top-rated-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: PRODUCT_CACHE_TTL.PRODUCTS,
  }
);

// Products low in stock (for urgency)
export const getLowStockProducts = unstable_cache(
  async (limit: number = 8) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        stockStatus: "LOW_STOCK",
        stockCount: {
          lte: 10,
          gt: 0, // Not out of stock
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        mainImage: true,
        stockStatus: true,
        stockCount: true,
        featured: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { stockCount: "asc" }, // Lowest stock first
      take: limit,
    });
  },
  ["low-stock-products"],
  {
    tags: [PRODUCTS_TAG],
    revalidate: 120, // Shorter cache for stock levels
  }
);
