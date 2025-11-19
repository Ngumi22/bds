"use client";
import { useState } from "react";
import { ImageGallery } from "./image-gallery";
import { ProductDetails } from "./product-details";
import { ProductTabs } from "./product-tabs";
import { Breadcrumb } from "./breadcrumb";
import { StickyAddToCart } from "./sticky-add-to-cart";
import { RecommendedProducts } from "./recommended-products";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import { RecentlyViewed } from "./recently-viewed";
import { TrustBadges } from "./trust-badges";
import { SocialProof } from "./social-proof";
import { FreeShippingBar } from "./free-shipping-bar";

interface VariantOption {
  id: string;
  name: string;
  color?: string;
  inStock: boolean;
  stockCount: number;
  priceModifier: number;
}

interface VariantType {
  name: string;
  options: VariantOption[];
}

export interface ProductPageProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockCount: number;
    viewingNow: number;
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

    slug: string;
    description: string;
    images: string[];
    videoUrl?: string;
    shipping?: {
      freeShipping: boolean;
      estimatedDays: number;
      returnPolicy?: string;
    };
    reviews: Array<{
      id: string;
      author: string;
      rating: number;
      date: string;
      title: string;
      content: string;
      verified: boolean;
    }>;
    guarantee?: string;
    recentPurchases: string[];
  };
  frequentlyBoughtData?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  recommendedProducts?: Array<{
    id: string;
    name: string;
    price: number;
    rating: number;
    image: string;
  }>;
  recentlyViewedProducts?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
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
  bundleProducts: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  currentVariantPrice?: number;
  selectedVariants?: Record<string, string>;
}

export default function ProductPage({
  product,
  frequentlyBoughtData = [],
  recommendedProducts = [],
  recentlyViewedProducts = [],
}: ProductPageProps) {
  const [currentVariantPrice, setCurrentVariantPrice] = useState(product.price);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  const calculateVariantPrice = (variants: Record<string, string>) => {
    let price = product.price;
    product.variantTypes?.forEach((type: VariantType) => {
      const selectedOption = type.options.find(
        (opt) => opt.id === variants[type.name]
      );
      if (selectedOption) {
        price += selectedOption.priceModifier;
      }
    });
    return price;
  };

  const handleVariantChange = (variants: Record<string, string>) => {
    setSelectedVariants(variants);
    setCurrentVariantPrice(calculateVariantPrice(variants));
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    {
      label: product.category || "Category",
      href: `/${product.category?.toLowerCase() || "category"}`,
    },
    {
      label: product.brand || "Brand",
      href: `/${product.category?.toLowerCase() || "category"}/${
        product.brand?.toLowerCase() || "brand"
      }`,
    },
    { label: product.name, href: "#" },
  ];
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {product.shipping?.freeShipping && (
        <FreeShippingBar currentTotal={currentVariantPrice} threshold={50} />
      )}

      <div className="mx-auto w-full max-w-full px-3 py-4 sm:px- sm:py-3 lg:px-4">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}

        {(product.viewingNow || product.recentPurchases) && (
          <SocialProof
            viewingNow={product.viewingNow || 0}
            recentPurchases={product.recentPurchases || []}
          />
        )}

        <TrustBadges />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {product.images && product.images.length > 0 && (
            <ImageGallery
              images={product.images}
              productName={product.name}
              videoUrl={product.videoUrl}
            />
          )}
          <ProductDetails
            product={product}
            onVariantChange={handleVariantChange}
          />
        </div>

        {frequentlyBoughtData && frequentlyBoughtData.length > 0 && (
          <FrequentlyBoughtTogether
            mainProduct={product}
            bundleProducts={frequentlyBoughtData}
            currentVariantPrice={currentVariantPrice}
            selectedVariants={selectedVariants}
          />
        )}

        {/* Tabs Section */}
        <div className="mt-8 sm:mt-12">
          <ProductTabs
            description={product.description}
            reviews={product.reviews}
            shipping={product.shipping}
            reviewCount={product.reviewCount}
            rating={product.rating}
            features={product.features}
            guarantee={product.guarantee}
            specifications={product.specifications}
          />
        </div>

        {recommendedProducts && recommendedProducts.length > 0 && (
          <RecommendedProducts products={recommendedProducts} />
        )}

        {recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
          <RecentlyViewed products={recentlyViewedProducts} />
        )}
      </div>

      <StickyAddToCart
        product={product}
        currentVariantPrice={currentVariantPrice}
        selectedVariants={selectedVariants}
      />
    </div>
  );
}
