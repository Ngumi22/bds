"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  Package,
  CheckCircle2,
  Eye,
  Volume2,
  Battery,
  Mic,
  Bluetooth,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/form-helpers";
import AddToCartButton from "../home/product/add-to-cart";
import { MinimalProductData } from "@/lib/product/product.types";
import { CartAddOn, useCartStore } from "@/hooks/use-cart-store";

interface VariantOption {
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

interface ProductDetailsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockCount?: number;
    viewingNow?: number;
    sku: string;
    brand: string;
    category: string;
    collection?: string;
    shortDescription?: string;
    specifications: Record<string, string>;
    deliveryDate?: string;
    shipsIn?: string;
    offerEndsIn?: number;
    variantTypes?: VariantType[];
    features?: Array<{ icon: string; title: string; description: string }>;
    images?: string[];
  };
  onVariantChange?: (variants: Record<string, string>) => void;
}

const PROTECTION_PLAN_DATA: CartAddOn = {
  key: "protection-2yr",
  name: "2-Year Protection Plan",
  price: 2000,
  description: "Covers accidental damage and extends warranty",
};

const GIFT_WRAP_DATA: CartAddOn = {
  key: "gift-wrap",
  name: "Gift Wrap",
  price: 500,
  description: "Premium gift wrapping with personalized message",
};

