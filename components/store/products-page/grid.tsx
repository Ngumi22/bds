import { MinimalProductData } from "@/lib/product/product.types";
import ProductCard from "../home/product/product-card";

interface ProductsGridProps {
  products: MinimalProductData[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
