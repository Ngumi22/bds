import { Product } from "@prisma/client";

export type SpecificationType = "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";

export interface SpecificationDefinition {
  id: string;
  categoryId: string;
  key: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isActive: boolean;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithRelations extends Category {
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  specifications?: SpecificationDefinition[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  specifications: Omit<SpecificationDefinition, "id" | "categoryId">[];
}
