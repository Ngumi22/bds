import { z } from "zod";

export const heroBannerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tag: z.string().min(1, "Tag is required"),
  description: z.string().min(1, "Description is required"),
  buttonText: z.string().min(1, "ButtonText is required"),
  image: z.string(),
  linkUrl: z.string().url().optional(),
  collectionId: z.string().nullable().optional(),
  isActive: z.boolean(),
  order: z.number(),
});
export type HeroBannerFormValues = z.infer<typeof heroBannerFormSchema>;
