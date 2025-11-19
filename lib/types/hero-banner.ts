export interface HeroBanner {
  id: string;
  title: string;
  image: string;
  linkUrl?: string | null;
  tag: string;
  description: string;
  buttonText: string;
  collectionId?: string | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface HeroBannerFormValues {
  title: string;
  image: string;
  tag: string;
  description: string;
  buttonText: string;
  linkUrl?: string | null;
  collectionId?: string | null;
  isActive: boolean;
  order: number;
}

export interface HeroBannerWithRelations extends HeroBanner {
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
