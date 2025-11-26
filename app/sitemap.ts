import { getAllBlogPosts } from "@/lib/actions/blog";
import { getAllCategories } from "@/lib/actions/categories";
import { getAllCollections } from "@/lib/actions/collections";
import { filterProducts } from "@/lib/product/fetchProducts";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const categories = await getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}?categories=${cat.slug}`,
    lastModified: new Date(cat.updatedAt ?? new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collections = await getAllCollections();
  const collectionUrls: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date(collection.updatedAt ?? new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const products = await filterProducts({ limit: 10000 });
  const productUrls: MetadataRoute.Sitemap = products.products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt ?? prod.createdAt ?? new Date()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogPosts = await getAllBlogPosts();
  const blogUrls: MetadataRoute.Sitemap = blogPosts.posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.createdAt ?? new Date()),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryUrls,
    ...collectionUrls,
    ...productUrls,
    ...blogUrls,
  ];
}
