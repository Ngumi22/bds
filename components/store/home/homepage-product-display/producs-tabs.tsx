"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

export interface Tab {
  label: string;
  value: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface ProductsTabsProps {
  tabs: Tab[];
  viewAllUrl?: string;
  viewAllLabel?: string;
  className?: string;
}

export default function ProductsTabs({
  tabs,
  viewAllUrl,
  viewAllLabel = "View All",
  className,
}: ProductsTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });

  const allTabs = [
    ...tabs,
    ...(viewAllUrl
      ? [
          {
            label: viewAllLabel,
            value: "view-all",
            href: viewAllUrl,
            isActive: false,
          },
        ]
      : []),
  ];

  const activeTabIndex = allTabs.findIndex((tab) => tab.isActive);

  useEffect(() => {
    if (!containerRef.current || activeTabIndex === -1) {
      setActivePosition({ left: 0, width: 0 });
      return;
    }

    const activeTab = containerRef.current.children[
      activeTabIndex
    ] as HTMLElement;
    if (activeTab) {
      setActivePosition({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeTabIndex]);

  if (allTabs.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex gap-6 relative pb-1", className)}>
      {allTabs.map((tab, index) => {
        const isViewAll = tab.value === "view-all";
        const isActive = tab.isActive && !isViewAll;

        const commonClasses = cn(
          "text-sm transition-colors duration-300 relative whitespace-nowrap pb-1",
          isActive
            ? "text-primary font-medium"
            : "text-muted-foreground hover:text-foreground",
          isViewAll && "text-muted-foreground hover:text-foreground"
        );

        if (tab.href || isViewAll) {
          return (
            <Link
              key={index}
              href={tab.href || viewAllUrl || "/products"}
              className={commonClasses}
              aria-current={isActive ? "page" : undefined}>
              {tab.label}
            </Link>
          );
        }

        return (
          <button
            key={index}
            onClick={tab.onClick}
            className={commonClasses}
            aria-pressed={isActive}>
            {tab.label}
          </button>
        );
      })}

      {activeTabIndex >= 0 && allTabs[activeTabIndex]?.value !== "view-all" && (
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{
            left: activePosition.left,
            width: activePosition.width,
          }}
          role="presentation"
        />
      )}
    </div>
  );
}
