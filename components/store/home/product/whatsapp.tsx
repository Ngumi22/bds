"use client";

import { useRouter } from "next/navigation";
import { SlidersVertical, XCircle } from "lucide-react";
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
  selectedVariants?: Record<string, string>;
  quantity?: number;
  className?: string;
}

export default function QuickBuy({
  product,
  selectedVariants = {},
  quantity = 1,
  className,
}: QuickBuyProps) {
  const router = useRouter();

  const hasRealVariants =
    product.hasVariants ||
    (product.colorVariants && product.colorVariants.length > 0);

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  const variantText =
    Object.keys(selectedVariants).length > 0
      ? Object.entries(selectedVariants)
          .map(([type, option]) => `${type}: ${option}`)
          .join("%0A")
      : "";

  const message = encodeURIComponent(
    `Hello, I'm interested in buying:

    Product: ${product.name}
    Quantity: ${quantity}
    ${variantText ? "Variants:\n" + variantText : ""}
    `
  );

  let icon = whatsappIcon.icon;
  let label = "Buy on whatsapp";
  let onClick = () =>
    router.push(`https://wa.me/${WhatsappPhoneNumber}?text=${message}`);
  let disabled = false;

  if (isOutOfStock) {
    icon = <XCircle size={20} />;
    label = "Out of stock";
    onClick = () => {};
    disabled = true;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "flex flex-1 items-center justify-center w-full h-9 text-sm font-bold uppercase tracking-wide text-white bg-green-600",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}>
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
