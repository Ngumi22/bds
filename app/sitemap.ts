import { getAllCategories } from "@/lib/actions/categories";
import { filterProducts } from "@/lib/product/fetchProducts";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const staticPaths = [
    "",
    "/products",
    "/about",
    "/contact",
    "/blog",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  }));

  const categories = await getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}?categories=${cat.slug}`,
    lastModified: new Date(cat.updatedAt ?? new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const products = await filterProducts({});
  const productUrls: MetadataRoute.Sitemap = products.products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
