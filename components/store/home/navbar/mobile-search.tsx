import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";
import { ProductSearchBar } from "./search-bar";

export function MobileSearch() {
  return (
    <Popover>
      <PopoverTrigger asChild className="block md:hidden rounded-xs">
        <Search size={30} strokeWidth={1.25} className="cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-screen mt-16">
        <p className="text-lg mb-4 font-semibold">Search Products</p>
        <ProductSearchBar />
      </PopoverContent>
    </Popover>
  );
}
