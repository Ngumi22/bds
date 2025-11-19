"use client";

import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductsSearch() {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 500,
  });

  return (
    <div className="relative">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value || null)}
        className="p-4 w-full rounded-xs"
      />
      {search && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setSearch(null)}>
          ×
        </Button>
      )}
    </div>
  );
}
