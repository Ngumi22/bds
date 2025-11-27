import { ProductsLoading } from "@/components/store/products-page/loading";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import Script from "next/script";
import { filterProducts } from "@/lib/product/fetchProducts";
import { ProductsContentWrapper } from "./_components/products-content-wrapper";

type Props = {
  params: Promise<{}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const INDEXABLE_PARAMS = [
  "categories",
  "subCategories",
  "brands",
  "collections",
  "ram",
  "processor",
];

type SortByField = "name" | "price" | "createdAt" | "popularity";
type SortOrder = "asc" | "desc";

function getString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function mapToProductParams(searchParams: Record<string, any>) {
  const rawSortBy = getString(searchParams.sortBy);
  const sortByValue = rawSortBy || "createdAt";

  return {
    ...searchParams,
    page: Number(getString(searchParams.page)) || 1,
    limit: 24,
    searchQuery: getString(searchParams.searchQuery),
    sortBy: sortByValue as SortByField,
    sortOrder: (getString(searchParams.sortOrder) as SortOrder) || "desc",
  };
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://bernzzdigitalsolutions.co.ke";

  const productParams = mapToProductParams(resolvedSearchParams);
  const { totalPages, currentPage } = await filterProducts(productParams);

  const isValidPage = currentPage > 0 && currentPage <= totalPages;
  const canonicalParams = new URLSearchParams();
  let titlePrefix = "All Products";

  for (const key of INDEXABLE_PARAMS) {
    const value = resolvedSearchParams[key];
    if (value && typeof value === "string" && value.length > 0) {
      canonicalParams.set(key, value);
      if (key === "categories") titlePrefix = `${value} Products`;
    }
  }

  if (isValidPage && currentPage > 1) {
    canonicalParams.set("page", String(currentPage));
  }

  canonicalParams.sort();
  const queryString = canonicalParams.toString();
  const canonicalUrl = queryString
    ? `${baseUrl}/products?${queryString}`
    : `${baseUrl}/products`;
  const title =
    currentPage > 1 ? `${titlePrefix} - Page ${currentPage}` : titlePrefix;
  const description = `Buy ${titlePrefix} in Kenya. Compare top brands, view specifications, and find the best prices with fast nationwide delivery and warranty.`;
  const keywords = [
    `${titlePrefix} Kenya`,
    `${titlePrefix} prices in Kenya`,
    `buy ${titlePrefix} Kenya`,
    `best ${titlePrefix} in Kenya`,
    "laptops Kenya",
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-KE": canonicalUrl,
      },
    },
    robots: {
      index: isValidPage,
      follow: isValidPage,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://bernzzdigitalsolutions.co.ke";

  const productParams = mapToProductParams(resolvedSearchParams);
  const initialProductsData = await filterProducts(productParams);

  const canonicalParams = new URLSearchParams();
  let titlePrefix = "All Products";

  for (const key of INDEXABLE_PARAMS) {
    const value = resolvedSearchParams[key];
    if (value && typeof value === "string" && value.length > 0) {
      canonicalParams.set(key, value);
      if (key === "categories") titlePrefix = `${value} Products`;
    }
  }

  const { currentPage, totalPages } = initialProductsData;
  if (currentPage > 1 && currentPage <= totalPages) {
    canonicalParams.set("page", String(currentPage));
  }

  canonicalParams.sort();
  const queryString = canonicalParams.toString();
  const canonicalUrl = queryString
    ? `${baseUrl}/products?${queryString}`
    : `${baseUrl}/products`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: titlePrefix,
    description: `Shop ${titlePrefix} in Kenya. Compare brands, specifications, and prices.`,
    url: canonicalUrl,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Bernzz Digital Solutions",
      url: baseUrl,
    },
    about: {
      "@type": "Thing",
      name: titlePrefix,
    },
    audience: {
      "@type": "PeopleAudience",
      geographicArea: {
        "@type": "Country",
        name: "Kenya",
      },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Where can I buy ${titlePrefix} in Kenya?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can buy ${titlePrefix} at ${baseUrl} with nationwide delivery, warranties, and competitive prices.`,
        },
      },
      {
        "@type": "Question",
        name: `Do you ship ${titlePrefix} across Kenya?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — we ship ${titlePrefix} across Kenya. Delivery times vary by location; check the product page for current shipping estimates.`,
        },
      },
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Bernzz Digital Solutions",
    url: baseUrl,
    address: { "@type": "PostalAddress", addressCountry: "KE" },
    sameAs: [
      "https://www.facebook.com/BDStechnologies",
      "https://www.instagram.com/bernzztechnologies",
      "https://x.com/Shiks_peters",
      "https://www.tiktok.com/@eunicepeters4",
    ],
  };

  const summaryHeading = `${titlePrefix} in Kenya`;
  const summaryParagraph = `Find the best ${titlePrefix} in Kenya — compare top brands, read specs, and find great deals with fast delivery and warranty. Use filters to narrow by brand, RAM, processor and price.`;

  return (
    <div className="px-2 md:px-4 mx-auto py-8">
      <Script
        id="ld-json-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Script
        id="ld-json-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="ld-json-localstore"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense fallback={<ProductsLoading />}>
          <ProductsContentWrapper
            searchParams={resolvedSearchParams}
            initialData={initialProductsData}
          />
        </Suspense>
      </div>
    </div>
  );
}
