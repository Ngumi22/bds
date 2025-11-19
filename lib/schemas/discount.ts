import { z } from "zod"

export const discountFormSchema = z
  .object({
    code: z.string().min(1, "Discount code is required").max(50).toUpperCase(),
    name: z.string().min(1, "Discount name is required").max(100),
    description: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.coerce.number().positive("Value must be positive"),
    minOrderValue: z.coerce.number().min(0).optional(),
    isFreeShipping: z.boolean().default(false),
    startsAt: z.date(),
    expiresAt: z.date().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    maxUsesPerCustomer: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().default(true),
    applicability: z
      .enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES", "SPECIFIC_BRANDS"])
      .default("ALL_PRODUCTS"),
    applicableCategoryIds: z.array(z.string()).default([]),
    applicableBrandIds: z.array(z.string()).default([]),
    applicableProductIds: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false
      }
      return true
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    },
  )

export type DiscountFormData = z.infer<typeof discountFormSchema>
