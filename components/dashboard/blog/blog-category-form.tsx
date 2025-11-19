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
  blogCategoryFormSchema,
  type BlogCategoryFormValues,
} from "@/lib/schemas/blog";
import { generateSlug } from "@/lib/utils/form-helpers";
import type { BlogCategory } from "@prisma/client";

interface BlogCategoryFormProps {
  category?: BlogCategory;
  onSubmit: (data: BlogCategoryFormValues) => Promise<void>;
}

export default function BlogCategoryForm({
  category,
  onSubmit,
}: BlogCategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const form = useForm<BlogCategoryFormValues>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
  });

  const { watch, setValue } = form;
  const nameValue = watch("name");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  const handleSubmit = (data: BlogCategoryFormValues) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save category"
        );
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Technology, Lifestyle"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (
                        !form.getValues("slug") ||
                        form.getValues("slug") ===
                          generateSlug(form.getValues("name"))
                      ) {
                        setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                  />
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
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="category-slug" {...field} />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the category name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? "Saving..."
            : category
            ? "Update Category"
            : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
