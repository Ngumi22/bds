"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { MinimalProductData } from "@/lib/product/product.types";
import ProductCarousel from "@/components/shared";

interface FlashSaleClientProps {
  products?: MinimalProductData[];
  saleEndDate: Date;
  collectionName?: string;
  collectionId?: string;
  collectionSlug?: string;
  maxVisibleProducts?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasEnded: boolean;
}

const TimerBadge = ({ timeLeft }: { timeLeft: TimeLeft }) => {
  const format = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="border-2 border-red-500 rounded px-3 py-1 text-sm font-semibold text-red-500">
      {`${format(timeLeft.days)}d ${format(timeLeft.hours)}:${format(
        timeLeft.minutes
      )}:${format(timeLeft.seconds)}`}
    </div>
  );
};

export default function FlashSaleClient({
  products = [],
  saleEndDate,
  collectionName = "FLASH DEALS",
  maxVisibleProducts = 6,
}: FlashSaleClientProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasEnded: true,
  });

  const endDate = useMemo(() => new Date(saleEndDate), [saleEndDate]);
  const visibleProducts = useMemo(
    () => products.slice(0, maxVisibleProducts),
    [products, maxVisibleProducts]
  );

  const calcTimeLeft = useCallback((): TimeLeft => {
    const diff = endDate.getTime() - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, hasEnded: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      hasEnded: false,
    };
  }, [endDate]);

  useEffect(() => {
    const update = () => setTimeLeft(calcTimeLeft());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  if (!visibleProducts.length || timeLeft.hasEnded) return null;

  return (
    <ProductCarousel
      sectionId="flash-sale"
      title={collectionName}
      href={`/collections`}
      products={visibleProducts}
      itemsPerView={5}
      showArrows
      showDots
      timer={<TimerBadge timeLeft={timeLeft} />}
    />
  );
}
