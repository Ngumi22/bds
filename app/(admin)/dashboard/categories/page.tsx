import { Skeleton } from "@/components/ui/skeleton";
import { getAllParentCategories } from "@/lib/data/categories";
import { Suspense } from "react";
import ClientBrandsPage from "./_components/page-client";

export default async function BrandsPage() {
  const categories = await getAllParentCategories();

  if (!categories) {
    <Skeleton />;
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <ClientBrandsPage categories={categories} />
    </Suspense>
  );
}
