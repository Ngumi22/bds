"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

import { BlogPost, BlogPostStatus, Prisma } from "@prisma/client";
import {
  BLOG_CACHE_TTL,
  BLOG_CATEGORIES_TAG,
  BLOG_CATEGORY_TAG,
  BLOG_POST_TAG,
  BLOG_POSTS_TAG,
} from "../constants";

import {
  blogCategoryFormSchema,
  BlogCategoryFormValues,
  blogPostFormSchema,
  BlogPostFormValues,
} from "../schemas/blog-schema";

export async function createBlogCategory(rawData: BlogCategoryFormValues) {
  try {
    const data = blogCategoryFormSchema.parse(rawData);

    const existing = await prisma.blogCategory.findFirst({
      where: {
        OR: [{ slug: data.slug }, { name: data.name }],
      },
    });

    if (existing) {
      return {
        success: false,
        message:
          existing.slug === data.slug
            ? "Category slug already exists"
            : "Category name already exists",
        field: existing.slug === data.slug ? "slug" : "name",
      };
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidateTag(BLOG_POSTS_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/categories");

    return { success: true, data: category };
  } catch (err: any) {
    console.error("createBlogCategory error:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        message: "Category with that slug or name already exists",
      };
    }
    return {
      success: false,
      message: err?.message ?? "Failed to create category",
    };
  }
}

export async function updateBlogCategory(
  id: string,
  rawData: BlogCategoryFormValues
) {
  try {
    const data = blogCategoryFormSchema.parse(rawData);

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Category not found" };
    }

    if (data.slug !== existing.slug) {
      const slugExists = await prisma.blogCategory.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return {
          success: false,
          message: "Slug already in use",
          field: "slug",
        };
      }
    }
    if (data.name !== existing.name) {
      const nameExists = await prisma.blogCategory.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (nameExists) {
        return {
          success: false,
          message: "Name already in use",
          field: "name",
        };
      }
    }

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidateTag(BLOG_CATEGORY_TAG(id));
    revalidateTag(BLOG_POSTS_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/categories");

    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateBlogCategory error:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { success: false, message: "Duplicate value" };
    }
    return {
      success: false,
      message: err?.message ?? "Failed to update category",
    };
  }
}

export async function deleteBlogCategory(id: string) {
  try {
    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Category not found" };
    }

    const postsCount = await prisma.blogPost.count({
      where: { categoryId: id },
    });
    if (postsCount > 0) {
      return {
        success: false,
        message: "Category has posts; reassign or delete posts first",
      };
    }

    await prisma.blogCategory.delete({ where: { id } });

    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidateTag(BLOG_CATEGORY_TAG(id));
    revalidateTag(BLOG_POSTS_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/categories");

    return { success: true, message: "Category deleted" };
  } catch (err: any) {
    console.error("deleteBlogCategory error:", err);
    return {
      success: false,
      message: err?.message ?? "Failed to delete category",
    };
  }
}

export const getAllBlogCategories = unstable_cache(
  async () => {
    return prisma.blogCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  },
  [BLOG_CATEGORIES_TAG],
  {
    tags: [BLOG_CATEGORIES_TAG],
    revalidate: BLOG_CACHE_TTL.BLOG_CATEGORIES,
  }
);

export const getBlogCategoryById = async (id: string) =>
  unstable_cache(
    async () => {
      return prisma.blogCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });
    },
    [BLOG_CATEGORY_TAG(id)],
    {
      tags: [BLOG_CATEGORY_TAG(id)],
      revalidate: BLOG_CACHE_TTL.BLOG_CATEGORY,
    }
  )();

