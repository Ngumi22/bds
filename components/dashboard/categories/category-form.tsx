"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryFormSchema, CategoryFormValues } from "@/lib/schemas/category";
import { CategoryWithRelations } from "@/lib/types/categories";
import FileUploader, { useUploader } from "../product/forms/files";
import { generateSlug } from "@/lib/utils/form-helpers";
import { Category } from "@prisma/client";
import { useUploadThing } from "@/utils/uploadthing";

export interface CategoryFormProps {
  initialData?: Category;
  allCategories?: CategoryWithRelations[];
  onSubmit: (data: CategoryFormValues) => Promise<void>;
}

export default function CategoryForm({
  initialData,
  allCategories = [],
  onSubmit,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const { startUpload: startImageUpload } = useUploadThing("imageUploader");
  const { imageUrls, ...imageUploader } = useUploader({
    initialValue: initialData?.image ? [initialData.image] : [],
    maxFiles: 1,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      image: initialData?.image ?? "",
      isActive: initialData?.isActive ?? true,
      parentId: initialData?.parentId ?? "",
    },
  });

  const { watch, setValue } = form;
  const nameValue = watch("name");
  const parentIdValue = watch("parentId");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  useEffect(() => {
    setValue("image", imageUrls[0] || "");
  }, [imageUrls, setValue]);

  const handleSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success(
          initialData?.id
            ? "Category updated successfully"
            : "Category created successfully"
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save category"
        );
      }
    });
  };

  const availableParentCategories = allCategories.filter((cat) => {
    if (!initialData?.id) return true;
    if (cat.id === initialData.id) return false;

    const isDescendant = (
      ancestorId: string,
      targetCategory: CategoryWithRelations
    ): boolean => {
      if (!targetCategory.children) return false;
      return targetCategory.children.some(
        (child) =>
          child.id === ancestorId ||
          isDescendant(ancestorId, child as CategoryWithRelations)
      );
    };

    return !isDescendant(initialData.id, cat);
  });

  const isParentCategory = !parentIdValue || parentIdValue === "";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 p-4">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Electronics" {...field} />
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
                    placeholder="electronics"
                    {...field}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Auto-generated from name. Edit to customize.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No parent (Top-level category)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">
                      No parent (Top-level category)
                    </SelectItem>
                    {availableParentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {isParentCategory
                    ? "This will be a parent category. Manage specifications separately after saving."
                    : "This will be a child category. Child categories inherit specifications from their parent."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Make this category visible to customers
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {isParentCategory ? (
          <div>
            <div>
              <div>Category Image</div>
            </div>
            <div>
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <FileUploader
                        imageUrls={imageUrls}
                        isUploading={imageUploader.isUploading}
                        canUploadMore={imageUploader.canUploadMore}
                        onUploadComplete={imageUploader.onUploadComplete}
                        onUploadBegin={imageUploader.onUploadBegin}
                        onRemove={imageUploader.onRemove}
                        reorder={imageUploader.reorder}
                        replaceImage={imageUploader.replaceImage}
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
          </div>
        ) : (
          <div>
            <div>
              <div>Subcategories cannot have images</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Subcategories inherit specifications and do not require separate
              images.
            </div>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? "Saving..."
            : initialData?.id
            ? "Update Category"
            : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
