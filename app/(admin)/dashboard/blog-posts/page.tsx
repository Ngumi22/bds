import ClientBlogPage from "@/components/dashboard/blog/blog-page";
import { getAllBlogCategories, getAllBlogPosts } from "@/lib/actions/blog";
import { requireAdmin } from "@/lib/guards";
import { filterProducts } from "@/lib/product/fetchProducts";

export default async function BlogPage() {
  const params = {
    limit: 5,
  };
  const blogCategories = await getAllBlogCategories();
  const posts = await getAllBlogPosts();
  const products = await filterProducts(params);
  const session = await requireAdmin();
  return (
    <ClientBlogPage
      initialCategories={blogCategories}
      initialPosts={posts.posts}
      products={products.products}
      user={{
        ...session.user,
        image: session.user.image ?? null,
        banned: session.user.banned ?? false,
        banReason: session.user.banReason ?? null,
        banExpires: session.user.banExpires ?? null,
      }}
    />
  );
}
