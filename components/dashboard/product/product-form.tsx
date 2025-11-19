"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductUpdateSchema,
  type ProductFormValues,
  type ProductUpdateFormValues,
  StockStatusEnum,
  ProductSchema,
} from "@/lib/schemas/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import FileUploader, { useUploader } from "./forms/files";
import RichTextEditor from "./forms/Editor";
import { generateSlug } from "@/lib/utils/form-helpers";
import type { Brand, Category } from "@prisma/client";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  initialData?: (ProductFormValues | ProductUpdateFormValues) & { id?: string };
  brands: Brand[];
  categories: Category[];
  onSubmit: (
    data: ProductFormValues | ProductUpdateFormValues
  ) => Promise<{ success: boolean; error?: string; product?: any }>;
  isLoading?: boolean;
}
export function ProductForm({
  initialData,
  brands,
  categories,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const router = useRouter();
  const { startUpload: startMainImageUpload } = useUploadThing("imageUploader");
  const { startUpload: startGalleryUpload } = useUploadThing("imageUploader");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { imageUrls: mainImageUrl, ...mainImageUploader } = useUploader({
    initialValue: initialData?.mainImage ? [initialData.mainImage] : [],
    maxFiles: 1,
  });

  const { imageUrls: galleryUrls, ...galleryUploader } = useUploader({
    initialValue: initialData?.galleryImages || [],
    maxFiles: 4,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isUpdate = !!initialData?.id;
  const schema = isUpdate ? ProductUpdateSchema : ProductSchema;

  type FormValues = typeof isUpdate extends true
    ? ProductUpdateFormValues
    : ProductFormValues;

  const formConfig: UseFormProps<FormValues> = {
    resolver: zodResolver(schema) as any,
    mode: "onBlur",
    defaultValues: (initialData || {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      price: 0,
      originalPrice: null,
      taxRate: null,
      brandStory: null,
      guarantee: null,
      deliveryDate: null,
      shipsIn: null,
      recentPurchases: [],
      mainImage: "",
      galleryImages: [],
      videoUrl: null,
      sku: null,
      isActive: true,
      hasVariants: false,
      stockStatus: "IN_STOCK",
      stockCount: 0,
      viewingNow: 0,
      categoryId: "",
      brandId: "",
      createdById: null,
      featured: false,
      viewCount: 0,
      averageRating: 0,
      reviewCount: 0,
      shippingInfo: null,
    }) as FormValues,
  };

  const methods = useForm<FormValues>(formConfig);
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = methods;

  const nameValue = watch("name");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  useEffect(() => {
    setValue("galleryImages", galleryUrls);
  }, [galleryUrls, setValue]);

  useEffect(() => {
    if (mainImageUrl[0]) {
      setValue("mainImage", mainImageUrl[0]);
    }
  }, [mainImageUrl, setValue]);

  const stockCountValue = watch("stockCount");

  useEffect(() => {
    if (stockCountValue !== undefined && stockCountValue !== null) {
      if (stockCountValue === 0) {
        setValue("stockStatus", "OUT_OF_STOCK");
      } else if (stockCountValue <= 10) {
        setValue("stockStatus", "LOW_STOCK");
      } else {
        setValue("stockStatus", "IN_STOCK");
      }
    }
  }, [stockCountValue, setValue]);

  const handleFormSubmit = async (data: FormValues) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      const result = await onSubmit(data);

      if (result.success) {
        setSubmitSuccess(true);
        toast.success(
          isUpdate
            ? "Product updated successfully"
            : "Product created successfully"
        );
        if (!isUpdate) {
          reset();
        }

        router.push("/dashboard/products");
      } else {
        setSubmitError(result.error || "An error occurred");
        toast.error(result.error || "Failed to save product");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
        {submitError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-2 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 text-xs">Error</p>
                <p className="text-xs text-red-800">{submitError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {submitSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-2 flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                {isUpdate
                  ? "Product updated successfully"
                  : "Product created successfully"}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left Column */}
          <div className="space-y-2">
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter product name"
                          className={errors.name ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="product-slug"
                          onFocus={() => setSlugManuallyEdited(true)}
                          className={errors.slug ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief product description"
                          className={
                            errors.shortDescription ? "border-red-500" : ""
                          }
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!errors.description}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className={errors.price ? "border-red-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                            className={
                              errors.originalPrice ? "border-red-500" : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                            className={errors.taxRate ? "border-red-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  Brand & Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="guarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guarantee/Warranty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g., 2-year warranty"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date Estimate</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g., 3-5 business days"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shipsIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ships In</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g., 24 hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="recentPurchases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recent Purchases Display</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value?.join(", ") || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Enter recent purchase messages separated by commas"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Inventory & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Product SKU"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="stockCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className={errors.stockCount ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="stockStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stock status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {StockStatusEnum.options.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image *</FormLabel>
                      <FormControl>
                        <div>
                          <FileUploader
                            imageUrls={mainImageUrl}
                            isUploading={mainImageUploader.isUploading}
                            canUploadMore={mainImageUploader.canUploadMore}
                            onUploadComplete={(res) => {
                              mainImageUploader.onUploadComplete(res);
                              const firstUrl = res[0]?.ufsUrl || res[0]?.url;
                              if (firstUrl) field.onChange(firstUrl);
                            }}
                            onUploadBegin={mainImageUploader.onUploadBegin}
                            onRemove={(url) => {
                              mainImageUploader.onRemove(url);
                              field.onChange("");
                            }}
                            reorder={mainImageUploader.reorder}
                            replaceImage={(oldUrl, newUrl) => {
                              mainImageUploader.replaceImage(oldUrl, newUrl);
                              field.onChange(newUrl);
                            }}
                            endpoint="imageUploader"
                            startUpload={startMainImageUpload}
                            isMultiple={false}
                            mode="replace"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="galleryImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gallery Images (Max 10)</FormLabel>
                      <FormControl>
                        <div>
                          <FileUploader
                            imageUrls={galleryUrls}
                            isUploading={galleryUploader.isUploading}
                            canUploadMore={galleryUploader.canUploadMore}
                            onUploadComplete={(res) => {
                              galleryUploader.onUploadComplete(res);
                              const urls = res.map(
                                (item) => item.ufsUrl || item.url
                              );
                              field.onChange(urls);
                            }}
                            onUploadBegin={galleryUploader.onUploadBegin}
                            onRemove={(url) => {
                              galleryUploader.onRemove(url);
                              const newUrls = galleryUrls.filter(
                                (u) => u !== url
                              );
                              field.onChange(newUrls);
                            }}
                            reorder={galleryUploader.reorder}
                            replaceImage={galleryUploader.replaceImage}
                            endpoint="imageUploader"
                            startUpload={startGalleryUpload}
                            isMultiple={true}
                            mode="add"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="https://example.com/video"
                          className={errors.videoUrl ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory & Stock */}

            {/* Category & Brand */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Category & Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className={
                              errors.categoryId ? "border-red-500" : ""
                            }>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className={errors.brandId ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="shippingInfo.freeShipping"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Free Shipping</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shippingInfo.estimatedDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="e.g., 3-5 business days"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shippingInfo.returnPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Policy</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Return policy details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shippingInfo.warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Warranty information"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Flags */}
            <Card className="py-4">
              <CardHeader>
                <CardTitle className="text-sm">Product Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name="hasVariants"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Has Variants</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="min-w-32"
            size="lg">
            {isSubmitting || isLoading
              ? "Saving..."
              : isUpdate
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