export async function createBlogPost(rawData: BlogPostFormValues) {
  try {
    const data = blogPostFormSchema.parse(rawData);

    const existingSlug = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return {
        success: false,
        message: "Post slug already exists",
        field: "slug",
      };
    }

    const [category, author] = await Promise.all([
      prisma.blogCategory.findUnique({ where: { id: data.categoryId } }),
      prisma.user.findUnique({ where: { id: data.authorId } }),
    ]);

    if (!category) {
      return {
        success: false,
        message: "Category not found",
        field: "categoryId",
      };
    }

    if (!author) {
      return {
        success: false,
        message: "Author not found",
        field: "authorId",
      };
    }

    const postData = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      featured: data.featured,
      tags: data.tags,
      authorId: data.authorId,
      categoryId: data.categoryId,
      relatedProductIds: data.relatedProductIds,
      publishedAt: data.status === BlogPostStatus.PUBLISHED ? new Date() : null,
    };

    const post = await prisma.blogPost.create({
      data: postData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    revalidateTag(BLOG_POSTS_TAG);
    revalidateTag(BLOG_POST_TAG(post.id));
    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/posts");

    return { success: true, data: post };
  } catch (err: any) {
    console.error("createBlogPost error:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { success: false, message: "Duplicate slug" };
    }
    return { success: false, message: err?.message ?? "Failed to create post" };
  }
}

export async function updateBlogPost(id: string, rawData: BlogPostFormValues) {
  try {
    const data = blogPostFormSchema.parse(rawData);

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Post not found" };
    }

    if (data.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return {
          success: false,
          message: "Slug already in use",
          field: "slug",
        };
      }
    }

    // Validate required relations
    const [category, author] = await Promise.all([
      prisma.blogCategory.findUnique({ where: { id: data.categoryId } }),
      prisma.user.findUnique({ where: { id: data.authorId } }),
    ]);

    if (!category) {
      return {
        success: false,
        message: "Category not found",
        field: "categoryId",
      };
    }

    if (!author) {
      return {
        success: false,
        message: "Author not found",
        field: "authorId",
      };
    }

    const updateData = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      featured: data.featured,
      tags: data.tags,
      authorId: data.authorId,
      categoryId: data.categoryId,
      relatedProductIds: data.relatedProductIds,
    };

    // Update publishedAt if status changed to PUBLISHED
    if (
      data.status === BlogPostStatus.PUBLISHED &&
      existing.status !== BlogPostStatus.PUBLISHED
    ) {
      (updateData as any).publishedAt = new Date();
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    revalidateTag(BLOG_POSTS_TAG);
    revalidateTag(BLOG_POST_TAG(id));
    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/posts");

    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateBlogPost error:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { success: false, message: "Duplicate value" };
    }
    return { success: false, message: err?.message ?? "Failed to update post" };
  }
}

export async function updateBlogPostStatus(id: string, status: BlogPostStatus) {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { success: false, message: "Post not found." };

    const updateData: any = { status };

    if (
      status === BlogPostStatus.PUBLISHED &&
      existing.status !== BlogPostStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    revalidateTag(BLOG_POSTS_TAG);
    revalidateTag(BLOG_POST_TAG(id));
    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("updateBlogPostStatus error:", error);
    return {
      success: false,
      message: error.message || "Failed to update status",
    };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Post not found" };
    }

    await prisma.blogPost.delete({ where: { id } });

    revalidateTag(BLOG_POSTS_TAG);
    revalidateTag(BLOG_POST_TAG(id));
    revalidateTag(BLOG_CATEGORIES_TAG);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog/posts");

    return { success: true, message: "Post deleted" };
  } catch (err: any) {
    console.error("deleteBlogPost error:", err);
    return { success: false, message: err?.message ?? "Failed to delete post" };
  }
}

export const getAllBlogPosts = unstable_cache(
  async ({
    page = 1,
    limit = 6,
    search = "",
    tag = "",
    category = "",
    status,
    featured,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    category?: string;
    status?: BlogPostStatus;
    featured?: boolean;
  } = {}) => {
    const skip = (page - 1) * limit;

    const filters: any = {
      ...(status && { status }),
      ...(featured !== undefined && { featured }),
    };

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    if (tag) {
      filters.tags = { has: tag.toLowerCase() };
    }

    if (category) {
      filters.categoryId = category;
    }

    const [totalPosts, posts] = await Promise.all([
      prisma.blogPost.count({ where: filters }),
      prisma.blogPost.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts,
      totalPages,
      totalPosts,
      currentPage: page,
    };
  },
  [BLOG_POSTS_TAG],
  {
    tags: [BLOG_POSTS_TAG],
    revalidate: BLOG_CACHE_TTL.BLOG_POSTS,
  }
);

export const getBlogPostById = async (id: string) =>
  unstable_cache(
    async () => {
      return prisma.blogPost.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true, email: true } },
        },
      });
    },
    [BLOG_POST_TAG(id)],
    {
      tags: [BLOG_POST_TAG(id)],
      revalidate: BLOG_CACHE_TTL.BLOG_POST,
    }
  )();

