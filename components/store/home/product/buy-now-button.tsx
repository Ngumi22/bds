"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { WhatsappPhoneNumber } from "@/lib/constants";
import type { CartItem, CartAddOn } from "@/hooks/use-cart-store";
import { MinimalProductData } from "@/lib/product/product.types";
import { formatCurrency } from "@/lib/utils/form-helpers";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface CustomButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CustomButtonProps {}

interface BaseProps extends ButtonProps {
  phoneNumber?: string;
  label?: string;
  showIconOnly?: boolean;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

interface CartModeProps {
  mode: "cart";
  cartItems: CartItem[];
  cartTotal: number;
}

interface SingleProductModeProps {
  mode: "single";
  product: MinimalProductData;
  selectedVariants: Record<string, string>;
  quantity: number;
  price: number;
  addOns: CartAddOn[];
}

type WhatsAppOrderButtonProps = BaseProps &
  (CartModeProps | SingleProductModeProps);

const formatVariantString = (variants?: Record<string, string>) => {
  if (!variants || Object.keys(variants).length === 0) return "";
  return Object.entries(variants)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

const formatAddOnsString = (addOns?: CartAddOn[]) => {
  if (!addOns || addOns.length === 0) return "";
  return addOns
    .map((addon) => `   + ${addon.name} (${formatCurrency(addon.price)})`)
    .join("\n");
};

const customPropsToFilter = [
  "mode",
  "cartItems",
  "cartTotal",
  "product",
  "selectedVariants",
  "quantity",
  "price",
  "addOns",
  "phoneNumber",
  "label",
  "showIconOnly",
  "className",
  "variant",
  "size",
];

export function WhatsAppOrderButton(props: WhatsAppOrderButtonProps) {
  const {
    phoneNumber: propPhoneNumber,
    className,
    variant = "default",
    size = "default",
    label,
    showIconOnly = false,
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);

  const phoneNumber = String(
    propPhoneNumber || WhatsappPhoneNumber || "254700000000"
  );

  const handleCartOrder = () => {
    const cartProps = props as CartModeProps;
    const { cartItems, cartTotal } = cartProps;

    if (cartItems.length === 0) return "";

    const itemsList = cartItems
      .map((item, index) => {
        const variantStr = formatVariantString(item.variants);
        const addOnStr = formatAddOnsString(item.addOns);

        let itemStr = `${index + 1}. *${item.name}* x${item.quantity}`;
        if (variantStr) itemStr += `\n   Variants: ${variantStr}`;
        if (addOnStr) itemStr += `\nAdd-ons:\n${addOnStr}`;
        itemStr += `\n   Subtotal: ${formatCurrency(
          item.finalPrice * item.quantity
        )}`;

        return itemStr;
      })
      .join("\n\n");

    return `Hello, I would like to order the following items from my cart:\n\n${itemsList}\n\n*Total Order Value: ${formatCurrency(
      cartTotal
    )}*`;
  };

  const handleSingleOrder = () => {
    const singleProps = props as SingleProductModeProps;
    const { product, selectedVariants, quantity, price, addOns } = singleProps;

    if (product.stockStatus === "OUT_OF_STOCK") {
      return null;
    }

    const variantStr = formatVariantString(selectedVariants);
    const addOnStr = formatAddOnsString(addOns);

    const addOnTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const finalUnitPrice = price + addOnTotal;
    const total = finalUnitPrice * quantity;

    let message = `Hello, I am interested in buying this product:\n\n*${product.name}*\nQuantity: ${quantity}`;

    if (variantStr) message += `\nVariants: ${variantStr}`;
    if (addOnStr) message += `\n\n${addOnStr}`;

    message += `\n\n*Total Price: ${formatCurrency(total)}*`;

    return message;
  };

  const handleClick = () => {
    setLoading(true);

    let messageBody: string | null = "";

    if (props.mode === "cart") {
      messageBody = handleCartOrder();
    } else {
      messageBody = handleSingleOrder();
    }

    if (!messageBody) {
      setLoading(false);
      if (
        props.mode === "single" &&
        (props as SingleProductModeProps).product.stockStatus === "OUT_OF_STOCK"
      ) {
        console.error("Product is out of stock.");
      }
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(
      messageBody
    )}`;

    window.open(url, "_blank");
    setLoading(false);
  };

  const isDisabled =
    loading ||
    (props.mode === "cart" &&
      (props as CartModeProps).cartItems.length === 0) ||
    (props.mode === "single" &&
      (props as SingleProductModeProps).product.stockStatus === "OUT_OF_STOCK");

  const buttonLabel =
    label || (props.mode === "cart" ? "Order Cart on WhatsApp" : "Order Now");

  const buttonRestProps = Object.keys(rest).reduce((acc, key) => {
    if (!customPropsToFilter.includes(key)) {
      (acc as any)[key] = (rest as any)[key];
    }
    return acc;
  }, {}) as ButtonProps;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={isDisabled}
            variant={variant}
            size={size}
            className={`gap-2 ${className}`}
            {...buttonRestProps}>
            {loading ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {!showIconOnly && <span>{buttonLabel}</span>}
          </Button>
        </TooltipTrigger>
        {showIconOnly && (
          <TooltipContent>
            <p>{buttonLabel}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
