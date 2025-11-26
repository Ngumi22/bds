"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Menu, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/form-helpers";

interface SubCategory {
  name: string;
  slug: string;
  href: string;
}

interface Brand {
  name: string;
  slug: string;
  logo: string;
}

interface FeaturedProduct {
  name: string;
  slug: string;
  price: number;
  mainImage: string;
}

export interface MegaMenuCategory {
  name: string;
  href: string;
  slug: string;
  subcategories: SubCategory[];
  featuredProducts: FeaturedProduct[];
  brands: Brand[];
  promotion: {
    title: string;
    description: string;
    cta: string;
  };
}

export function MegaMenu({ categories }: { categories: MegaMenuCategory[] }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(
    categories.length > 0 ? categories[0].name : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] =
    useState<MegaMenuCategory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedCategory = categories.find(
    (cat) => cat.name === hoveredCategory
  );

  return (
    <div className="">
      <div className="hidden md:flex items-center md:px-2 gap-6 ">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-0 shadow-none bg-transparent">
              <Menu className="w-5 h-5" />
              All Categories
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen ? "rotate-180" : ""
                )}
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[90vw] max-w-full p-0 border-0 shadow-sm z-50 rounded-sm"
            align="start"
            side="bottom"
            sideOffset={8}
            forceMount
            onMouseLeave={() => setIsOpen(false)}>
            <div className="flex max-h-96 bg-white rounded-lg overflow-hidden">
              <div className="w-64 border-r border-gray-200 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0",
                      hoveredCategory === category.name
                        ? "bg-blue-50 text-black"
                        : "text-gray-900 hover:bg-gray-100"
                    )}>
                    <span>{category.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="py-6 px-8">
                    <div className="grid grid-cols-4 gap-8">
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">
                          Categories
                        </h3>
                        {selectedCategory.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block text-sm text-gray-700 hover:text-black hover:font-semibold">
                            {sub.name}
                          </Link>
                        ))}
                        <Link
                          href={selectedCategory.href}
                          className="block text-sm font-semibold text-black hover:text-black mt-4 pt-4 border-t border-gray-200">
                          View All {selectedCategory.name}
                        </Link>
                      </div>

                      <div className="col-span-2 grid grid-cols-2 gap-6">
                        {selectedCategory.featuredProducts?.length ? (
                          selectedCategory.featuredProducts
                            .slice(0, 4)
                            .map((product, idx) => (
                              <div
                                key={`${product.name}-${idx}`}
                                className="flex flex-col items-center justify-center text-center">
                                <Image
                                  src={product.mainImage || "/placeholder.svg"}
                                  alt={product.name}
                                  width={100}
                                  height={100}
                                  className="w-36 h-36 object-cover rounded-sm mb-2"
                                />
                                <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center col-span-2">
                            <Image
                              src="/placeholder.svg"
                              alt="Coming Soon"
                              width={100}
                              height={100}
                              className="w-36 h-36 object-cover rounded-sm mb-2"
                            />
                            <p className="text-xs font-semibold text-gray-500">
                              Coming Soon
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-4">
                          Popular Brands
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedCategory.brands.map((brand) => (
                            <div
                              key={brand.name}
                              className="bg-gray-900 text-white rounded px-3 py-2 text-xs font-semibold text-center hover:bg-black transition-colors cursor-pointer">
                              {brand.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-6 flex-1">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:hidden flex items-center justify-between md:px-4 border-gray-200">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 overflow-hidden flex flex-col">
            <SheetHeader className="p-4 border-b shrink-0">
              <SheetTitle>
                {activeMobileCategory ? activeMobileCategory.name : "Menu"}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-hidden flex w-full">
              {!activeMobileCategory && (
                <div className="flex flex-col w-full">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setActiveMobileCategory(category)}
                      className="flex items-center justify-between w-full px-4 py-4 text-sm font-medium text-gray-900 hover:bg-gray-100 border-b border-gray-100">
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}

              {activeMobileCategory && (
                <div className="flex flex-col flex-1 overflow-y-auto">
                  <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
                    <button
                      onClick={() => setActiveMobileCategory(null)}
                      className="p-2 -ml-2 rounded-lg hover:bg-gray-200">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {activeMobileCategory.name}
                    </h3>
                  </div>

                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {activeMobileCategory.featuredProducts?.length ? (
                        activeMobileCategory.featuredProducts
                          .slice(0, 4)
                          .map((product, idx) => (
                            <Link
                              key={`${product.name}-${idx}`}
                              href={`/products/${product.slug}`}
                              onClick={() => setIsSheetOpen(false)}
                              className="block group">
                              <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                <Image
                                  src={product.mainImage || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <p className="text-xs font-semibold text-gray-900 group-hover:text-black line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs font-bold text-gray-900">
                                {formatCurrency(product.price)}
                              </p>
                            </Link>
                          ))
                      ) : (
                        <div className="text-center text-xs text-gray-500">
                          Coming Soon
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-900">
                        Subcategories
                      </h4>
                      {activeMobileCategory.subcategories.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsSheetOpen(false)}
                          className="block text-sm text-gray-700 hover:text-black py-2 px-2 rounded hover:bg-gray-50">
                          {sub.name}
                        </Link>
                      ))}
                      <Link
                        href={activeMobileCategory.href}
                        onClick={() => setIsSheetOpen(false)}
                        className="block text-sm font-semibold text-black mt-3 pt-3 border-t border-gray-200">
                        View All {activeMobileCategory.name}
                      </Link>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm font-semibold text-blue-900">
                        {activeMobileCategory.promotion.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activeMobileCategory.promotion.description}
                      </p>
                      <Link
                        href={activeMobileCategory.href}
                        onClick={() => setIsSheetOpen(false)}
                        className="text-sm font-semibold text-black mt-3 inline-block">
                        {activeMobileCategory.promotion.cta} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
