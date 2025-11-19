import { getProductFromDb } from "@/lib/data/product-data";
import { getAllBrands } from "@/lib/data/brands";
import { getAllCategories } from "@/lib/data/categories";
import { ClientEditProductPage } from "./_component/ClientEditProductForm";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, brands, categories] = await Promise.all([
    getProductFromDb(slug),
    getAllBrands(),
    getAllCategories(),
  ]);

  if (!product) {
    throw new Error("Product not found");
  }

  return (
    <ClientEditProductPage
      initialData={product}
      brands={brands}
      categories={categories}
    />
  );
}
