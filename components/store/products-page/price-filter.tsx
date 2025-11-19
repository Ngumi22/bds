"use client";

import type React from "react";
import { useQueryState } from "nuqs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils/form-helpers";
import { cn } from "@/lib/utils";

interface PriceFilterProps {
  priceRange: { min: number; max: number };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PriceFilter({ priceRange }: PriceFilterProps) {
  const [minPrice, setMinPrice] = useQueryState("minPrice", {
    parse: (v) => (v ? Number(v) : null),
  });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", {
    parse: (v) => (v ? Number(v) : null),
  });

  const [localMin, setLocalMin] = useState<string>(
    minPrice ? String(minPrice) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    maxPrice ? String(maxPrice) : ""
  );

  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);

  const debouncedLocalMin = useDebounce(localMin, 500);
  const debouncedLocalMax = useDebounce(localMax, 500);

  const isInitialMount = useRef(true);

  useEffect(() => {
    setLocalMin(minPrice ? String(minPrice) : "");
    setLocalMax(maxPrice ? String(maxPrice) : "");
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const updateUrlParams = () => {
      const numMin =
        debouncedLocalMin !== "" ? Number(debouncedLocalMin) : null;
      const numMax =
        debouncedLocalMax !== "" ? Number(debouncedLocalMax) : null;

      let validMin =
        numMin !== null && !Number.isNaN(numMin)
          ? clamp(numMin, priceRange.min, priceRange.max)
          : null;

      let validMax =
        numMax !== null && !Number.isNaN(numMax)
          ? clamp(numMax, priceRange.min, priceRange.max)
          : null;

      if (validMin !== null && validMax !== null && validMin > validMax) {
        [validMin, validMax] = [validMax, validMin];
        setLocalMin(String(validMin));
        setLocalMax(String(validMax));
      }

      const newMinPrice =
        validMin !== null && validMin > priceRange.min ? validMin : null;

      const newMaxPrice =
        validMax !== null && validMax < priceRange.max ? validMax : null;

      if (newMinPrice !== minPrice || newMaxPrice !== maxPrice) {
        setMinPrice(newMinPrice);
        setMaxPrice(newMaxPrice);
      }
    };

    updateUrlParams();
  }, [
    debouncedLocalMin,
    debouncedLocalMax,
    priceRange.min,
    priceRange.max,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
  ]);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setLocalMin(value);
      }
    },
    []
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setLocalMax(value);
      }
    },
    []
  );

  const handleSliderChange = useCallback((values: number[]) => {
    setLocalMin(String(values[0]));
    setLocalMax(String(values[1]));
  }, []);

  const handleSliderCommit = useCallback(() => {
    const numMin = Number(localMin);
    const numMax = Number(localMax);

    const newMinPrice =
      !Number.isNaN(numMin) && numMin > priceRange.min ? numMin : null;

    const newMaxPrice =
      !Number.isNaN(numMax) && numMax < priceRange.max ? numMax : null;

    setMinPrice(newMinPrice);
    setMaxPrice(newMaxPrice);
  }, [
    localMin,
    localMax,
    priceRange.min,
    priceRange.max,
    setMinPrice,
    setMaxPrice,
  ]);

  const sliderMin =
    localMin !== "" && !Number.isNaN(Number(localMin))
      ? clamp(Number(localMin), priceRange.min, priceRange.max)
      : priceRange.min;

  const sliderMax =
    localMax !== "" && !Number.isNaN(Number(localMax))
      ? clamp(Number(localMax), priceRange.min, priceRange.max)
      : priceRange.max;

  const showMinLabel = minFocused || localMin !== "";
  const showMaxLabel = maxFocused || localMax !== "";

  return (
    <div className="pb-3 space-y-3">
      <p className="text-[16px] font-normal">Price</p>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="text-xs text-muted-foreground">
          The highest price is{" "}
          <span className="text-xs font-semibold">
            {formatCurrency(priceRange.max)}
          </span>
        </div>
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={1}
          value={[sliderMin, sliderMax]}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(priceRange.min)}</span>
          <span>{formatCurrency(priceRange.max)}</span>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={localMin}
              onChange={handleMinChange}
              onFocus={() => setMinFocused(true)}
              onBlur={() => setMinFocused(false)}
              placeholder=""
              className="peer pt-4 pl-3 text-sm border-neutral-400"
            />
            <label
              className={cn(
                "absolute left-3 text-xs font-medium text-muted-foreground pointer-events-none transition-all duration-200 origin-left",
                showMinLabel
                  ? "top-1 scale-75 text-foreground"
                  : "top-1/2 -translate-y-1/2 scale-100"
              )}>
              From
            </label>
          </div>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={localMax}
              onChange={handleMaxChange}
              onFocus={() => setMaxFocused(true)}
              onBlur={() => setMaxFocused(false)}
              placeholder=""
              className="peer pt-4 pl-3 text-sm border-neutral-400"
            />
            <label
              className={cn(
                "absolute left-3 text-xs font-medium text-muted-foreground pointer-events-none transition-all duration-200 origin-left",
                showMaxLabel
                  ? "top-1 scale-75 text-foreground"
                  : "top-1/2 -translate-y-1/2 scale-100"
              )}>
              To
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
