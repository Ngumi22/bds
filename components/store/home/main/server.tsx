import { getFeaturedProducts } from "@/lib/actions/products";
import { searchProducts } from "@/lib/actions/product-filter";
import HomeClient from "./page-component";

export default async function Home() {
  const [featuredProducts, laptopResult, phoneResult] = await Promise.all([
    getFeaturedProducts(),
    searchProducts({ category: "Laptops" }),
    searchProducts({ category: "Phones" }),
  ]);

  const laptopProducts =
    "products" in laptopResult ? laptopResult.products : [];
  const phoneProducts = "products" in phoneResult ? phoneResult.products : [];

  return (
    <HomeClient
      featuredProducts={featuredProducts}
      laptopProducts={laptopProducts}
      phoneProducts={phoneProducts}
    />
  );
}
