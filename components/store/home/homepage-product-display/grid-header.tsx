"use client";

import { cn } from "@/lib/utils";
import ProductsTabs, { Tab } from "./producs-tabs";

export type { Tab };

export interface ProductsHeaderProps {
  title: string;
  tabs?: Tab[];
  viewAllUrl?: string;
  viewAllLabel?: string;
  className?: string;
}

export function ProductsHeader({
  title,
  tabs = [],
  viewAllUrl,
  viewAllLabel = "View All",
  className,
}: ProductsHeaderProps) {
  return (
    <div className={cn("border-b border-gray-200 pb-4 w-full mb-4", className)}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2">
        <div className="flex items-end">
          <h2 className="text-lg md:text-xl font-semibold uppercase md:border-b-2 border-black pb-1">
            {title}
          </h2>
        </div>

        <div className="flex items-end">
          <ProductsTabs
            tabs={tabs}
            viewAllUrl={viewAllUrl}
            viewAllLabel={viewAllLabel}
          />
        </div>
      </div>
    </div>
  );
}
