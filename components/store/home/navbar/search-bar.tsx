"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { MinimalProductData } from "@/lib/types/product";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/form-helpers";
import { Input } from "@/components/ui/input";
import { filterProducts } from "@/lib/product/fetchProducts";
import { ProductSearchParams } from "@/lib/product/product.types";

interface ProductSearchBarProps {
  categoryId?: string;
}

export function ProductSearchBar({ categoryId }: ProductSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MinimalProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);

      try {
        const searchParams: ProductSearchParams = {
          searchQuery: debouncedQuery,
          limit: 10,
        };

        const searchResult = await filterProducts(searchParams);

        if (searchResult?.products) {
          setResults(searchResult.products);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, categoryId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showResultsDropdown =
    isFocused && (results.length > 0 || isLoading || debouncedQuery.length > 1);

  return (
    <div
      ref={searchRef}
      className="relative w-full max-w-lg mx-auto"
      role="combobox"
      aria-expanded={showResultsDropdown}
      aria-haspopup="listbox">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Search for products..."
        className="w-96 md:w-80 border-gray-300 focus:border-gray-400"
        aria-autocomplete="list"
        aria-controls="product-search-results"
      />

      {showResultsDropdown && (
        <ul
          id="product-search-results"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <li className="px-4 py-3 text-gray-500 italic">Searching...</li>
          ) : results.length > 0 ? (
            results.map((product) => (
              <li key={product.id} role="option" className="hover:bg-gray-100">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center p-3"
                  onClick={() => {
                    setIsFocused(false);
                    setQuery("");
                  }}>
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    height={100}
                    width={100}
                    className="w-12 h-12 object-cover rounded-md mr-3 shrink-0"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <div className="grow">
                    <span className="font-medium text-gray-900 block line-clamp-1">
                      {product.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(product.price)}
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <s className="ml-2 text-gray-400">
                            {formatCurrency(product.originalPrice)}
                          </s>
                        )}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500">
              No results found for &quot;{debouncedQuery}&quot;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
