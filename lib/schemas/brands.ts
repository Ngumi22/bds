import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Brand slug is required"),
  logo: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type BrandFormData = z.infer<typeof brandFormSchema>;
