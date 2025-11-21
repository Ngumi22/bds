"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Star,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  Volume2,
  Battery,
  Mic,
  Bluetooth,
  AlertCircle,
  Eye,
  Clock,
  Truck,
  Package,
  Share2,
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

// --- Constants (Matches your Product Page Logic) ---
const PROTECTION_PLAN_DATA = {
  name: "2-Year Protection Plan",
  price: 29.99,
  description: "Coverage for drops, spills & breakdowns",
};

const GIFT_WRAP_DATA = {
  name: "Premium Gift Wrapping",
  price: 5.0,
  description: "Elegant wrapping with personalized card",
};

const iconMap: Record<string, any> = {
  volume: Volume2,
  battery: Battery,
  mic: Mic,
  bluetooth: Bluetooth,
};

// --- Helper for Flash Sale Timer ---
function calculateTimeLeft(endDate: Date | string | null) {
  if (!endDate) return { days: 0, hours: 0, mins: 0, secs: 0, total: 0 };
  const total = Date.parse(endDate.toString()) - Date.now();
  if (total <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, total: 0 };

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    mins: Math.floor((total / 1000 / 60) % 60),
    secs: Math.floor((total / 1000) % 60),
    total,
  };
}

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

  // Merge initial data with full details
  const product = useMemo(() => {
    if (!initialProduct) return null;
    return { ...initialProduct, ...fullDetails };
  }, [initialProduct, fullDetails]);

  // --- State ---
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [protectionPlan, setProtectionPlan] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // --- Effects ---

  // Reset state when product changes/opens
  useEffect(() => {
    if (open && fullDetails?.variantTypes) {
      const initial: Record<string, string> = {};
      fullDetails.variantTypes.forEach((type: VariantType) => {
        const firstAvailable = type.options.find((opt) => opt.inStock);
        if (firstAvailable) initial[type.name] = firstAvailable.id;
      });
      setSelectedVariants(initial);
      setQuantity(1);
      setProtectionPlan(false);
      setGiftWrap(false);
    }
  }, [fullDetails, open]);

  // Flash Sale Timer Logic
  useEffect(() => {
    if (!product?.offerEndsIn && product?.collection !== "flash-sale") return;

    // Use offerEndsIn (days) to calculate a mock end date if no specific date exists
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (product.offerEndsIn || 1));

    const timer = setInterval(() => {
      const t = calculateTimeLeft(endDate);
      setTime(t);
      setTimeLeft(t.total);
    }, 1000);

    return () => clearInterval(timer);
  }, [product]);

  // --- Derived State (Calculations) ---

  const currentStock = useMemo(() => {
    if (!product) return { inStock: false, stockCount: 0 };
    if (!product.variantTypes || product.variantTypes.length === 0) {
      return {
        inStock: product.inStock ?? true,
        stockCount: product.stockCount || 100,
      };
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

  const variantAdjustedPrice = useMemo(() => {
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

  const totalDisplayPrice = useMemo(() => {
    let total = variantAdjustedPrice * quantity;
    if (protectionPlan) total += PROTECTION_PLAN_DATA.price * quantity;
    if (giftWrap) total += GIFT_WRAP_DATA.price * quantity;
    return total;
  }, [variantAdjustedPrice, quantity, protectionPlan, giftWrap]);

  const discount =
    product?.originalPrice && variantAdjustedPrice < product.originalPrice
      ? Math.round(
          ((product.originalPrice - variantAdjustedPrice) /
            product.originalPrice) *
            100
        )
      : 0;

  const topSpecs = useMemo(() => {
    if (!product?.specifications) return [];
    return Object.entries(product.specifications).slice(0, 5);
  }, [product?.specifications]);

  const activeAddOns = useMemo(() => {
    const addons = [];
    if (protectionPlan) addons.push(PROTECTION_PLAN_DATA);
    if (giftWrap) addons.push(GIFT_WRAP_DATA);
    return addons;
  }, [protectionPlan, giftWrap]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:min-w-[1000px] rounded-lg overflow-y-auto max-h-[90vh] p-0 gap-0 md:overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick View: {product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 relative">
            <div className="relative aspect-square w-full max-w-md rounded-xl overflow-hidden bg-white shadow-sm">
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-foreground text-background px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                  -{discount}%
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details (Your Reference Component) */}
          <div className="w-full md:w-1/2 p-6 md:p-8 md:overflow-y-auto max-h-[90vh]">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col">
                {(product.brand || product.category) && (
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {product.brand && <span>{product.brand}</span>}
                    {product.brand && product.category && <span>•</span>}
                    {product.category && <span>{product.category}</span>}
                  </div>
                )}

                <Link
                  href={`/products/${product.slug}`}
                  className="text-base text-muted-foreground mb-3 leading-tight text-balance">
                  {product.name}
                </Link>

                {product.rating !== undefined && (
                  <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                            i < Math.floor(product.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-100 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {product.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                {product.shortDescription && (
                  <p className="mb-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                    {product.shortDescription}
                  </p>
                )}

                <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="text-base font-semibold text-foreground">
                    {formatCurrency(variantAdjustedPrice)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > variantAdjustedPrice && (
                      <>
                        <span className="text-base text-muted-foreground line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                        <span className="bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 rounded-sm">
                          SAVE {discount}%
                        </span>
                      </>
                    )}
                </div>

                {product.variantTypes && product.variantTypes.length > 0 && (
                  <div className="mb-2 space-y-5">
                    {product.variantTypes.map((variantType: VariantType) => {
                      const selectedOption = variantType.options.find(
                        (opt) => opt.id === selectedVariants[variantType.name]
                      );
                      return (
                        <div key={variantType.name}>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase text-foreground tracking-wide">
                              {variantType.name}:{" "}
                              <span className="text-muted-foreground font-normal normal-case">
                                {selectedOption?.name}
                              </span>
                            </label>
                            {selectedOption &&
                              selectedOption.priceModifier > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +
                                  {formatCurrency(selectedOption.priceModifier)}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {variantType.options.map((option) => {
                              const isSelected =
                                selectedVariants[variantType.name] ===
                                option.id;

                              const commonClasses = `relative transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none ${
                                isSelected
                                  ? "border-foreground ring-1 ring-foreground ring-offset-1"
                                  : "border-border hover:border-muted-foreground/50"
                              } ${
                                !option.inStock
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`;

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
                                    className={`${commonClasses} h-9 w-9 shrink-0 border-2 rounded-full sm:h-10 sm:w-10`}
                                    style={{ backgroundColor: option.color }}
                                    title={`${option.name}${
                                      option.priceModifier > 0
                                        ? ` +${formatCurrency(
                                            option.priceModifier
                                          )}`
                                        : ""
                                    }`}>
                                    {!option.inStock && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-px w-full rotate-45 bg-foreground" />
                                      </div>
                                    )}
                                  </button>
                                );
                              } else {
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
                                    className={`${commonClasses} border px-3 py-1.5 text-xs font-medium rounded-md sm:px-4 sm:py-2 bg-background text-foreground ${
                                      !option.inStock
                                        ? "line-through decoration-muted-foreground"
                                        : ""
                                    }`}>
                                    <span className="whitespace-nowrap">
                                      {option.name}
                                      {option.priceModifier > 0 && (
                                        <span className="ml-1 opacity-75">
                                          +
                                          {formatCurrency(option.priceModifier)}
                                        </span>
                                      )}
                                    </span>
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mb-2 flex flex-wrap items-center gap-3 sm:gap-4 p-3 bg-muted/30 rounded-md border border-border/40">
                  {currentStock.inStock ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wide">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        In Stock
                      </span>
                      {currentStock.stockCount &&
                        currentStock.stockCount <= 15 && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Only {currentStock.stockCount} left!
                          </span>
                        )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wide">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Out of Stock
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="mb-2 border-y border-border py-3">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((feature: any, index: number) => {
                        const Icon = iconMap[feature.icon] || CheckCircle2;
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-muted p-1">
                              <Icon className="h-3.5 w-3.5 text-foreground" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {topSpecs.length > 0 && (
                  <div className="mb-4 border-b border-border pb-3">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground">
                      Specifications
                    </h3>
                    <div className="grid gap-2">
                      {topSpecs.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium text-foreground text-right">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-foreground">
                    Quantity
                  </label>
                  <div className="flex w-32 items-center border border-input rounded-md">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-none hover:bg-transparent"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="flex-1 text-center text-sm font-medium tabular-nums">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-none hover:bg-transparent"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={
                        !currentStock.inStock ||
                        (!!currentStock.stockCount &&
                          quantity >= currentStock.stockCount)
                      }>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="mb-2 space-y-3 bg-muted/20 p-4 rounded-lg border border-border/50">
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-foreground focus:ring-offset-0 focus:ring-1 focus:ring-foreground cursor-pointer accent-foreground"
                      checked={protectionPlan}
                      onChange={(e) => setProtectionPlan(e.target.checked)}
                    />
                    <div className="grid gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {PROTECTION_PLAN_DATA.name}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                          +{formatCurrency(PROTECTION_PLAN_DATA.price)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {PROTECTION_PLAN_DATA.description}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-foreground focus:ring-offset-0 focus:ring-1 focus:ring-foreground cursor-pointer accent-foreground"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                    />
                    <div className="grid gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {GIFT_WRAP_DATA.name}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                          +{formatCurrency(GIFT_WRAP_DATA.price)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {GIFT_WRAP_DATA.description}
                      </p>
                    </div>
                  </label>
                </div>

                {(protectionPlan || giftWrap || quantity > 1) && (
                  <div className="mb-2 border border-border rounded-lg p-4 bg-card shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Item price ({quantity}x)
                        </span>
                        <span className="text-foreground">
                          {formatCurrency(variantAdjustedPrice * quantity)}
                        </span>
                      </div>
                      {protectionPlan && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {PROTECTION_PLAN_DATA.name} ({quantity}x)
                          </span>
                          <span className="text-foreground font-medium">
                            +
                            {formatCurrency(
                              PROTECTION_PLAN_DATA.price * quantity
                            )}
                          </span>
                        </div>
                      )}
                      {giftWrap && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {GIFT_WRAP_DATA.name} ({quantity}x)
                          </span>
                          <span className="text-foreground font-medium">
                            +{formatCurrency(GIFT_WRAP_DATA.price * quantity)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-3 mt-2 text-base font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">
                          {formatCurrency(totalDisplayPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mb-4">
                  <AddToCartButton
                    mode="default"
                    product={product}
                    quantity={quantity}
                    price={variantAdjustedPrice}
                    selectedVariants={selectedVariants}
                    // @ts-ignore
                    addOns={activeAddOns}
                    disabled={!currentStock.inStock}
                    isOutOfStock={!currentStock.inStock}
                    className="flex-1 h-12 text-sm font-bold uppercase tracking-wide"
                  />

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`h-12 w-12 shrink-0 border-2 ${
                      isFavorite
                        ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                        : "hover:bg-muted"
                    }`}>
                    <Heart
                      className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 shrink-0 border-2 hover:bg-muted">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  className="w-full h-12 font-bold uppercase tracking-wide border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background transition-all"
                  onClick={() => {
                    if (onAddToCart) {
                      const cartItem = {
                        productId: product.slug,
                        productName: product.name,
                        basePrice: product.price,
                        selectedVariants: selectedVariants,
                        finalPrice: variantAdjustedPrice,
                        quantity: quantity,
                        totalPrice: totalDisplayPrice,
                        image: product.mainImage,
                        addOns: activeAddOns,
                      };
                      onAddToCart(cartItem);
                    }
                  }}
                  disabled={!currentStock.inStock}>
                  Buy Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
