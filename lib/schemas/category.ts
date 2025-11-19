import { z } from "zod";

export const specificationTypeSchema = z.enum([
  "TEXT",
  "NUMBER",
  "SELECT",
  "BOOLEAN",
  "COLOR",
]);

export const specificationDefinitionSchema = z
  .object({
    categoryId: z.string().min(1, "Category ID is required"),
    name: z
      .string()
      .min(1, "Specification name is required")
      .max(100, "Specification name must be less than 100 characters"),
    type: specificationTypeSchema,
    unit: z
      .string()
      .max(50, "Unit must be less than 50 characters")
      .optional()
      .or(z.literal(""))
      .transform((val) => val || undefined),
    options: z.array(z.string()).default([]),
    isFilterable: z.boolean().default(true),
    displayOrder: z.number().default(0),
  })
  .refine(
    (data) => {
      if (data.type === "SELECT") {
        return (
          data.options.length > 0 &&
          data.options.some((opt) => opt.trim().length > 0)
        );
      }
      return true;
    },
    {
      message: "SELECT type specifications must have at least one option",
      path: ["options"],
    }
  );

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Brand slug is required"),
  image: z.string().nullable().optional(),
  isActive: z.boolean(),
  parentId: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type SpecificationDefinitionValues = z.infer<
  typeof specificationDefinitionSchema
>;
