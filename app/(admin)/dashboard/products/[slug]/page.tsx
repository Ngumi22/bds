import { ProductImages } from "@/components/dashboard/product/product-detail/product-images";
import { ProductInfo } from "@/components/dashboard/product/product-detail/product-info";
import { ProductVariants } from "@/components/dashboard/product/product-detail/product-variants";
import { ProductSpecifications } from "@/components/dashboard/product/product-detail/product-specifications";
import { ProductFeatures } from "@/components/dashboard/product/product-detail/product-features";
import { ProductShipping } from "@/components/dashboard/product/product-detail/product-shipping";
import { ProductReviews } from "@/components/dashboard/product/product-detail/product-reviews";
import { ProductCategoryBrand } from "@/components/dashboard/product/product-detail/product-category-brand";
import { ProductCollections } from "@/components/dashboard/product/product-detail/product-collections";
import { ProductDiscounts } from "@/components/dashboard/product/product-detail/product-discounts";
import { ProductVideo } from "@/components/dashboard/product/product-detail/product-video";
import { ProductInventory } from "@/components/dashboard/product/product-detail/product-inventory";
import { ProductMetadata } from "@/components/dashboard/product/product-detail/product-metadata";
import { getProductFromDb } from "@/lib/data/product-data";
import { ProductHeader } from "@/components/dashboard/product/product-detail/product-header";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductFromDb(slug);

  if (!product) {
    return "Product Not Found";
  }

  return (
    <div className="min-h-screen bg-background">
      <ProductHeader product={product} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProductImages product={product} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ProductInfo product={product} />

            <ProductCategoryBrand product={product} />

            {product.videoUrl && <ProductVideo product={product} />}

            {product.hasVariants && <ProductVariants product={product} />}

            <ProductFeatures product={product} />
            <ProductSpecifications product={product} />
            <ProductShipping product={product} />

            {product.collections && product.collections.length > 0 && (
              <ProductCollections product={product} />
            )}

            {product.applicableDiscounts &&
              product.applicableDiscounts.length > 0 && (
                <ProductDiscounts product={product} />
              )}

            <ProductInventory product={product} />

            <ProductReviews product={product} />

            <ProductMetadata product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}
