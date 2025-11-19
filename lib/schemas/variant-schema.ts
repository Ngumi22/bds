import { z } from "zod";

export const VariantOptionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Option name is required")
    .max(100, "Option name too long"),

  value: z.string().optional().nullable(),

  color: z.string().max(50, "Color value too long").optional().nullable(),

  inStock: z.boolean().default(true),
  stockCount: z
    .number()
    .int()
    .min(0, "Stock count cannot be negative")
    .default(0),
  priceModifier: z.number().default(0),
});

export const VariantGroupSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Variant group name is required")
    .max(100, "Variant group name too long"),
  value: z.string().optional(),
  options: z
    .array(VariantOptionSchema)
    .min(1, "At least one variant option is required"),
});

export const VariantOptionFormSchema = VariantOptionSchema.extend({
  name: z
    .string()
    .min(1, "Option name is required")
    .max(100, "Option name must be less than 100 characters")
    .trim(),
  color: z
    .string()
    .max(50, "Color value must be less than 50 characters")
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z\s]+$/.test(val),
      {
        message: "Color must be a valid hex code or color name",
      }
    ),
  priceModifier: z
    .number()
    .min(-1000, "Price modifier cannot be less than -1000")
    .max(1000, "Price modifier cannot exceed 1000")
    .default(0),
  stockCount: z
    .number()
    .int()
    .min(0, "Stock count cannot be negative")
    .max(100000, "Stock count seems too high")
    .default(0),
});

export const VariantGroupFormSchema = VariantGroupSchema.extend({
  name: z
    .string()
    .min(1, "Variant group name is required")
    .max(100, "Variant group name must be less than 100 characters")
    .trim(),
  options: z
    .array(VariantOptionFormSchema)
    .min(1, "At least one variant option is required")
    .max(50, "Maximum 50 options per variant group"),
});

export const VariantGroupsArraySchema = z
  .array(VariantGroupFormSchema)
  .max(10, "Maximum 10 variant groups allowed")
  .default([]);

export type VariantOption = z.infer<typeof VariantOptionSchema>;
export type VariantGroup = z.infer<typeof VariantGroupSchema>;
export type VariantOptionForm = z.infer<typeof VariantOptionFormSchema>;
export type VariantGroupForm = z.infer<typeof VariantGroupFormSchema>;
