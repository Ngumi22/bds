import { CollectionType, StockStatus } from "@prisma/client";

export interface ProductCollection {
  id: string;
  collection: {
    id: string;
    name: string;
    slug: string;
    collectionType: CollectionType;
    startsAt?: Date | null;
    endsAt?: Date | null;
  };
}

export interface MinimalProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  categoryId: string;
  mainImage: string;
  slug: string;
  stockStatus: StockStatus;
  hasVariants: boolean;
  isActive: boolean;
  collections?: ProductCollection[];
  colorVariants?: Array<{
    name: string;
    value: string | null;
    color: string | null;
  }>;
}

export function isFlashSaleActive(collection?: {
  collectionType?: string;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
}) {
  if (!collection || collection.collectionType !== "FLASH_SALE") return false;

  const now = new Date();
  const startsAt = collection.startsAt ? new Date(collection.startsAt) : null;
  const endsAt = collection.endsAt ? new Date(collection.endsAt) : null;

  if (!startsAt || !endsAt) return false;

  return now >= startsAt && now <= endsAt;
}

export function getActiveFlashSale(product: MinimalProductData) {
  if (!product.collections?.length) return null;

  const now = new Date();

  const active = product.collections.find((pc) => {
    const c = pc.collection;
    if (c.collectionType !== "FLASH_SALE") return false;
    if (!c.startsAt || !c.endsAt) return false;

    const startsAt = new Date(c.startsAt);
    const endsAt = new Date(c.endsAt);
    return now >= startsAt && now <= endsAt;
  });

  return active ? { ...active.collection } : null;
}
