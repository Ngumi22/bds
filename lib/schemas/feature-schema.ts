import z from "zod";

export const ProductFeatureSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
