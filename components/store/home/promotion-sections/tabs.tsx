"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState, useMemo } from "react";

export interface Tab {
  label: string;
  value: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface ProductsTabsProps {
  tabs: Tab[];
  className?: string;
}

export default function ProductsTabs({ tabs, className }: ProductsTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  const activeTabIndex = useMemo(
    () => tabs.findIndex((tab) => tab.isActive),
    [tabs]
  );

  useEffect(() => {
    const updateIndicator = (animate: boolean) => {
      if (activeTabIndex < 0 || !tabRefs.current[activeTabIndex]) {
        setIndicatorStyle({ width: 0, opacity: 0 });
        return;
      }

      const activeTab = tabRefs.current[activeTabIndex];
      if (activeTab) {
        setIndicatorStyle({
          left: activeTab.offsetLeft,
          width: activeTab.offsetWidth,
          opacity: 1,
          transition: animate ? "all 0.3s ease-out" : "none",
        });
      }
    };

    updateIndicator(true);

    const handleResize = () => updateIndicator(false);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeTabIndex]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("flex flex-wrap gap-3 md:gap-6 relative", className)}
      aria-label="Product navigation">
      {tabs.map((tab, index) => {
        const commonClasses = cn(
          "text-sm font-normal transition-colors relative pb-2 whitespace-nowrap",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          tab.isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        );

        if (tab.href) {
          return (
            <Link
              key={index}
              href={tab.href}
              className={commonClasses}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              aria-current={tab.isActive ? "page" : undefined}>
              {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={index}
            onClick={tab.onClick}
            className={commonClasses}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            aria-pressed={tab.isActive}>
            {tab.label}
          </button>
        );
      })}

      <div
        className="absolute bottom-0 h-0.5 bg-primary"
        style={indicatorStyle}
        role="presentation"
      />
    </nav>
  );
}
