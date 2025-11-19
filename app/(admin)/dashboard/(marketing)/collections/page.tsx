import { getAllCollections } from "@/lib/actions/collections";

import CollectionsPage from "./_components/collection-page";
import { searchProducts } from "@/lib/actions/product-filter";

export default async function CollectionPage() {
  const collections = await getAllCollections();
  const { products } = await searchProducts({});
  return <CollectionsPage products={products} collectionsData={collections} />;
}
