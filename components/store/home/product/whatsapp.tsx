"use client";

import { useRouter } from "next/navigation";
import { Phone, SlidersVertical, XCircle } from "lucide-react"; // Ensure icons are imported
import { whatsappIcon } from "@/components/icons";
import { WhatsappPhoneNumber } from "@/lib/constants";
import { MinimalProductData } from "@/lib/product/product.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickBuyProps {
  product: MinimalProductData;
  className?: string;
}

export default function QuickBuy({ product, className }: QuickBuyProps) {
  const router = useRouter();

  const hasRealVariants =
    product.hasVariants ||
    (product.colorVariants && product.colorVariants.length > 0);

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  let icon = whatsappIcon.icon;
  let label = "Quick Buy";
  let onClick = () => router.push(`https://wa.me/${WhatsappPhoneNumber}`);
  let disabled = false;
  let buttonClass = "";

  if (isOutOfStock) {
    icon = <XCircle size={20} />;
    label = "Out of stock";
    onClick = () => {};
    disabled = true;
    buttonClass =
      "opacity-50 cursor-not-allowed hover:bg-transparent text-red-400";
  } else if (hasRealVariants) {
    icon = <SlidersVertical size={20} />;
    label = "Select options";
    onClick = () => router.push(`/products/${product.slug}`);
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label={label}
            className={cn(
              "flex items-center justify-center w-full h-full text-white hover:bg-white/20 transition-colors",
              className
            )}>
            {whatsappIcon.icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
