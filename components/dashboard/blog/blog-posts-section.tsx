"use client";

import { useState, useMemo } from "react";
import { Plus, MoreVertical, Eye, Pencil, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import BlogPostViewSheet from "./blog-post-view-sheet";
import BlogPostArchiveSheet from "./blog-post-archive-sheet";
import type {
  BlogPost,
  BlogCategory,
  BlogPostStatus,
  User,
} from "@prisma/client";

import { formatDate } from "@/lib/utils/form-helpers";
import Image from "next/image";
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
  updateBlogPostStatus,
} from "@/lib/actions/blog";
import { BlogPostFormValues } from "@/lib/schemas/blog-schema";
import BlogPostForm from "./form";
import { MinimalProductData } from "@/lib/product/product.types";

interface BlogPostsSectionProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  products: MinimalProductData[];
  user: User;
  onPostsChange: (posts: BlogPost[]) => void;
  onCategoriesChange: (categories: BlogCategory[]) => void;
}

const ITEMS_PER_PAGE = 6;

export default function BlogPostsSection({
  posts,
  categories,
  onPostsChange,
  onCategoriesChange,
  products,
  user,
}: BlogPostsSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") return posts;
    return posts.filter((post) => post.categoryId === selectedCategory);
  }, [posts, selectedCategory]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const handleCreatePost = async (data: BlogPostFormValues) => {
    try {
      const res = await createBlogPost(data);

      if (res.success && res.data) {
        onPostsChange([res.data, ...posts]);
        toast.success("Post created successfully");
        setIsCreateOpen(false);
      } else {
        toast.error(res.message || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post");
    }
  };

  const handleEditPost = async (data: BlogPostFormValues) => {
    if (!selectedPost) return;

    try {
      const res = await updateBlogPost(selectedPost.id, data);

      if (res.success && res.data) {
        onPostsChange(posts.map((p) => (p.id === res.data.id ? res.data : p)));
        toast.success("Post updated successfully");
        setSelectedPost(null);
        setIsEditOpen(false);
      } else {
        toast.error(res.message || "Failed to update post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await deleteBlogPost(id);

      if (res.success) {
        onPostsChange(posts.filter((p) => p.id !== id));
        toast.success("Post deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const handleArchivePost = async (status: BlogPostStatus) => {
    if (!selectedPost) return;

    try {
      const res = await updateBlogPostStatus(selectedPost.id, status);

      if (res.success && res.data) {
        onPostsChange(posts.map((p) => (p.id === res.data.id ? res.data : p)));
        toast.success(`Post ${status.toLowerCase()}`);
        setSelectedPost(null);
        setIsArchiveOpen(false);
      } else {
        toast.error(res.message || "Failed to update post status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post status");
    }
  };

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsViewOpen(true);
  };

  const openEditSheet = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditOpen(true);
  };

  const openArchiveSheet = (post: BlogPost) => {
    setSelectedPost(post);
    setIsArchiveOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      case "SCHEDULED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Blog Posts</h2>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <div className="mb-6">
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPosts.map((post) => (
          <Card
            key={post.id}
            className="group hover:border-primary/50 transition-colors overflow-hidden flex flex-col">
            {post.featuredImage && (
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-2">
                  {post.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewPost(post)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditSheet(post)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openArchiveSheet(post)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeletePost(post.id)}
                      className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">
                {post.excerpt || "No excerpt"}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t bg-muted/50 py-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant={getStatusBadgeVariant(post.status)}>
                  {post.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paginatedPosts.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory === "all"
                ? "Create your first blog post to get started"
                : "No posts in this category"}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}>
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Post</SheetTitle>
          </SheetHeader>
          <div className="mt-2">
            <BlogPostForm
              blogCategories={categories}
              products={products}
              currentUserId={user.id}
              onSubmit={handleCreatePost}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Post</SheetTitle>
          </SheetHeader>
          <div className="mt-2">
            <BlogPostForm
              post={selectedPost as any}
              blogCategories={categories}
              products={products}
              currentUserId={user.id}
              onSubmit={handleEditPost}
            />
          </div>
        </SheetContent>
      </Sheet>

      <BlogPostViewSheet
        post={selectedPost}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      <BlogPostArchiveSheet
        post={selectedPost}
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onStatusChange={handleArchivePost}
      />
    </div>
  );
}
