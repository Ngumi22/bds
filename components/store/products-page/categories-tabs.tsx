"use client";
import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";
import { useQueryState } from "nuqs";

interface CategoryTabsProps {
  parentCategories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
}

export function CategoryTabs({ parentCategories }: CategoryTabsProps) {
  const [category, setCategory] = useQueryState("category", {
    shallow: false,
    throttleMs: 300,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const currentCategorySlug = category || "all";

  const handleTabClick = useCallback(
    (slug: string) => {
      const newCategory = slug === "all" ? null : slug;
      setCategory(newCategory);
    },
    [setCategory]
  );

  const allTabs = [
    {
      name: "All",
      slug: "all",
      count: parentCategories.reduce((acc, cat) => acc + cat.count, 0),
    },
    ...parentCategories,
  ];

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="flex md:hidden gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {allTabs.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => handleTabClick(tab.slug)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap shrink-0",
              currentCategorySlug === tab.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}>
            {tab.name}
            {tab.count > 0 && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  currentCategorySlug === tab.slug ? "opacity-80" : "opacity-70"
                )}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="hidden md:flex flex-wrap gap-2 justify-center">
        {allTabs.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => handleTabClick(tab.slug)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium",
              currentCategorySlug === tab.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}>
            {tab.name}
            {tab.count > 0 && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  currentCategorySlug === tab.slug ? "opacity-80" : "opacity-70"
                )}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

CategoryTabs.displayName = "CategoryTabs";
export default CategoryTabs;
