"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useTransition } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import type { HeroBanner } from "@/lib/types/hero-banner";
import { toast } from "sonner";
import {
  heroBannerFormSchema,
  HeroBannerFormValues,
} from "@/lib/schemas/hero-banner";
import { useUploadThing } from "@/utils/uploadthing";
import FileUploader, { useUploader } from "../product/forms/files";
import { useRouter } from "next/navigation";

interface HeroBannerFormProps {
  banner?: HeroBanner;
  collections?: Array<{ id: string; name: string }>;
  onSubmit: (data: HeroBannerFormValues) => Promise<{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
  }>;
  onSuccess?: () => void;
}

export default function HeroBannerForm({
  banner,
  collections = [],
  onSubmit,
  onSuccess,
}: HeroBannerFormProps) {
  const [isPending, startTransition] = useTransition();
  const { startUpload: startImageUpload } = useUploadThing("imageUploader");
  const router = useRouter();
  const { imageUrls: imageUrl, ...imageUploader } = useUploader({
    initialValue: banner?.image ? [banner.image] : [],
    maxFiles: 1,
  });

  const form = useForm<HeroBannerFormValues>({
    resolver: zodResolver(heroBannerFormSchema),
    defaultValues: {
      title: banner?.title ?? "",
      image: banner?.image ?? "",
      tag: banner?.tag ?? "",
      description: banner?.description ?? "",
      buttonText: banner?.buttonText ?? "",
      linkUrl: banner?.linkUrl ?? "",
      collectionId: banner?.collectionId ?? "",
      isActive: banner?.isActive ?? true,
      order: banner?.order ?? 0,
    },
  });

  const { setValue } = form;

  useEffect(() => {
    setValue("image", imageUrl[0] || "");
  }, [imageUrl, setValue]);

  const handleSubmit = (data: HeroBannerFormValues) => {
    startTransition(async () => {
      const result = await onSubmit(data);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.message);
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof HeroBannerFormValues, {
              message: messages.join(", "),
            });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Sale - Up to 50% Off"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="For your work use.." {...field} />
                  </FormControl>

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
                    <Input
                      placeholder="Discover products that......"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Explore products" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <FileUploader
                      imageUrls={imageUrl}
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
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a high-quality banner image (recommended: 1920x600px)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/sale"
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
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Collection (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Associate this banner with a specific collection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between">
                    <FormLabel>Active Status</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : banner
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
