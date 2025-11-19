"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterCheckbox } from "./filter-checkbox";
import { useQueryState } from "nuqs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollectionFilterProps {
  collections: Array<{ id: string; name: string; count: number }>;
}

export function CollectionFilter({ collections }: CollectionFilterProps) {
  const [selectedCollections, setSelectedCollections] = useQueryState(
    "collections",
    {
      parse: (value) => value.split(",").filter(Boolean),
      defaultValue: [],
      shallow: false,
    }
  );

  const [isExpanded, setIsExpanded] = useState(true);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => collection.name.toLowerCase());
  }, [collections]);

  const handleCollectionChange = (collectionName: string, checked: boolean) => {
    const newCollections = checked
      ? [...selectedCollections, collectionName]
      : selectedCollections.filter((name) => name !== collectionName);

    setSelectedCollections(newCollections.length > 0 ? newCollections : null);
  };

  if (!collections || collections.length === 0) return null;

  return (
    <div className="pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full pb-3">
        <p className="text-[16px] font-normal">Collection</p>
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
        <ScrollArea className="max-h-64">
          <div className="space-y-1 pr-4">
            {filteredCollections.map((collection) => {
              const isSelected = selectedCollections.includes(collection.name);

              return (
                <FilterCheckbox
                  key={collection.id}
                  id={`collection-${collection.name}`}
                  label={collection.name}
                  count={collection.count}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCollectionChange(collection.name, checked as boolean)
                  }
                  disabled={collection.count === 0 && !isSelected}
                />
              );
            })}
          </div>
        </ScrollArea>

        {filteredCollections.length === 0 && (
          <div className="text-center py-3 text-muted-foreground text-xs">
            No Collections found
          </div>
        )}
      </div>
    </div>
  );
}
