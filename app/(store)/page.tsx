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
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Electronics & Gadgets in Kenya | Bernzz Digital Solutions",
  description:
    "Shop the best electronics, laptops, smartphones, home appliances, and accessories in Kenya. Fast delivery, genuine products, and unbeatable prices.",
  keywords: [
    "electronics Kenya",
    "laptops Kenya",
    "smartphones Kenya",
    "best tech store Kenya",
    "buy electronics online Kenya",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
    languages: {
      "en-KE": process.env.NEXT_PUBLIC_BASE_URL,
    },
  },
  openGraph: {
    title: "Bernzz Digital Solutions — Best Electronics & Tech in Kenya",
    description:
      "Kenya's trusted online tech store for laptops, phones, appliances, and accessories.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bernzz Digital Solutions — Best Electronics in Kenya",
    description: "Shop electronics, gadgets, and accessories in Kenya.",
  },
};

export default async function Home() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://bernzzdigitalsolutions.co.ke";

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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bernzz Digital Solutions",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bernzz Digital Solutions",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://www.facebook.com/BDStechnologies",
      "https://www.instagram.com/bernzztechnologies",
      "https://x.com/Shiks_peters",
      "https://www.tiktok.com/@eunicepeters4",
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Bernzz Digital Solutions",
    url: baseUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi",
      postalCode: "00100",
      addressCountry: "KE",
    },
    openingHours: "Mo-Su 09:00-20:00",
    telephone: "+254700000000",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Bernzz Digital Solutions deliver across Kenya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We deliver to all major towns in Kenya including Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret.",
        },
      },
      {
        "@type": "Question",
        name: "Are all products genuine?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All products sold on our store are 100% genuine and come with manufacturer warranty.",
        },
      },
      {
        "@type": "Question",
        name: "How long does delivery take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Deliveries within Nairobi take 1–24 hours, while deliveries outside Nairobi take 1–3 days depending on location.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="localbusiness-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="px-6 pt-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">
          Kenya’s Trusted Online Store for Electronics & Tech
        </h1>
        <p className="text-gray-700 text-sm mt-2">
          Discover laptops, smartphones, TVs, appliances, accessories, and more
          — all at unbeatable prices. We deliver anywhere in Kenya and guarantee
          genuine products with warranty.
        </p>
      </section>

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

          {brandsWithProducts?.length > 0 && (
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
