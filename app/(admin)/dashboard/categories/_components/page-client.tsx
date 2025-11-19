"use client";

import { getCategoryColumns } from "@/components/dashboard/categories/category-columns";
import ClientCategoriesPage from "@/components/dashboard/categories/category-table";
import { Category } from "@prisma/client";

type BrandPageProps = {
  categories: Category[];
};

export default function ClientBrandsPage({ categories }: BrandPageProps) {
  const columns = getCategoryColumns(categories);

  return (
    <section>
      <ClientCategoriesPage categories={categories} CategoryColumns={columns} />
    </section>
  );
}
