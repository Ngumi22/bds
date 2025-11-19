"use client";

import { ProductForm } from "@/components/dashboard/product/product-form";
import { createProduct } from "@/lib/actions/product-action";
import { ProductFormValues } from "@/lib/schemas/product";

import { Brand, Category } from "@prisma/client";
import { useState } from "react";

type NewProductPageProps = {
  brands: Brand[];
  categories: Category[];
};

export default function NewProductPage({
  brands,
  categories,
}: NewProductPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setIsLoading(true);

      const result = await createProduct(data);

      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProductForm
      brands={brands}
      categories={categories}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
