import { z } from "zod";

export const StockStatusEnum = z.enum([
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "BACKORDER",
  "DISCONTINUED",
]);

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const URLSchema = z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""));

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const ShippingInfoSchema = z.object({
  id: z.string().optional(),
  freeShipping: z.boolean().default(true),
  estimatedDelivery: z.string().optional().nullable(),
  returnPolicy: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required").max(200, "Name too long"),
  slug: SlugSchema,
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description too long"),
  description: z.string().min(1, "Description is required"),

  price: z
    .number()
    .positive("Price must be positive")
    .max(1000000, "Price seems too high"),
  originalPrice: z
    .number()
    .positive("Original price must be positive")
    .max(1000000, "Original price seems too high")
    .optional()
    .nullable(),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .optional()
    .nullable(),

  guarantee: z.string().optional().nullable(),

  deliveryDate: z
    .string()
    .max(100, "Delivery date too long")
    .optional()
    .nullable(),
  shipsIn: z.string().max(100, "Ships in value too long").optional().nullable(),
  recentPurchases: z.array(z.string()).default([]),

  mainImage: z.string().min(1, "Main image is required"),
  galleryImages: z.array(z.string()).default([]),
  videoUrl: URLSchema.nullable(),

  sku: z.string().max(100, "SKU too long").optional().nullable(),
  isActive: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  stockStatus: StockStatusEnum.default("IN_STOCK"),
  stockCount: z
    .number()
    .int()
    .min(0, "Stock count cannot be negative")
    .default(0),

  salesCount: z.number().int().min(0).default(0),
  viewCount: z.number().int().min(0).default(0),
  averageRating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  viewingNow: z.number().int().min(0).optional().nullable().default(0),

  categoryId: ObjectIdSchema,
  brandId: ObjectIdSchema,
  createdById: ObjectIdSchema.optional().nullable(),

  featured: z.boolean().default(false),

  shippingInfo: ShippingInfoSchema.optional().nullable(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ProductCreateSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  salesCount: true,
  viewCount: true,
  averageRating: true,
  reviewCount: true,
  viewingNow: true,
});

export const ProductUpdateSchema = ProductSchema.omit({
  createdAt: true,
  updatedAt: true,
  salesCount: true,
  viewCount: true,
  averageRating: true,
  reviewCount: true,
  viewingNow: true,
}).extend({
  id: ObjectIdSchema,
});

export const ProductFormSchema = ProductCreateSchema.extend({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be less than 500 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .min(50, "Description should be at least 50 characters")
    .trim(),
  price: z
    .number()
    .positive("Price must be positive")
    .max(1000000, "Price seems too high"),
  originalPrice: z
    .number()
    .positive("Original price must be positive")
    .max(1000000, "Original price seems too high")
    .optional()
    .nullable(),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .optional()
    .nullable(),
  mainImage: z.string().min(1, "Main image is required"),
  galleryImages: z
    .array(z.string())
    .max(10, "Maximum 10 gallery images allowed")
    .default([]),
  recentPurchases: z
    .array(z.string())
    .max(20, "Maximum 20 recent purchases")
    .default([]),
  stockCount: z
    .number()
    .int()
    .min(0, "Stock count cannot be negative")
    .default(0),
  categoryId: ObjectIdSchema,
  brandId: ObjectIdSchema,
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductFormValues = z.infer<typeof ProductFormSchema>;
export type ProductUpdateFormValues = z.infer<typeof ProductUpdateSchema>;
export type ShippingInfo = z.infer<typeof ShippingInfoSchema>;
