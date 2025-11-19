"use client";

import { ProductForm } from "@/components/dashboard/product/product-form";
import { updateProduct } from "@/lib/actions/product-action";
import {
  ProductFormValues,
  ProductUpdateFormValues,
} from "@/lib/schemas/product";
import { Brand, Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";

type EditProductFormProps = {
  initialData: Product & {
    shippingInfo?: {
      id: string;
      freeShipping: boolean;
      estimatedDelivery: string | null;
      returnPolicy: string | null;
      warranty: string | null;
    } | null;
  };
  brands: Brand[];
  categories: Category[];
};

export function ClientEditProductPage({
  initialData,
  brands,
  categories,
}: EditProductFormProps) {
  const router = useRouter();
  const productId = initialData.id;

  const formInitialData: ProductUpdateFormValues = {
    id: productId,
    name: initialData.name,
    slug: initialData.slug,
    shortDescription: initialData.shortDescription,
    description: initialData.description,
    price: initialData.price,
    originalPrice: initialData.originalPrice,
    taxRate: initialData.taxRate,
    guarantee: initialData.guarantee,
    deliveryDate: initialData.deliveryDate,
    shipsIn: initialData.shipsIn,
    recentPurchases: initialData.recentPurchases,
    mainImage: initialData.mainImage,
    galleryImages: initialData.galleryImages,
    videoUrl: initialData.videoUrl,
    sku: initialData.sku,
    isActive: initialData.isActive,
    hasVariants: initialData.hasVariants,
    stockStatus: initialData.stockStatus,
    stockCount: initialData.stockCount,
    categoryId: initialData.categoryId,
    brandId: initialData.brandId,
    createdById: initialData.createdById,
    featured: initialData.featured,
    shippingInfo: initialData.shippingInfo
      ? {
          id: initialData.shippingInfo.id,
          freeShipping: initialData.shippingInfo.freeShipping,
          estimatedDelivery: initialData.shippingInfo.estimatedDelivery,
          returnPolicy: initialData.shippingInfo.returnPolicy,
          warranty: initialData.shippingInfo.warranty,
        }
      : null,
  };

  const handleSubmit = async (
    data: ProductFormValues | ProductUpdateFormValues
  ) => {
    try {
      const updateData = data as ProductUpdateFormValues;
      const result = await updateProduct(productId, updateData);
      if (result.success) {
        router.push("/dashboard/products");
      }
      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  return (
    <ProductForm
      initialData={formInitialData}
      brands={brands}
      categories={categories}
      onSubmit={handleSubmit}
    />
  );
}
