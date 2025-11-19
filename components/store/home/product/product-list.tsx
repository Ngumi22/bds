import { MinimalProductData } from "@/lib/product/product.types";
import ProductCard from "./product-card";

const ProductList = ({ products }: { products: MinimalProductData[] }) => {
  return (
    <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
