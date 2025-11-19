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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { type BrandFormData, brandFormSchema } from "@/lib/schemas/brands";
import { generateSlug } from "@/lib/utils/form-helpers";
import FileUploader, { useUploader } from "../product/forms/files";
import { useUploadThing } from "@/utils/uploadthing";

export interface BrandFormProps {
  initialData?: BrandFormData & { id?: string };
  onSubmit: (data: BrandFormData) => Promise<void>;
}

export default function BrandForm({ initialData, onSubmit }: BrandFormProps) {
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const { startUpload: startImageUpload } = useUploadThing("imageUploader");

  const { imageUrls: logoUrl, ...logoUploader } = useUploader({
    initialValue: initialData?.logo ? [initialData.logo] : [],
    maxFiles: 1,
  });

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      logo: initialData?.logo ?? "",
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const { watch, setValue } = form;
  const nameValue = watch("name");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  useEffect(() => {
    setValue("logo", logoUrl[0] || "");
  }, [logoUrl, setValue]);

  const handleSubmit: SubmitHandler<BrandFormData> = (data) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success(
          initialData?.id
            ? "Brand updated successfully"
            : "Brand created successfully"
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save brand"
        );
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 p-4">
        <div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple" {...field} />
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
                      placeholder="apple"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter brand description"
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
                      Make this brand visible to customers
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
        </div>

        <div>
          <div>
            <h2>Brand Logo</h2>
          </div>
          <div>
            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormControl>
                    <FileUploader
                      imageUrls={logoUrl}
                      isUploading={logoUploader.isUploading}
                      canUploadMore={logoUploader.canUploadMore}
                      onUploadComplete={logoUploader.onUploadComplete}
                      onUploadBegin={logoUploader.onUploadBegin}
                      onRemove={logoUploader.onRemove}
                      reorder={logoUploader.reorder}
                      replaceImage={logoUploader.replaceImage}
                      endpoint="imageUploader"
                      startUpload={startImageUpload}
                      isMultiple={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          variant="outline"
          type="submit"
          disabled={isPending}
          className="w-full">
          {isPending
            ? "Saving..."
            : initialData?.id
            ? "Update Brand"
            : "Create Brand"}
        </Button>
      </form>
    </Form>
  );
}
