import { Collection } from "@prisma/client";

export type CollectionWithProducts = Collection & {
  products: Array<{
    product: {
      id: string;
      name: string;
      slug: string;
      mainImage: string | null;
      price: number;
      isActive: boolean;
    };
  }>;
  _count?: {
    products: number;
    banners: number;
  };
};

export type CollectionsPageProps = {
  products: Array<{ id: string; name: string }>;
  collectionsData: CollectionWithProducts[];
};