export async function getRelatedPosts(postId: string, limit: number = 4) {
  return unstable_cache(
    async () => {
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: postId },
        select: {
          categoryId: true,
          tags: true,
          id: true,
          relatedProductIds: true,
        },
      });

      if (!currentPost) return [];

      return prisma.blogPost.findMany({
        where: {
          AND: [
            { id: { not: postId } },
            { status: BlogPostStatus.PUBLISHED },
            {
              OR: [
                { categoryId: currentPost.categoryId },
                { tags: { hasSome: currentPost.tags } },
                {
                  relatedProductIds: {
                    hasSome: currentPost.relatedProductIds,
                  },
                },
              ],
            },
          ],
        },
        take: limit,
        orderBy: [
          { featured: "desc" },
          { publishedAt: "desc" },
          { views: "desc" },
        ],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      });
    },
    [`related-posts-${postId}-${limit}`],
    {
      revalidate: BLOG_CACHE_TTL.BLOG_POSTS,
      tags: [`related-posts-${postId}`],
    }
  )();
}

export async function getPopularPosts(limit: number = 6, category?: string) {
  return unstable_cache(
    async () => {
      const filters: any = {
        status: BlogPostStatus.PUBLISHED,
      };

      if (category) {
        filters.categoryId = category;
      }

      return prisma.blogPost.findMany({
        where: filters,
        take: limit,
        orderBy: [
          { featured: "desc" },
          { views: "desc" },
          { publishedAt: "desc" },
        ],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      });
    },
    [`popular-posts-${limit}-${category || "all"}`],
    {
      revalidate: BLOG_CACHE_TTL.BLOG_POSTS,
      tags: category ? [`popular-posts-${category}`] : ["popular-posts"],
    }
  )();
}

export const getFeaturedPosts = unstable_cache(
  async (limit: number = 3) => {
    return prisma.blogPost.findMany({
      where: {
        status: BlogPostStatus.PUBLISHED,
        featured: true,
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    });
  },
  ["featured-posts"],
  {
    revalidate: BLOG_CACHE_TTL.BLOG_POSTS,
  }
);

export async function getPostsByProduct(productId: string) {
  return unstable_cache(
    async () => {
      return prisma.blogPost.findMany({
        where: {
          status: BlogPostStatus.PUBLISHED,
          relatedProductIds: { has: productId },
        },
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      });
    },
    [`product-posts-${productId}`], // KeyParts: Now a valid array
    {
      revalidate: BLOG_CACHE_TTL.BLOG_POSTS,
      tags: [`product-posts-${productId}`],
    }
  )();
}

export const incrementPostViews = async (postId: string) => {
  try {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        views: { increment: 1 },
      },
    });
  } catch (error) {
    console.error("Failed to increment post views:", error);
  }
};

export const getBlogPostBySlug = async (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.blogPost.findFirst({
        where: { slug },
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      });
    },
    [`blog-post-slug-${slug}`],
    {
      tags: [`blog-post-${slug}`],
      revalidate: BLOG_CACHE_TTL.BLOG_POST,
    }
  )();

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    select: { slug: true },
    orderBy: { createdAt: "desc" },
  });
  return posts.map((post: any) => post.slug);
}

export async function getBlogTags(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    select: { tags: true },
  });

  const allTags = posts.flatMap((post: any) => post.tags) as string[];
  return Array.from(new Set(allTags)).sort();
}
