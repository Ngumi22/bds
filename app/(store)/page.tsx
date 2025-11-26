import { getAllBlogPosts } from "@/lib/actions/blog";
import { getAllCategories } from "@/lib/actions/categories";
import { getFlashSaleData } from "@/lib/actions/collections";
import { getAllHeroBanners } from "@/lib/data/hero-banner";
import {
  getBrandsWithProducts,
  getCollectionsWithProducts,
  getParentCategoriesWithProducts,
} from "@/lib/actions/products";

import { HeroCarousel } from "@/components/store/home/hero-section/carousel";
import {
  CategoriesSection,
  PromotionalSection,
  PromotionalSection1,
  PromotionalSection2,
} from "@/components/store/home/product/home-page-sections";
import FlashSaleClient from "@/components/shared/flash-sale";
import BlogSection from "@/components/store/blog/blog-section";
import BrandSection from "@/components/store/home/homepage-product-display/brand-section";
import CatSection from "@/components/store/home/homepage-product-display/cat.section";
import Collections from "@/components/store/home/homepage-product-display/colle";
import { ExitIntentPopup } from "@/components/store/product-page/exit-intent-popup";

export default async function Home() {
  const [
    slides,
    categories,
    flashSaleData,
    blogPosts,
    collections,
    categoriesWithSubs,
    brandsWithProducts,
  ] = await Promise.all([
    getAllHeroBanners(),
    getAllCategories(),
    getFlashSaleData(),
    getAllBlogPosts(),
    getCollectionsWithProducts(),
    getParentCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  const featuredCollections = collections?.slice(0, 4) || [];

  // 2. Render directly (No HomePageClient wrapper)
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
              collectionSlug={flashSaleData.collectionId}
            />
          )}

          <PromotionalSection />

          {categoriesWithSubs.map((categoryData) => (
            <CatSection key={categoryData.slug} category={categoryData} />
          ))}

          {brandsWithProducts && brandsWithProducts.length > 0 && (
            <BrandSection brandsWithProducts={brandsWithProducts} />
          )}

          <PromotionalSection />

          {featuredCollections.map((collection) => (
            <Collections
              key={collection.id}
              title={collection.name}
              products={collection.products}
            />
          ))}

          <PromotionalSection1 />
          <BlogSection blogPosts={blogPosts.posts} />
        </div>
      </div>
      <ExitIntentPopup />
    </main>
  );
}
