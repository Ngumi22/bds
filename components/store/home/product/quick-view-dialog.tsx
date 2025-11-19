"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Truck, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/form-helpers";
import Link from "next/link";
import { WishlistButtonFull } from "./wishlist-button";
import { MinimalProductData } from "@/lib/product/product.types";

export interface VariantOption {
  id: string;
  name: string;
  inStock: boolean;
  color?: string;
  priceModifier?: number;
}

export interface VariantType {
  name: string;
  options: VariantOption[];
}

export interface ProductQuickViewProps extends MinimalProductData {
  originalPrice: number | null;
  images: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string;
  shipping?: {
    freeShipping?: boolean;
    estimatedDays?: number;
  };
  guarantee?: string;
  inStock?: boolean;
  variantTypes?: VariantType[];
  viewingNow?: number;
}

interface QuickViewDialogProps {
  product: ProductQuickViewProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onVariantChange?: (variants: Record<string, string>) => void;
}

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onAddToWishlist,
  onVariantChange,
}: QuickViewDialogProps) {
  if (!product) return null;

  const hasDiscount =
    !!product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    product.variantTypes?.forEach((type) => {
      const firstAvailable = type.options.find((opt) => opt.inStock);
      if (firstAvailable) initial[type.name] = firstAvailable.id;
    });
    return initial;
  });

  useEffect(() => {
    if (onVariantChange) onVariantChange(selectedVariants);
  }, [selectedVariants, onVariantChange]);

  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const brand = product.brand;
  const freeShipping = product.shipping?.freeShipping || false;
  const estimatedDays = product.shipping?.estimatedDays || 0;
  const guarantee = product.guarantee || null;
  const inStock = product.inStock ?? true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:min-w-4xl rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-md">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-sm text-sm font-semibold">
                {discountPercent}% Off
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {brand}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
              {product.viewingNow && product.viewingNow > 0 && (
                <span className="text-xs text-gray-500">
                  {product.viewingNow} viewing now
                </span>
              )}
            </div>

            <div className="space-y-2 py-3 border-y border-gray-200">
              {freeShipping && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck size={16} className="text-green-600" />
                  <span className="font-medium text-green-700">
                    Free Shipping
                  </span>
                </div>
              )}
              {estimatedDays > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={16} />
                  <span>Arrives in {estimatedDays} business days</span>
                </div>
              )}
              {guarantee && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} />
                  <span>{guarantee}</span>
                </div>
              )}
            </div>

            {product.variantTypes?.map((variantType) => (
              <div key={variantType.name} className="flex flex-wrap gap-2">
                {variantType.options.map((option) => {
                  const isSelected =
                    selectedVariants[variantType.name] === option.id;
                  if (option.color) {
                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variantType.name]: option.id,
                          }))
                        }
                        disabled={!option.inStock}
                        className={`relative h-9 w-9 shrink-0 border-2 transition-all sm:h-10 sm:w-10 ${
                          isSelected ? "border-foreground" : "border-border"
                        } ${
                          !option.inStock
                            ? "cursor-not-allowed opacity-40"
                            : "hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: option.color }}
                        title={option.name}>
                        {!option.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-px w-full rotate-45 bg-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [variantType.name]: option.id,
                        }))
                      }
                      disabled={!option.inStock}
                      className={`border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:border-muted-foreground"
                      } ${
                        !option.inStock
                          ? "cursor-not-allowed opacity-40 line-through"
                          : ""
                      }`}>
                      <span className="whitespace-nowrap">
                        {option.name}
                        {option.priceModifier ? (
                          <span className="ml-1">
                            +${option.priceModifier.toFixed(2)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="flex gap-2 mt-auto pt-2">
              <Link href={`/products/${product.slug}`}>
                <Button type="button" variant="link" className="px-4">
                  View Product
                </Button>
              </Link>
              <WishlistButtonFull product={product} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
