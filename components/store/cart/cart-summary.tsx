"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart-store";
import { formatCurrency } from "@/lib/utils/form-helpers";
import { applyCoupon } from "@/lib/actions/coupon";
import { WhatsAppOrderButton } from "../home/product/buy-now-button";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0
  );

  const shipping = 0;
  const taxRate = 0.0;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal - discount + shipping + tax).toFixed(2));

  async function handleApplyCoupon() {
    if (!couponCode) return;

    const res = await applyCoupon(couponCode, subtotal);
    if (res.success) {
      setDiscount(res.amount);
    } else {
      setDiscount(0);
    }
  }

  return (
    <div className="rounded-sm p-4 border-2">
      <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-white">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-semibold">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>

        <div className="flex justify-between pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-300">
            Tax ({taxRate * 100}%)
          </span>
          <span className="font-medium">Ksh {tax.toFixed(2)}</span>
        </div>

        <div className="pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Payable</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-3 mt-6">
        <div className="flex items-stretch gap-2">
          <Input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="grow rounded-xs"
          />
          <Button
            onClick={handleApplyCoupon}
            variant="outline"
            className="rounded-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={!couponCode}>
            Apply
          </Button>
        </div>

        <WhatsAppOrderButton
          mode="cart"
          cartItems={items}
          cartTotal={total}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xs shadow-md hover:shadow-lg transition duration-200"
        />

        <Link href={items.length > 0 ? "/checkout" : "#"} passHref>
          <Button
            className="w-full bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xs"
            size="lg"
            disabled={items.length === 0}>
            Proceed to Secure Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