export function ProductDetails({
  product,
  onVariantChange,
}: ProductDetailsProps) {
  const router = useRouter();
  const addProductToCart = useCartStore((s) => s.addProductToCart);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [protectionPlan, setProtectionPlan] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [timeLeft, setTimeLeft] = useState(product.offerEndsIn || 0);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    product.variantTypes?.forEach((type) => {
      const firstAvailable = type.options.find((opt) => opt.inStock);
      if (firstAvailable) {
        initial[type.name] = firstAvailable.id;
      }
    });
    return initial;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariants);
    }
  }, [selectedVariants, onVariantChange]);

  const variantAdjustedPrice = useMemo(() => {
    let price = product.price;
    product.variantTypes?.forEach((type) => {
      const selectedOption = type.options.find(
        (opt) => opt.id === selectedVariants[type.name]
      );
      if (selectedOption) {
        price += selectedOption.priceModifier;
      }
    });
    return price;
  }, [product.price, product.variantTypes, selectedVariants]);

  const activeAddOns = useMemo(() => {
    const addons: CartAddOn[] = [];
    if (protectionPlan) addons.push(PROTECTION_PLAN_DATA);
    if (giftWrap) addons.push(GIFT_WRAP_DATA);
    return addons;
  }, [protectionPlan, giftWrap]);

  const totalDisplayPrice = useMemo(() => {
    const addOnTotal = activeAddOns.reduce((sum, a) => sum + a.price, 0);
    return (variantAdjustedPrice + addOnTotal) * quantity;
  }, [variantAdjustedPrice, activeAddOns, quantity]);

  const currentStock = useMemo(() => {
    if (!product.variantTypes || product.variantTypes.length === 0) {
      return { inStock: product.inStock, stockCount: product.stockCount };
    }

    let minStock = Number.POSITIVE_INFINITY;
    let allInStock = true;

    product.variantTypes.forEach((type) => {
      const selectedOption = type.options.find(
        (opt) => opt.id === selectedVariants[type.name]
      );
      if (selectedOption) {
        if (!selectedOption.inStock) allInStock = false;
        if (selectedOption.stockCount < minStock)
          minStock = selectedOption.stockCount;
      }
    });

    return {
      inStock: allInStock,
      stockCount:
        minStock === Number.POSITIVE_INFINITY ? product.stockCount : minStock,
    };
  }, [
    product.variantTypes,
    product.inStock,
    product.stockCount,
    selectedVariants,
  ]);

  const minimalProduct: MinimalProductData = {
    id: product.id,
    name: product.name,
    price: variantAdjustedPrice,
    slug: product.slug,
    stockStatus: currentStock.inStock ? "IN_STOCK" : "OUT_OF_STOCK",
    hasVariants: !!product.variantTypes && product.variantTypes.length > 0,
    originalPrice: product.originalPrice ?? product.price,
    categoryId: product.category ?? "",
    isActive: true,
    mainImage: product.images?.[0] || "",
  };

  const handleBuyNow = () => {
    const result = addProductToCart(
      minimalProduct,
      quantity,
      selectedVariants,
      activeAddOns
    );

    if (result.success) {
      router.push("/checkout");
    }
  };

  const discount = product.originalPrice
    ? ((product.price / product.originalPrice) * 100).toFixed(0)
    : "0";

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { days, hours, mins, secs };
  };

  const time = formatTime(timeLeft);
  const topSpecs = Object.entries(product.specifications).slice(0, 5);

  return (
    <div className="flex w-full flex-col">
      {(product.brand || product.category) && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {product.brand && <span>{product.brand}</span>}
          {product.brand && product.category && <span>•</span>}
          {product.category && <span>{product.category}</span>}
        </div>
      )}

      <h1 className="mb-3 text-xl font-semibold leading-tight text-foreground sm:text-2xl text-balance">
        {product.name}
      </h1>

      {product.rating && product.reviewCount && (
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-foreground text-foreground"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount} reviews)
          </span>
        </div>
      )}

      {product.viewingNow && (
        <div className="mb-3 flex items-center gap-2 text-xs text-foreground">
          <Eye className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {product.viewingNow} people are viewing this now
          </span>
        </div>
      )}

      {product.shortDescription && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground text-pretty">
          {product.shortDescription}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
        <span className="text-2xl font-semibold text-foreground sm:text-3xl">
          {formatCurrency(variantAdjustedPrice)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-base text-muted-foreground line-through sm:text-lg">
              {formatCurrency(product.originalPrice)}
            </span>
            <span className="bg-foreground px-2 py-0.5 text-xs font-medium text-background">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {product.collection === "flash-sale" && timeLeft > 0 && (
        <div className="mb-4 border border-foreground bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Limited Time Offer Ends In:</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: "Days", value: time.days },
              { label: "Hours", value: time.hours },
              { label: "Mins", value: time.mins },
              { label: "Secs", value: time.secs },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-muted p-1.5 text-center sm:p-2">
                <div className="text-base font-semibold text-foreground sm:text-lg">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {product.variantTypes && product.variantTypes.length > 0 && (
        <div className="mb-4 space-y-4">
          {product.variantTypes.map((variantType) => {
            const selectedOption = variantType.options.find(
              (opt) => opt.id === selectedVariants[variantType.name]
            );
            return (
              <div key={variantType.name}>
                <label className="mb-2 block text-xs font-medium text-foreground text-pretty">
                  {variantType.name}: {selectedOption?.name}
                  {selectedOption && selectedOption.priceModifier > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      +${selectedOption.priceModifier.toFixed(2)}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantType.options.map((option) => {
                    const isSelected =
                      selectedVariants[variantType.name] === option.id;

                    const ButtonContent = (
                      <>
                        <span className="whitespace-nowrap">
                          {option.name}
                          {option.priceModifier > 0 && (
                            <span className="ml-1">
                              +{formatCurrency(option.priceModifier)}
                            </span>
                          )}
                        </span>
                      </>
                    );

                    const commonClasses = `relative transition-all ${
                      isSelected ? "border-foreground" : "border-border"
                    } ${
                      !option.inStock
                        ? "cursor-not-allowed opacity-40"
                        : "hover:border-muted-foreground"
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
                          className={`${commonClasses} h-9 w-9 shrink-0 border-2 sm:h-10 sm:w-10`}
                          style={{ backgroundColor: option.color }}
                          title={`${option.name}${
                            option.priceModifier > 0
                              ? ` +${formatCurrency(option.priceModifier)}`
                              : ""
                          }`}>
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white ring-1 ring-black/20" />
                            </div>
                          )}
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
                          className={`${commonClasses} border px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 ${
                            isSelected
                              ? "bg-foreground text-background"
                              : "bg-background text-foreground"
                          } ${!option.inStock ? "line-through" : ""}`}>
                          {ButtonContent}
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

      <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
        {currentStock.inStock ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              In Stock
            </span>
            {currentStock.stockCount && currentStock.stockCount <= 15 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Only {currentStock.stockCount} left!
              </span>
            )}
          </>
        ) : (
          <span className="text-xs font-medium text-destructive">
            Out of Stock
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          SKU: {product.sku}
        </span>
      </div>

      {(product.deliveryDate || product.shipsIn) && (
        <div className="mb-6 space-y-2 border border-border bg-card p-3">
          {product.deliveryDate && (
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3.5 w-3.5 text-foreground" />
              <span className="text-foreground">
                <span className="font-medium">
                  Delivered by {product.deliveryDate}
                </span>
              </span>
            </div>
          )}
          {product.shipsIn && (
            <div className="flex items-center gap-2 text-xs">
              <Package className="h-3.5 w-3.5 text-foreground" />
              <span className="text-foreground">
                <span className="font-medium">Ships in {product.shipsIn}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {product.features && product.features.length > 0 && (
        <div className="mb-6 border-y border-border py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
            Key Features
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {product.features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || CheckCircle2;
              return (
                <div key={index} className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <div className="mb-6 border-b border-border pb-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Key Specifications
            </h3>
            <div className="space-y-2">
              {topSpecs.map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-foreground">
          Quantity
        </label>
        <div className="flex w-32 items-center border border-border">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="flex-1 text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            onClick={() => setQuantity(quantity + 1)}
            disabled={
              !currentStock.inStock ||
              (!!currentStock.stockCount && quantity >= currentStock.stockCount)
            }>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-2 border border-border bg-card p-3">
        <label className="flex items-start gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={protectionPlan}
            onChange={(e) => setProtectionPlan(e.target.checked)}
          />
          <div>
            <span className="font-medium text-foreground">
              {PROTECTION_PLAN_DATA.name}
            </span>
            <span className="ml-2 text-muted-foreground">
              +{formatCurrency(PROTECTION_PLAN_DATA.price)}
            </span>
            <p className="mt-0.5 text-muted-foreground">
              {PROTECTION_PLAN_DATA.description}
            </p>
          </div>
        </label>
        <label className="flex items-start gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={giftWrap}
            onChange={(e) => setGiftWrap(e.target.checked)}
          />
          <div>
            <span className="font-medium text-foreground">
              {GIFT_WRAP_DATA.name}
            </span>
            <span className="ml-2 text-muted-foreground">
              +{formatCurrency(GIFT_WRAP_DATA.price)}
            </span>
            <p className="mt-0.5 text-muted-foreground">
              {GIFT_WRAP_DATA.description}
            </p>
          </div>
        </label>
      </div>

      {(protectionPlan || giftWrap || quantity > 1) && (
        <div className="mb-4 border border-border bg-card p-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Item price ({quantity}x)
              </span>
              <span className="text-foreground">
                {formatCurrency(variantAdjustedPrice * quantity)}
              </span>
            </div>
            {protectionPlan && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {PROTECTION_PLAN_DATA.name} ({quantity}x)
                </span>
                <span className="text-foreground">
                  +{formatCurrency(PROTECTION_PLAN_DATA.price * quantity)}
                </span>
              </div>
            )}
            {giftWrap && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {GIFT_WRAP_DATA.name} ({quantity}x)
                </span>
                <span className="text-foreground">
                  +{formatCurrency(GIFT_WRAP_DATA.price * quantity)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                {formatCurrency(totalDisplayPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 sm:mb-6 sm:gap-3">
        <AddToCartButton
          mode="default"
          product={minimalProduct}
          quantity={quantity}
          price={variantAdjustedPrice}
          selectedVariants={selectedVariants}
          // @ts-ignore - Assuming AddToCartButton will be updated to accept addOns
          addOns={activeAddOns}
          disabled={!currentStock.inStock}
          isOutOfStock={!currentStock.inStock}
          className="flex-1 text-xs font-medium sm:text-sm"
        />

        <Button
          size="lg"
          variant="outline"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`shrink-0 ${isFavorite ? "border-foreground" : ""}`}>
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              isFavorite ? "fill-foreground" : ""
            }`}
          />
        </Button>
        <Button size="lg" variant="outline" className="shrink-0 bg-transparent">
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        className="mb-4 w-full bg-transparent text-xs font-medium sm:mb-6 sm:text-sm"
        size="lg"
        onClick={handleBuyNow}
        disabled={!currentStock.inStock}>
        Buy Now
      </Button>

      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">Free Shipping</p>
            <p className="text-xs text-muted-foreground">
              On orders over Ksh 70,000
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">
              30-Day Returns
            </p>
            <p className="text-xs text-muted-foreground">Easy return policy</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">
              1-Year Warranty
            </p>
            <p className="text-xs text-muted-foreground">
              Manufacturer warranty included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconMap: Record<string, any> = {
  volume: Volume2,
  battery: Battery,
  mic: Mic,
  bluetooth: Bluetooth,
};
