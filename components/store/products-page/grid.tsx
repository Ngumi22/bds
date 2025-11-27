import { ProductCard } from "@/components/shared/product-card";
import { MinimalProductData } from "@/lib/product/product.types";

interface ProductsGridProps {
  products: MinimalProductData[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isLoaded={true} />
      ))}
    </div>
  );
}
