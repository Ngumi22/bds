"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Grip } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Category[];
}

export interface CategorySpecification {
  id: string;
  name: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  required: boolean;
  options?: string[];
  unit?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  children?: Category[];
  specifications?: CategorySpecification[];
  isActive?: boolean;
}

type CategoryBarProps = {
  categories: Category[];
};

export function CategoryBar({ categories }: CategoryBarProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="flex gap-2 items-center rounded-none border-0">
          <Grip />
          <p className="hidden md:flex">All Categories</p>
        </MenubarTrigger>

        <MenubarContent>
          {categories.map((category) => (
            <React.Fragment key={category.name}>
              {category.subcategories && category.subcategories.length > 0 ? (
                <MenubarSub>
                  <MenubarSubTrigger className="flex justify-between items-center w-full">
                    <p>{category.name}</p>
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    {category.subcategories.map((subcat) => (
                      <MenubarItem asChild key={subcat.name}>
                        <Link
                          href={`/products/categories=${category.slug}&subcat=${subcat.slug}`}>
                          {subcat.name}
                        </Link>
                      </MenubarItem>
                    ))}
                  </MenubarSubContent>
                </MenubarSub>
              ) : (
                <MenubarItem asChild>
                  <Link href={`/products/categories/${category.slug}`}>
                    {category.name}
                  </Link>
                </MenubarItem>
              )}
            </React.Fragment>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
