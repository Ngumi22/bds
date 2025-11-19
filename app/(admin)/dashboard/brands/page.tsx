import ClientBrandsPage from "@/components/dashboard/brands/brand-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllBrands } from "@/lib/data/brands";
import { Suspense } from "react";

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <Suspense fallback={<Skeleton />}>
      <ClientBrandsPage brands={brands} />;
    </Suspense>
  );
}
