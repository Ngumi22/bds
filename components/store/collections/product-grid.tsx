import { ProductCard } from "@/components/shared/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

interface ProductGridProps {
  products: MinimalProductData[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isLoaded={true} />
      ))}
    </div>
  );
}
