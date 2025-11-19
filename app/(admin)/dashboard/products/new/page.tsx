import { getAllBrands } from "@/lib/data/brands";
import { getAllCategories } from "@/lib/data/categories";

import NewProductPage from "./_components/new-page";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const brands = await getAllBrands();
  const categories = await getAllCategories();

  return <NewProductPage brands={brands} categories={categories} />;
}
