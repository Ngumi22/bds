import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MinimalProductData } from "@/lib/product/product.types";
import { getProduct } from "@/lib/data/product-data";

export const useProductQuickView = (
  product: MinimalProductData | null,
  isOpen: boolean
) => {
  return useQuery({
    queryKey: ["product-quick-view", product?.slug],
    queryFn: () => getProduct(product!.slug),
    enabled: !!product?.slug && isOpen,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });
};
