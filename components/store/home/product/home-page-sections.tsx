"use client";

import { Brand, Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { categoryIcons } from "@/lib/constants";
import { useMemo } from "react";

import ProductCard from "./product-card";
import { ProductCarousel, ProductCarouselItem } from "./product-carousel";
import ProductGrid from "./product-grid";
import { PromotionalBanner } from "../promotion-sections/promotional-banner";
import { MinimalProductData } from "@/lib/product/product.types";

function buildCategoryDescendantsMap(categories: Category[]) {
  const childrenMap = new Map<string, string[]>();
  const descendantsMap = new Map<string, string[]>();

  for (const cat of categories) {
    if (cat.parentId) {
      if (!childrenMap.has(cat.parentId)) {
        childrenMap.set(cat.parentId, []);
      }
      childrenMap.get(cat.parentId)!.push(cat.id);
    }
  }

  function collectDescendants(id: string): string[] {
    const descendants = [id];
    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      descendants.push(...collectDescendants(childId));
    }
    return descendants;
  }

  for (const cat of categories) {
    descendantsMap.set(cat.id, collectDescendants(cat.id));
  }

  return descendantsMap;
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories?.length) {
    return null;
  }

  const topLevel = categories.filter((cat) => cat.parentId === null);
  const descendantsMap = buildCategoryDescendantsMap(categories);

  const getSubcategories = (categoryId: string) => {
    const subcategoryIds = descendantsMap.get(categoryId) || [];
    return subcategoryIds
      .map((subId) => categories.find((c) => c.id === subId))
      .filter(Boolean)
      .filter((cat) => cat?.parentId !== null) as Category[];
  };

  return (
    <section className="bg-white">
      <div className="sm:hidden flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 md:p-2 scrollbar-hide py-2">
        {topLevel.map((category) => {
          const Icon =
            categoryIcons[category.slug as keyof typeof categoryIcons] ||
            Smartphone;

          return (
            <Link
              key={category.id}
              href={`products?categories=${category.slug}`}
              className="flex flex-col items-center justify-center gap-2 p-2
                   w-24 h-16 shrink-0 snap-start
                   rounded-sm border border-border bg-card
                   text-center transition-all duration-300">
              <Icon className="h-7 w-7 text-gray-600 transition-transform duration-300 hover:scale-110" />
              <h2 className="text-xs font-medium text-foreground truncate w-full">
                {category.name}
              </h2>
            </Link>
          );
        })}
      </div>

      <div className="hidden sm:block w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topLevel.map((category) => {
            const Icon =
              categoryIcons[category.slug as keyof typeof categoryIcons] ||
              Smartphone;
            const subcategories = getSubcategories(category.id);

            return (
              <div
                key={category.id}
                className="flex flex-row rounded-xs border border-border bg-card py-2 px-3">
                <div className="flex w-[40%] shrink-0 items-center justify-center pr-2">
                  <div className="relative w-full h-32">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 20vw, (max-width: 1024px) 15vw, 10vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded">
                        <Icon className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-[60%] flex-col pl-2">
                  <h2 className="mb-1 text-lg font-semibold text-foreground">
                    {category.name}
                  </h2>

                  <nav className="mb-3 flex flex-col gap-1.5">
                    {subcategories.slice(0, 3).map((sub) => (
                      <Link
                        key={sub?.id}
                        href={`/category/${sub?.slug}`}
                        className="text-sm text-gray-700 hover:text-gray-500 transition-colors">
                        {sub?.name}
                      </Link>
                    ))}

                    {subcategories.length > 3 && (
                      <div className="flex w-full items-center justify-between">
                        <Link
                          key={subcategories[3]?.id}
                          href={`products?categories=${category.slug}&subCategories=${category.slug}`}
                          className="text-sm text-gray-700 hover:text-gray-500 transition-colors truncate mr-2">
                          {subcategories[3]?.name}
                        </Link>
                        {subcategories.length > 4 && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            +{subcategories.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </nav>

                  <div className="mt-auto">
                    <Link
                      href={`/products/${category.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-black hover:text-black/80 transition-colors">
                      All {category.name} <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoryProductsSection({
  category,
  products,
  categories,
}: {
  category: string;
  products: MinimalProductData[];
  categories: Category[];
}) {
  const descendantsMap = buildCategoryDescendantsMap(categories);

  const matchedCategory = categories.find(
    (cat) => cat.slug.toLowerCase() === category.toLowerCase()
  );
  if (!matchedCategory) return null;

  const descendantIds = descendantsMap.get(matchedCategory.id) || [
    matchedCategory.id,
  ];

  const filtered = products.filter((p) =>
    descendantIds.includes(p.category ?? "")
  );

  if (filtered.length === 0) return null;

  return (
    <ProductCarousel
      title={
        <div className="flex items-center">
          Shop {matchedCategory.name}
          <span className="ml-6 text-sm text-muted-foreground">
            {filtered.length} products
          </span>
        </div>
      }
      viewAllHref={`/products?category=${matchedCategory.slug}`}>
      {filtered.map((product) => (
        <ProductCarouselItem key={product.id}>
          <ProductCard product={product} />
        </ProductCarouselItem>
      ))}
    </ProductCarousel>
  );
}

export function TabbedProducts({
  featured,
  newArrivals,
}: {
  featured: MinimalProductData[];
  newArrivals: MinimalProductData[];
}) {
  return (
    <ProductGrid
      tabs={[
        {
          label: "Featured",
          products: featured,
        },
        {
          label: "Latest Products",
          products: newArrivals,
        },
      ]}
      tabPosition="left"
    />
  );
}

export function TabbedBrands({
  brands,
  products,
}: {
  brands: Brand[];
  products: MinimalProductData[];
}) {
  const tabs = brands.map((brand) => ({
    label: brand.name,
    products: products.filter((product) => product.brand === brand.id),
  }));

  return (
    <div>
      <ProductGrid tabs={tabs} tabPosition="center" />
    </div>
  );
}

export function BrandsSection({
  brands,
}: {
  brands: { slug: string; logo?: string }[];
}) {
  if (!brands?.length) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Browse by Brand</h2>
      <div className="flex items-center justify-center flex-wrap gap-4">
        {brands.map((brand) => (
          <a
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="aspect-square h-24 flex items-center justify-center">
            <Image
              src={brand.logo || "/bannerV5-img10.webp"}
              alt={brand.slug}
              height={100}
              width={100}
              className="w-auto h-auto"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

export function SpecialOfferCarousel({
  products,
}: {
  products: MinimalProductData[];
}) {
  const discountedProducts = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .map((product) => {
      const discountPercentage = Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      );
      return {
        ...product,
        discountPercentage,
      };
    })
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 5);

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-semibold text-foreground my-2">
        Special Offers
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {discountedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function DiscountedProducts({
  products,
}: {
  products: MinimalProductData[];
}) {
  const discountedProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product.originalPrice || product.originalPrice <= product.price) {
          return false;
        }
        const discountPercentage = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        );
        return discountPercentage >= 15;
      })
      .sort((a, b) => {
        const discountA =
          ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
        const discountB =
          ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
        return discountB - discountA;
      })
      .slice(0, 5);
  }, [products]);

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      title={
        <div className="md:flex items-center gap-4 my-auto">
          Hottest Sales & Discounts
          <span className="text-red-600 font-semibold">Up to 50% Off</span>
        </div>
      }
      viewAllHref="/products">
      {discountedProducts.map((product) => (
        <ProductCarouselItem key={product.id}>
          <ProductCard product={product} />
        </ProductCarouselItem>
      ))}
    </ProductCarousel>
  );
}

export function PromotionalSection() {
  return (
    <section className="w-full">
      <div
        className="
          grid
          grid-flow-col auto-cols-[80%] md:auto-cols-[60%] lg:auto-cols-[32%]
          gap-4 md:gap-6
          overflow-x-auto lg:overflow-visible
          scroll-smooth
          snap-x snap-mandatory lg:snap-none
          scrollbar-hide
          px-4 lg:px-0
        ">
        <PromotionalBanner
          title="Pre-Loved Laptops"
          description="Save big on certified refurbished laptops for work, school, and gaming."
          ctaText="Shop Deals"
          ctaLink="/products?category=laptops"
          imageSrc="/bannerV5-img10.webp"
          imageAlt="Refurbished laptops on sale"
          variant="primary"
          size="special"
          className="snap-start lg:snap-none"
        />

        <PromotionalBanner
          title="New Arrivals"
          description="Explore the newest laptops, smartphones, and accessories today."
          ctaText="Discover Now"
          ctaLink="/products?sort=newest"
          imageSrc="/bannerV5-img5.webp"
          imageAlt="New laptops and smartphones"
          variant="primary"
          size="special"
          className="snap-start lg:snap-none"
        />

        <PromotionalBanner
          title="Featured Products"
          description="Shop our handpicked bestsellers in laptops, phones, and more."
          ctaText="Explore Featured"
          ctaLink="/products?featured=true"
          imageSrc="/ipho.png"
          imageAlt="Featured tech gadgets"
          variant="primary"
          size="special"
          className="snap-start lg:snap-none"
        />
      </div>
    </section>
  );
}

export function PromotionalSection1() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PromotionalBanner
          title="Back to School"
          description="Affordable laptops, tablets, and accessories for students of every level."
          ctaText="Shop Student Deals"
          ctaLink="/products?collection=back-to-school"
          imageSrc="/lap.webp"
          imageAlt="Back to school laptops and student gadgets"
          variant="primary"
          size="special"
        />

        <PromotionalBanner
          title="Business & Work Laptops"
          description="Powerful laptops and printers built for productivity and performance."
          ctaText="Shop Business"
          ctaLink="/products?collection=business-laptops"
          imageSrc="/promo.webp"
          imageAlt="Business laptops and office printers"
          variant="secondary"
          size="special"
        />
      </div>
    </section>
  );
}

export function PromotionalSection2() {
  return (
    <section>
      <div className="hidden md:grid grid-rows-2 gap-4">
        <PromotionalBanner
          title="Back to School"
          description="Affordable laptops, tablets, and accessories for students of every level."
          ctaText="Shop Student Deals"
          ctaLink="/products?collection=back-to-school"
          imageSrc="/lap.webp"
          imageAlt="Back to school laptops and student gadgets"
          variant="primary"
          size="special"
        />

        <PromotionalBanner
          title="Work Laptops"
          description="Powerful laptops and printers built for productivity and performance."
          ctaText="Shop Business"
          ctaLink="/products?collection=business-laptops"
          imageSrc="/promo.webp"
          imageAlt="Business laptops and office printers"
          variant="secondary"
          size="special"
        />
      </div>
    </section>
  );
}
