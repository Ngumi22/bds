import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProductsBannerProps {
  children: ReactNode;
  className?: string;
}

export function ProductsBanner({ children, className }: ProductsBannerProps) {
  return (
    <div className={cn("shrink-0 rounded-lg overflow-hidden", className)}>
      {children}
    </div>
  );
}
