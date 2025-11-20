"use client";
import { lazy } from "react";
import { BlogPost, Category } from "@prisma/client";

import { HeroCarousel } from "@/components/store/home/hero-section/carousel";
import {
  CategoriesSection,
  PromotionalSection,
  PromotionalSection1,
  PromotionalSection2,
} from "@/components/store/home/product/home-page-sections";
import {
  CategoryWithDiscountedProducts,
  CollectionWithProducts,
  ParentCategoryWithSubCategoriesData,
} from "@/lib/actions/products";
import { MinimalProductData } from "@/lib/product/product.types";
import CollectionProducts from "@/components/store/home/homepage-product-display/collection";
import CategoriesProducts from "@/components/store/home/homepage-product-display/categories";
import CategorySection from "@/components/store/home/homepage-product-display/category-sub";
import HomeBrandSection, {
  BrandWithProducts,
} from "@/components/store/home/homepage-product-display/brand-sections";
import CollectionsSection from "@/components/store/home/homepage-product-display/collections";
import { PromoBanner } from "@/components/shared/promo-banner";
import { ExitIntentPopup } from "@/components/store/product-page/exit-intent-popup";
import { ProductSection } from "@/components/shared/product-section";
import CatSection from "@/components/store/home/homepage-product-display/cat.section";
import BrandSection from "@/components/store/home/homepage-product-display/brand-section";
import Colle from "@/components/store/home/homepage-product-display/colle";

const FlashSaleClient = lazy(
  () => import("@/components/store/home/promotion-sections/flash-sale")
);

const BlogSection = lazy(
  () => import("@/components/store/home/promotion-sections/blog-section")
);

interface FlashSaleData {
  products: MinimalProductData[];
  saleEndDate: Date;
  collectionName: string;
  collectionSlug?: string;
  collectionId: string;
}

interface HomePageClientProps {
  initialFlashSaleData: FlashSaleData | null;
}

interface HomePageClientProps {
  initialProducts: MinimalProductData[];
  initialFeatured: MinimalProductData[];
  initialNewArrivals: MinimalProductData[];
  initialCategories: Category[];
  initialFlashSaleData: FlashSaleData | null;
  blogPosts: BlogPost[];
  collections: CollectionWithProducts[];
  slides: any;
  collectionsData: any;
  initialCategoriesWithProducts: CategoryWithDiscountedProducts[];
  featuredCollections: CollectionWithProducts[];
  featuredCategories: CategoryWithDiscountedProducts[];
  categoriesWithSubs: ParentCategoryWithSubCategoriesData[];
  brandsWithProducts: BrandWithProducts[];
}

export default function HomePageClient({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
  initialFlashSaleData,
  blogPosts,
  collections,
  collectionsData,
  slides,
  initialCategoriesWithProducts,
  featuredCollections,
  categoriesWithSubs,
  brandsWithProducts,
}: HomePageClientProps) {
  const products = initialProducts;
  const featured = initialFeatured;
  const newProducts = initialNewArrivals;
  const categories = initialCategories;
  const flashSaleData = initialFlashSaleData;
  const categoriesWithProducts = initialCategoriesWithProducts;
  const topLevelCategories = categories.filter((cat) => !cat.parentId);

  if (!products || !featured || !newProducts || !categories) {
    return <div>Error loading data</div>;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 md:mt-4">
        <div className="md:px-6 flex gap-4">
          <div className="h-full w-full xl:w-2/3">
            <HeroCarousel slides={slides} />
          </div>
          <div className="hidden xl:block h-full w-1/3">
            <PromotionalSection2 />
          </div>
        </div>
        <div className="md:px-8 md:py-4 space-y-4">
          <CategoriesSection categories={categories} />
          {flashSaleData && (
            <FlashSaleClient
              products={flashSaleData.products}
              saleEndDate={flashSaleData.saleEndDate}
              collectionName={flashSaleData.collectionName}
              collectionId={flashSaleData.collectionId}
              collectionSlug={flashSaleData.collectionSlug}
            />
          )}
          {categoriesWithSubs.map((categoryData) => (
            <CatSection key={categoryData.slug} category={categoryData} />
          ))}

          {brandsWithProducts && brandsWithProducts.length > 0 && (
            <BrandSection brandsWithProducts={brandsWithProducts} />
          )}

          {featuredCollections.map((collection) => (
            <Colle
              key={collection.id}
              title={collection.name}
              products={collection.products}
            />
          ))}

          <PromotionalSection />

          {/* {categoriesWithSubs.map((categoryData) => (
            <CategorySection
              key={categoryData.slug}
              categoriesWithSubs={categoryData}
            />
          ))}
          <PromotionalSection />
          {brandsWithProducts && brandsWithProducts.length > 0 && (
            <HomeBrandSection brandsWithProducts={brandsWithProducts} />
          )}
          {featuredCollections.map((collection) => (
            <CollectionProducts
              key={collection.id}
              title={collection.name}
              products={collection.products}
            />
          ))}
          {categoriesWithProducts &&
            categoriesWithProducts.length > 0 &&
            categoriesWithProducts.map((category) => (
              <CategoriesProducts
                key={category.id}
                title={category.name}
                products={category.products}
                promoBanner={
                  <PromoBanner
                    title={`${category.name} Offers!`}
                    description={`Huge Savings on ${category.name}`}
                    image={category.image}
                    buttonText="Explore Deals"
                    backgroundColor="bg-gray-200"
                  />
                }
                promoBannerPosition="right"
              />
            ))}
          {collections && collections.length > 0 && (
            <CollectionsSection collections={collections} />
          )} */}
          <PromotionalSection1 />
          <BlogSection blogPosts={blogPosts} />
        </div>
      </div>
      <ExitIntentPopup />
    </main>
  );
}
