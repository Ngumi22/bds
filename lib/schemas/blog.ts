import { z } from "zod";

export const blogCategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;

export const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
