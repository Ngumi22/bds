"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SlidersVertical } from "lucide-react";
import { whatsappIcon } from "@/components/icons";
import { WhatsappPhoneNumber } from "@/lib/constants";
import { MinimalProductData } from "@/lib/product/product.types";

interface QuickBuyProps {
  product: MinimalProductData;
}

export default function QuickBuy({ product }: QuickBuyProps) {
  const router = useRouter();

  const hasRealVariants =
    product.hasVariants ||
    (product.colorVariants && product.colorVariants.length > 0);

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  const handleAddToCart = () => {
    router.push(`https://wa.me/${WhatsappPhoneNumber}`);
  };

  if (hasRealVariants) {
    return (
      <Button
        className="text-gray-900 p-1   shadow-md transition ease-in-out delay-400 group-hover:-translate-x-3 hover:scale-110 duration-300"
        onClick={() => router.push(`/products/${product.slug}`)}>
        <SlidersVertical size={16} strokeWidth={1} />
      </Button>
    );
  }

  if (isOutOfStock) {
    return (
      <Button
        variant="secondary"
        disabled
        className="w-full flex items-center justify-center gap-2 opacity-70 cursor-not-allowed">
        Out of Stock
      </Button>
    );
  }

  return (
    <button
      className="text-gray-900 transition ease-in-out delay-400 group-hover:-translate-x-3 hover:scale-110 duration-300"
      onClick={handleAddToCart}>
      {whatsappIcon.icon}
    </button>
  );
}
