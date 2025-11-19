"use client";

import { useState, useMemo } from "react";
import { Plus, Minus } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { Category, SubCategory } from "@/lib/product/product.types";
import { FilterCheckbox } from "./filter-checkbox";

interface CategoryFilterProps {
  categories: Category[];
}

export function CatFilter({ categories }: CategoryFilterProps) {
  const [query, setQuery] = useQueryStates(
    {
      categories: {
        parse: (value) => value.split(",").filter(Boolean),
        serialize: (value) => value.join(","),
        defaultValue: [],
        shallow: false,
      },
      subCategories: {
        parse: (value) => value.split(",").filter(Boolean),
        serialize: (value) => value.join(","),
        defaultValue: [],
        shallow: false,
      },
    },
    {
      history: "push",
    }
  );

  const selectedCategories = useMemo(
    () => new Set(query.categories),
    [query.categories]
  );
  const selectedSubCategories = useMemo(
    () => new Set(query.subCategories),
    [query.subCategories]
  );

  const subCategoryParentMap = useMemo(() => {
    const map = new Map<string, string>();
    (categories || []).forEach((parent) => {
      parent.subCategories?.forEach((sub) => {
        map.set(sub.slug, parent.slug);
      });
    });
    return map;
  }, [categories]);

  const [userExpandedCategories, setUserExpandedCategories] = useState<
    Set<string>
  >(new Set());

  const filterExpandedCategories = useMemo(() => {
    const expanded = new Set<string>();

    selectedSubCategories.forEach((subSlug) => {
      const parentSlug = subCategoryParentMap.get(subSlug);
      const parent = categories.find((c) => c.slug === parentSlug);
      if (parent) {
        expanded.add(parent.id);
      }
    });
    return expanded;
  }, [categories, selectedSubCategories, subCategoryParentMap]);

  const finalExpandedCategories = useMemo(() => {
    const combined = new Set(userExpandedCategories);
    filterExpandedCategories.forEach((id) => combined.add(id));
    return combined;
  }, [userExpandedCategories, filterExpandedCategories]);

  const toggleExpanded = (categoryId: string) => {
    setUserExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const handleCategoryChange = (parentSlug: string, checked: boolean) => {
    const newCats = new Set(selectedCategories);
    const newSubCats = new Set(selectedSubCategories);

    if (checked) {
      newCats.add(parentSlug);

      categories
        .find((c) => c.slug === parentSlug)
        ?.subCategories?.forEach((sub) => {
          newSubCats.delete(sub.slug);
        });
    } else {
      newCats.delete(parentSlug);
    }

    setQuery({
      categories: newCats.size > 0 ? Array.from(newCats) : null,
      subCategories: newSubCats.size > 0 ? Array.from(newSubCats) : null,
    });
  };

  const handleSubCategoryChange = (subSlug: string, checked: boolean) => {
    const parentSlug = subCategoryParentMap.get(subSlug);
    if (!parentSlug) return;

    const newCats = new Set(selectedCategories);
    const newSubCats = new Set(selectedSubCategories);

    if (checked) {
      newSubCats.add(subSlug);
      newCats.add(parentSlug);
    } else {
      newSubCats.delete(subSlug);

      const parent = categories.find((c) => c.slug === parentSlug);
      const siblings = parent?.subCategories?.map((s) => s.slug) || [];
      const hasOtherCheckedSiblings = siblings.some((s) => newSubCats.has(s));

      if (!hasOtherCheckedSiblings) {
        newCats.delete(parentSlug);
      }
    }

    setQuery({
      categories: newCats.size > 0 ? Array.from(newCats) : null,
      subCategories: newSubCats.size > 0 ? Array.from(newSubCats) : null,
    });
  };

  const isParentChecked = (parent: Category) => {
    return selectedCategories.has(parent.slug);
  };

  const isSubChecked = (sub: SubCategory) => {
    return selectedSubCategories.has(sub.slug);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-normal">Categories</h2>
      <div className="space-y-2 border-t border-border">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between gap-2 py-2">
              <FilterCheckbox
                id={`category-${category.slug}`}
                label={category.name}
                count={category.count}
                checked={isParentChecked(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.slug, checked)
                }
                disabled={category.count === 0}
              />
              {category.subCategories && category.subCategories.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpanded(category.id);
                  }}
                  className="p-1 hover:bg-muted rounded transition-all duration-700 ease-in-out shrink-0"
                  aria-label={
                    finalExpandedCategories.has(category.id)
                      ? "Collapse"
                      : "Expand"
                  }>
                  <div
                    className={`transition-transform duration-700 ease-in-out ${
                      finalExpandedCategories.has(category.id)
                        ? "rotate-0"
                        : "-rotate-90"
                    }`}>
                    {finalExpandedCategories.has(category.id) ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {category.subCategories && category.subCategories.length > 0 && (
              <div
                className={`overflow-hidden transition-all duration-1000 ease-in-out ${
                  finalExpandedCategories.has(category.id)
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}>
                <div className="ml-2 space-y-2 pl-4">
                  {category.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center gap-2 py-1"
                      role="region"
                      aria-label={`Subcategory: ${subCategory.name}`}>
                      <FilterCheckbox
                        id={`subcategory-${subCategory.slug}`}
                        label={subCategory.name}
                        count={subCategory.count}
                        checked={isSubChecked(subCategory)}
                        onCheckedChange={(checked) => {
                          handleSubCategoryChange(subCategory.slug, checked);
                        }}
                        disabled={subCategory.count === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
