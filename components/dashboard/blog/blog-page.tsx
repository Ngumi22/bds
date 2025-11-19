"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogCategoriesSection from "./blog-categories-section";
import type { BlogCategory, BlogPost, User } from "@prisma/client";
import BlogPostsSection from "./blog-posts-section";
import { MinimalProductData } from "@/lib/product/product.types";

interface BlogPageProps {
  initialCategories: BlogCategory[];
  initialPosts: BlogPost[];
  products: MinimalProductData[];
  user: User;
}

export default function ClientBlogPage({
  initialCategories,
  initialPosts,
  products,
  user,
}: BlogPageProps) {
  const [categories, setCategories] =
    useState<BlogCategory[]>(initialCategories);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">
              Manage your blog posts and categories
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <BlogPostsSection
              posts={posts}
              categories={categories}
              products={products}
              user={user}
              onPostsChange={setPosts}
              onCategoriesChange={setCategories}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <BlogCategoriesSection
              categories={categories}
              onCategoriesChange={setCategories}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
