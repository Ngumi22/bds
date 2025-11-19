import Link from "next/link";
import { cn } from "@/lib/utils";
import ProductsTabs, { type Tab } from "./tabs";

export type { Tab };

export interface ProductsHeaderProps {
  title: string;
  subtitle?: string;
  tabs?: Tab[];
  viewAllUrl?: string;
  viewAllLabel?: string;
  className?: string;
}

export function ProductsHeader({
  title,
  subtitle,
  tabs = [],
  viewAllUrl,
  viewAllLabel = "View All",
  className,
}: ProductsHeaderProps) {
  return (
    <div
      className={cn(
        "md:flex items-center justify-between w-full border-b border-border",
        className
      )}>
      <div className="">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-row items-end gap-6">
        <ProductsTabs tabs={tabs} />
        {viewAllUrl && (
          <Link
            href={viewAllUrl}
            className={cn(
              "text-sm font-normal text-muted-foreground hover:text-primary transition-colors whitespace-nowrap",
              "pb-2",
              "mt-4 md:mt-0"
            )}>
            {viewAllLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
