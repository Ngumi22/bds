"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { generateSlug } from "@/lib/utils/form-helpers";
import FileUploader, { useUploader } from "../product/forms/files";
import RichTextEditor from "../product/forms/Editor";
import {
  BlogCategory,
  BlogPost,
  BlogPostStatus,
  Product,
} from "@prisma/client";
import { useUploadThing } from "@/utils/uploadthing";
import { Checkbox } from "@/components/ui/checkbox";
import {
  blogPostFormSchema,
  BlogPostFormValues,
} from "@/lib/schemas/blog-schema";
import { MinimalProductData } from "@/lib/product/product.types";

interface BlogPostFormProps {
  post?: BlogPost & {
    category: BlogCategory;
  };
  blogCategories: BlogCategory[];
  products: MinimalProductData[];
  currentUserId: string;
  onSubmit: (data: BlogPostFormValues) => Promise<void>;
}

export default function BlogPostForm({
  post,
  blogCategories,
  products,
  currentUserId,
  onSubmit,
}: BlogPostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const { startUpload: startImageUpload } = useUploadThing("imageUploader");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || []);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    post?.relatedProductIds || []
  );

  const { imageUrls: featuredImageUrl, ...featuredImageUploader } = useUploader(
    {
      initialValue: post?.featuredImage ? [post.featuredImage] : [],
      maxFiles: 1,
    }
  );

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      content: post?.content ?? "",
      excerpt: post?.excerpt ?? "",
      status: post?.status ?? BlogPostStatus.DRAFT,
      featuredImage: post?.featuredImage ?? "",
      metaTitle: post?.metaTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
      featured: post?.featured ?? false,
      tags: post?.tags ?? [],
      categoryId: post?.categoryId ?? "",
      authorId: currentUserId,
      relatedProductIds: post?.relatedProductIds ?? [],
    },
  });

  const { watch, setValue } = form;
  const titleValue = watch("title");

  useEffect(() => {
    if (!slugManuallyEdited && titleValue) {
      setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, slugManuallyEdited, setValue]);

  useEffect(() => {
    setValue("featuredImage", featuredImageUrl[0] || "");
  }, [featuredImageUrl, setValue]);

  useEffect(() => {
    setValue("tags", selectedTags);
  }, [selectedTags, setValue]);

  useEffect(() => {
    setValue("relatedProductIds", selectedProductIds);
  }, [selectedProductIds, setValue]);

  const handleSubmit = (data: BlogPostFormValues) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success(
          post?.id ? "Post updated successfully" : "Post created successfully"
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save post"
        );
      }
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !selectedTags.includes(value)) {
        setSelectedTags([...selectedTags, value]);
        e.currentTarget.value = "";
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 p-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Post title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="post-slug"
                    {...field}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Auto-generated from title. Edit to customize.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief summary of the post..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!form.formState.errors.content}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={BlogPostStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={BlogPostStatus.PUBLISHED}>
                      Published
                    </SelectItem>
                    <SelectItem value={BlogPostStatus.ARCHIVED}>
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {blogCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Post</FormLabel>
                  <FormDescription>
                    Mark this post as featured on the blog homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* SEO Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="SEO meta title" {...field} />
                </FormControl>
                <FormDescription>
                  If empty, the post title will be used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="SEO meta description"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  If empty, the excerpt will be used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <FormLabel>Tags</FormLabel>
          <div className="border rounded-md p-2">
            <Input
              placeholder="Type tag and press Enter..."
              onKeyDown={handleTagInput}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-destructive">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <FormDescription>
            Add tags for better categorization and search
          </FormDescription>
        </div>

        {/* Related Products */}
        <div className="space-y-4">
          <FormLabel>Related Products</FormLabel>
          <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedProductIds.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <label
                  htmlFor={`product-${product.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {product.name}
                </label>
              </div>
            ))}
          </div>
          <FormDescription>Link this post to relevant products</FormDescription>
        </div>

        {/* Featured Image */}
        <div className="space-y-4">
          <FormLabel>Featured Image</FormLabel>
          <FormField
            control={form.control}
            name="featuredImage"
            render={() => (
              <FormItem>
                <FormControl>
                  <FileUploader
                    imageUrls={featuredImageUrl}
                    isUploading={featuredImageUploader.isUploading}
                    canUploadMore={featuredImageUploader.canUploadMore}
                    onUploadComplete={featuredImageUploader.onUploadComplete}
                    onUploadBegin={featuredImageUploader.onUploadBegin}
                    onRemove={featuredImageUploader.onRemove}
                    reorder={featuredImageUploader.reorder}
                    replaceImage={featuredImageUploader.replaceImage}
                    endpoint="imageUploader"
                    startUpload={startImageUpload}
                    isMultiple={false}
                    mode="replace"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : post?.id ? "Update Post" : "Create Post"}
        </Button>
      </form>
    </Form>
  );
}
