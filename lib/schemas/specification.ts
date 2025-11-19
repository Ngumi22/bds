import { z } from "zod"

export const specificationDefinitionSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Specification name is required").max(100),
  type: z.enum(["TEXT", "NUMBER", "SELECT", "BOOLEAN", "COLOR"]),
  unit: z.string().optional(),
  options: z.array(z.string()).default([]),
  isFilterable: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
})

export type SpecificationDefinitionFormData = z.infer<typeof specificationDefinitionSchema>
