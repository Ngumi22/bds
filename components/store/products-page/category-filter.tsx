"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterCheckbox } from "./filter-checkbox";
import { useQueryState } from "nuqs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string; count: number }>;
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const [selectedSubCategories, setSelectedSubCategories] = useQueryState(
    "subCategories",
    {
      parse: (value) => value.split(",").filter(Boolean),
      defaultValue: [],
      shallow: false,
    }
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubCategoryChange = (categoryName: string, checked: boolean) => {
    const newSubCategories = checked
      ? [...selectedSubCategories, categoryName]
      : selectedSubCategories.filter((name) => name !== categoryName);

    setSelectedSubCategories(
      newSubCategories.length > 0 ? newSubCategories : null
    );
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full pb-3">
        <p className="text-sm font-medium">Categories</p>
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
        <ScrollArea className="h-64">
          <div className="space-y-1 pr-4">
            {categories.map((category) => (
              <FilterCheckbox
                key={category.id}
                id={`category-${category.id}`}
                label={category.name}
                count={category.count}
                checked={selectedSubCategories.includes(category.name)}
                onCheckedChange={(checked) =>
                  handleSubCategoryChange(category.name, checked as boolean)
                }
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
