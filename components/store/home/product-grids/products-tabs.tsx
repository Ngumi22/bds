// app/components/products-tabs.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState, useMemo } from "react";

// This type can be moved to a shared types file
export interface Tab {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface ProductsTabsProps {
  tabs: Tab[];
  className?: string;
}

export function ProductsTabs({ tabs, className }: ProductsTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Memoize the active tab index calculation
  const activeTabIndex = useMemo(
    () => tabs.findIndex((tab) => tab.isActive),
    [tabs]
  );

  /**
   * RELIABILITY & UI IMPROVEMENT:
   * This effect now correctly handles window resizing.
   * - It animates when the active tab (activeTabIndex) changes.
   * - It snaps to the new position without animation on window resize,
   * preventing a "laggy" feel.
   */
  useEffect(() => {
    const updateIndicator = (animate: boolean) => {
      if (activeTabIndex < 0 || !tabRefs.current[activeTabIndex]) {
        // Hide indicator if no active tab
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

    // Run with animation on mount or when activeTabIndex changes
    updateIndicator(true);

    // Run without animation on resize
    const handleResize = () => updateIndicator(false);
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTabIndex]); // Re-run only when the active tab changes

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
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm", // UI/Accessibility
          tab.isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        );

        // REUSABILITY: Render a <Link> for navigation
        if (tab.href) {
          return (
            <Link
              key={index}
              href={tab.href}
              className={commonClasses}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              aria-current={tab.isActive ? "page" : undefined} // UI/Accessibility
            >
              {tab.label}
            </Link>
          );
        }
        // REUSABILITY: Render a <button> for actions
        return (
          <button
            key={index}
            onClick={tab.onClick}
            className={commonClasses}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            aria-pressed={tab.isActive} // UI/Accessibility
          >
            {tab.label}
          </button>
        );
      })}

      {/* Single animated active indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-primary"
        style={indicatorStyle}
        role="presentation"
      />
    </nav>
  );
}
