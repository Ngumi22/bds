import { z } from "zod";

export const blogCategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;

export const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featured: z.boolean(),
  tags: z.array(z.string()),
  categoryId: z.string().min(1, "Category is required"),
  authorId: z.string().min(1, "Author is required"),
  relatedProductIds: z.array(z.string()),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
