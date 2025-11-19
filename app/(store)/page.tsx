import { getAllBlogPosts } from "@/lib/actions/blog";
import { getAllCategories } from "@/lib/actions/categories";
import {
  getCollectionsWithProductsData,
  getFlashSaleData,
} from "@/lib/actions/collections";
import { getAllHeroBanners } from "@/lib/data/hero-banner";
import HomePageClient from "./_components/client-page";
import {
  getBrandsWithProducts,
  getCollectionsWithProducts,
  getFeaturedProducts,
  getNewArrivals,
  getParentCategoriesWithProducts,
  getSpecialOffersData,
} from "@/lib/actions/products";
import { filterProducts } from "@/lib/product/fetchProducts";

export default async function Home() {
  const searchParams = {
    limit: 10,
  };

  const products = await filterProducts(searchParams);
  const slides = await getAllHeroBanners();

  const [
    featuredProducts,
    newProducts,
    categories,
    flashSaleData,
    blogPosts,
    collections,
    categoriesWithProducts,
    collectionsData,
    categoriesWithSubs,
    brandsWithProducts,
  ] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getAllCategories(),
    getFlashSaleData(),
    getAllBlogPosts(),
    getCollectionsWithProducts(),
    getSpecialOffersData(),
    getCollectionsWithProductsData(),
    getParentCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  const featuredCollections = collections?.slice(0, 4) || [];
  const featuredCategories = categoriesWithProducts?.slice(0, 4) || [];

  return (
    <HomePageClient
      initialProducts={products.products}
      initialFeatured={featuredProducts}
      initialNewArrivals={newProducts}
      initialCategories={categories}
      initialFlashSaleData={flashSaleData}
      initialCategoriesWithProducts={categoriesWithProducts}
      blogPosts={blogPosts.posts}
      collections={collections}
      slides={slides}
      collectionsData={collectionsData}
      featuredCollections={featuredCollections}
      featuredCategories={featuredCategories}
      categoriesWithSubs={categoriesWithSubs}
      brandsWithProducts={brandsWithProducts}
    />
  );
}
