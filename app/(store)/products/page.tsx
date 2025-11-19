import { ProductsContent } from "@/components/store/products-page/content";
import { ProductsLoading } from "@/components/store/products-page/loading";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <div className="px-2 md:px-4 mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense fallback={<ProductsLoading />}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
