"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Star,
  CheckCircle2,
  AlertCircle,
  Heart,
  Minus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/form-helpers";
import { MinimalProductData } from "@/lib/product/product.types";
import { useProductQuickView } from "@/hooks/use-product-view";
import AddToCartButton from "../store/home/product/add-to-cart";

export interface VariantOption {
  id: string;
  name: string;
  color?: string;
  inStock: boolean;
  stockCount: number;
  priceModifier: number;
}

export interface VariantType {
  name: string;
  options: VariantOption[];
}

interface QuickViewDialogProps {
  product: MinimalProductData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (cartItem: any) => void;
}

export function QuickViewDialog({
  product: initialProduct,
  open,
  onOpenChange,
  onAddToCart,
}: QuickViewDialogProps) {
  const { data: fullDetails, isLoading } = useProductQuickView(
    initialProduct,
    open
  );

  const product = useMemo(() => {
    if (!initialProduct) return null;
    return { ...initialProduct, ...fullDetails };
  }, [initialProduct, fullDetails]);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (fullDetails?.variantTypes) {
      const initial: Record<string, string> = {};
      fullDetails.variantTypes.forEach((type: VariantType) => {
        const firstAvailable = type.options.find((opt) => opt.inStock);
        if (firstAvailable) initial[type.name] = firstAvailable.id;
      });
      setSelectedVariants(initial);
      setQuantity(1);
    }
  }, [fullDetails]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.price;

    if (product.variantTypes) {
      product.variantTypes.forEach((type: VariantType) => {
        const selectedId = selectedVariants[type.name];
        const option = type.options.find((opt) => opt.id === selectedId);
        if (option && option.priceModifier) {
          price += option.priceModifier;
        }
      });
    }
    return price;
  }, [product, selectedVariants]);

  const currentStock = useMemo(() => {
    if (!product) return { inStock: false, stockCount: 0 };

    if (!product.variantTypes || product.variantTypes.length === 0) {
      return { inStock: product.inStock ?? true, stockCount: 100 };
    }

    let minStock = Number.POSITIVE_INFINITY;
    let allInStock = true;

    product.variantTypes.forEach((type: VariantType) => {
      const selectedId = selectedVariants[type.name];
      const option = type.options.find((opt) => opt.id === selectedId);

      if (option) {
        if (!option.inStock) allInStock = false;
        if (option.stockCount < minStock) minStock = option.stockCount;
      }
    });

    return {
      inStock: allInStock,
      stockCount: minStock === Number.POSITIVE_INFINITY ? 0 : minStock,
    };
  }, [product, selectedVariants]);

  const handleAddToCartClick = () => {
    if (!product) return;

    const cartItem = {
      productId: product.slug,
      productName: product.name,
      basePrice: product.price,
      selectedVariants: selectedVariants,
      finalPrice: finalPrice,
      quantity: quantity,
      totalPrice: finalPrice * quantity,
      image: product.mainImage,
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      console.log("Added to cart:", cartItem);
    }
    onOpenChange(false);
  };

  const discountPercent =
    product?.originalPrice && finalPrice < product.originalPrice
      ? Math.round(
          ((product.originalPrice - finalPrice) / product.originalPrice) * 100
        )
      : 0;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:min-w-4xl rounded-sm overflow-y-auto max-h-[90vh]">
        <DialogHeader className="px-1">
          <DialogTitle className="sr-only">
            Quick View: {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-black text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                -{discountPercent}%
              </div>
            )}
          </div>

          <div className="flex flex-col h-full">
            <div className="mb-4">
              {isLoading ? (
                <Skeleton className="h-4 w-20 mb-2" />
              ) : (
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {product.brand}
                </div>
              )}

              <h2 className="text-xl font-semibold text-foreground mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-yellow-500">
                  <Star className="fill-current w-4 h-4" />
                  <span className="ml-1 text-sm font-medium text-foreground">
                    {fullDetails?.rating || "4.8"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({fullDetails?.reviewCount || 0} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3 pb-4 border-b border-border">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(finalPrice)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > finalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {product.variantTypes &&
                  product.variantTypes.map((variantType: VariantType) => {
                    const selectedId = selectedVariants[variantType.name];
                    const selectedOption = variantType.options.find(
                      (opt) => opt.id === selectedId
                    );

                    return (
                      <div key={variantType.name}>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium text-foreground">
                            {variantType.name}:{" "}
                            <span className="text-muted-foreground font-normal">
                              {selectedOption?.name}
                            </span>
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
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
                                  className={`
                                  relative h-9 w-9 rounded-full border-2 transition-all
                                  ${
                                    isSelected
                                      ? "border-foreground ring-1 ring-offset-2 ring-foreground"
                                      : "border-transparent hover:scale-110"
                                  }
                                  ${
                                    !option.inStock
                                      ? "opacity-40 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }
                                `}
                                  style={{ backgroundColor: option.color }}
                                  title={option.name}>
                                  {!option.inStock && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="h-px w-full -rotate-45 bg-foreground" />
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
                                className={`
                                min-w-12 px-3 py-1.5 text-sm rounded-md border transition-all
                                ${
                                  isSelected
                                    ? "border-foreground bg-foreground text-background font-medium"
                                    : "border-input bg-background text-foreground hover:border-foreground/50"
                                }
                                ${
                                  !option.inStock
                                    ? "opacity-50 cursor-not-allowed box-decoration-slice line-through"
                                    : ""
                                }
                              `}>
                                {option.name}
                                {option.priceModifier > 0 && (
                                  <span className="ml-1 text-[10px] opacity-80">
                                    (+${option.priceModifier})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <div className="mb-4">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    {currentStock.inStock ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          In Stock
                        </span>
                        {currentStock.stockCount < 10 &&
                          currentStock.stockCount > 0 && (
                            <span className="text-xs text-red-500 font-medium ml-2">
                              Only {currentStock.stockCount} left
                            </span>
                          )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          Out of Stock
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex items-center border border-input rounded-md h-11 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-9 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isLoading}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-9 rounded-none"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      !currentStock.inStock ||
                      (currentStock.stockCount > 0 &&
                        quantity >= currentStock.stockCount) ||
                      isLoading
                    }>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <AddToCartButton
                  mode="default"
                  product={product}
                  quantity={quantity}
                  price={finalPrice}
                  selectedVariants={selectedVariants}
                  disabled={!currentStock.inStock || isLoading}
                  isOutOfStock={!currentStock.inStock}
                />

                <Button
                  variant="outline"
                  size="icon"
                  className={`h-11 w-11 shrink-0 ${
                    isFavorite ? "border-red-200 bg-red-50 text-red-500" : ""
                  }`}
                  onClick={() => setIsFavorite(!isFavorite)}>
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href={`/products/${product.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4">
                View full product details
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
