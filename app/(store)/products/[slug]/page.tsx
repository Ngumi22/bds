import ProductPage from "@/components/store/product-page/product-page";
import { getProduct } from "@/lib/data/product-data";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return "Product Not Found";
  }
  return <ProductPage product={product} />;
}
