"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterCheckbox } from "./filter-checkbox";
import { useQueryState } from "nuqs";

interface BrandFilterProps {
  brands: Array<{ id: string; name: string; count: number }>;
}

export function BrandFilter({ brands }: BrandFilterProps) {
  const [selectedBrands, setSelectedBrands] = useQueryState("brands", {
    parse: (value) => value.split(",").filter(Boolean),
    defaultValue: [],
    shallow: false,
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => brand.name.toLowerCase());
  }, [brands]);

  const handleBrandChange = (brandName: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brandName]
      : selectedBrands.filter((name) => name !== brandName);

    setSelectedBrands(newBrands.length > 0 ? newBrands : null);
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="pb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full pb-1">
        <p className="text-[16px] font-normal">Brand</p>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-500"
          style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isExpanded ? "1000px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transitionDelay: isExpanded ? "50ms" : "0ms",
        }}>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredBrands.map((brand) => {
            const isSelected = selectedBrands.includes(brand.name);

            return (
              <FilterCheckbox
                key={brand.id}
                id={`brand-${brand.name}`}
                label={brand.name}
                count={brand.count}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleBrandChange(brand.name, checked as boolean)
                }
                disabled={brand.count === 0 && !isSelected}
              />
            );
          })}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-3 text-muted-foreground text-xs">
            No brands found
          </div>
        )}
      </div>
    </div>
  );
}
