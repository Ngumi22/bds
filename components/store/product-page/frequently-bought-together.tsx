"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/form-helpers";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FrequentlyBoughtTogetherProps {
  mainProduct: {
    id: string;
    name: string;
    price: number;
    images: string[];
    variantTypes?: Array<{
      name: string;
      options: Array<{
        id: string;
        name: string;
        priceModifier: number;
      }>;
    }>;
  };
  bundleProducts: Product[];
  currentVariantPrice?: number;
  selectedVariants?: Record<string, string>;
}

export function FrequentlyBoughtTogether({
  mainProduct,
  bundleProducts,
  currentVariantPrice,
  selectedVariants,
}: FrequentlyBoughtTogetherProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([mainProduct.id, ...bundleProducts.map((p) => p.id)])
  );

  const getMainProductPrice = () => {
    if (!currentVariantPrice) {
      return mainProduct.price;
    }
    return currentVariantPrice;
  };

  const mainProductPrice = getMainProductPrice();

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (id === mainProduct.id) return newSet;
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalPrice = [
    { id: mainProduct.id, price: mainProductPrice },
    ...bundleProducts.map((p) => ({ id: p.id, price: p.price })),
  ]
    .filter((p) => selectedProducts.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const savings = totalPrice * 0.1; // 10% bundle discount
  const finalTotal = totalPrice - savings;

  const handleAddBundleToCart = () => {
    const bundleItems = [
      {
        productId: mainProduct.id,
        price: mainProductPrice,
        selectedVariants: selectedVariants,
      },
      ...bundleProducts
        .filter((p) => selectedProducts.has(p.id))
        .map((p) => ({
          productId: p.id,
          price: p.price,
        })),
    ];
    console.log("Adding bundle to cart:", {
      items: bundleItems,
      totalPrice: finalTotal,
      savings: savings,
    });
  };

  return (
    <div className="mt-8 border border-border bg-card p-4 sm:mt-12 sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
        Frequently Bought Together
      </h2>
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
        <div className="flex flex-col items-center">
          <label className="mb-2 flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked disabled className="h-3.5 w-3.5" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              This item
            </span>
          </label>
          <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border sm:h-20 sm:w-20">
            <Image
              src={mainProduct.images[0] || "/placeholder.svg"}
              alt={mainProduct.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <p className="mt-2 text-xs font-medium text-foreground">
            {formatCurrency(mainProductPrice)}
          </p>
        </div>

        {bundleProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-2 sm:gap-3">
            <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
            <div className="flex flex-col items-center">
              <label className="mb-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Add
                </span>
              </label>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border sm:h-20 sm:w-20">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="mt-2 text-xs font-medium text-foreground">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Total:{" "}
            <span className="text-base font-semibold text-foreground sm:text-lg">
              {formatCurrency(totalPrice)}
            </span>
          </p>
          <p className="text-xs text-foreground text-pretty">
            Save {formatCurrency(savings)} (10% bundle discount) • Final:{" "}
            {formatCurrency(finalTotal)}
          </p>
        </div>
        <Button
          size="lg"
          className="w-full text-xs sm:w-auto sm:shrink-0 sm:text-sm"
          onClick={handleAddBundleToCart}>
          Add Selected to Cart
        </Button>
      </div>
    </div>
  );
}
