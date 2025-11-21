import { notFound } from "next/navigation";
import { Category } from "@prisma/client";
import { CollectionPageHeader } from "@/components/store/collections/collection-page-header";
import { FilterSortBar } from "@/components/store/collections/filter-sort-bar";
import { FilteredProductGrid } from "@/components/store/collections/filtered-product-grid";
import {
  getCollectionBySlug,
  getCollectionFilterData,
  getCollectionProducts,
  getCollectionsWithProducts,
} from "@/lib/actions/collections";
import { getAllCategories } from "@/lib/actions/categories";
import { getAllBrands } from "@/lib/actions/brands";

// 1. Update types to be Promises
interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    category?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    brands?: string;
    search?: string;
  }>;
}

export async function generateStaticParams() {
  const collections = await getCollectionsWithProducts();
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `${collection.name} Collection | Modern Ecommerce`,
    description:
      collection.description || `Browse our ${collection.name} collection`,
  };
}

export default async function CollectionPage(props: CollectionPageProps) {
  // 2. Await the params and searchParams before destructuring
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { slug } = params;
  const { category, sort, priceMin, priceMax, brands, search } = searchParams;

  const [collection, categories, rawAvailableBrands, collectionFilterData] =
    await Promise.all([
      getCollectionBySlug(slug),
      getAllCategories(),
      getAllBrands(),
      getCollectionFilterData(slug),
    ]);

  const availableBrands = rawAvailableBrands.map((brand: any) => ({
    ...brand,
    updatedAt: brand.updatedAt ?? new Date(),
  }));

  if (!collection) {
    notFound();
  }

  const brandSlugs = brands ? brands.split(",") : undefined;

  const filters = {
    collection: slug,
    category: category === "all" ? undefined : category,
    sort: sort,
    priceMin: priceMin ? Number.parseFloat(priceMin) : undefined,
    priceMax: priceMax ? Number.parseFloat(priceMax) : undefined,
    brands: brandSlugs,
    search: search,
    perPage: 12,
    offset: 0,
  };

  const { products, totalProducts } = await getCollectionProducts(filters);

  return (
    <div className="min-h-screen bg-background">
      <CollectionPageHeader collection={collection} />

      <div className="container mx-auto px-4 py-8">
        <FilterSortBar
          categories={categories}
          availableBrands={availableBrands}
          totalProducts={totalProducts}
          priceRange={collectionFilterData.priceRange}
          currentSearch={search}
        />

        <FilteredProductGrid
          products={products}
          totalProducts={totalProducts}
          categories={categories}
          filters={{
            category:
              category && category !== "all"
                ? categories.find((cat: Category) => cat.slug === category)
                : undefined,
            sort: filters.sort,
            minPrice: filters.priceMin,
            maxPrice: filters.priceMax,
            brands: filters.brands,
            search: filters.search,
          }}
        />
      </div>
    </div>
  );
}
