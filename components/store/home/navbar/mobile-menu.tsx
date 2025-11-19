"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Search, User, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const categories = [
  {
    name: "Phones",
    subcategories: [
      { name: "Smartphones", items: ["iPhone", "Samsung Galaxy", "Google Pixel", "OnePlus"] },
      { name: "Accessories", items: ["Cases", "Screen Protectors", "Chargers", "Headphones"] },
      { name: "Brands", items: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"] },
    ],
  },
  {
    name: "Laptops",
    subcategories: [
      { name: "Gaming Laptops", items: ["ASUS ROG", "MSI Gaming", "Alienware", "Razer"] },
      { name: "Business Laptops", items: ["ThinkPad", "Dell Latitude", "HP EliteBook", "Surface"] },
      { name: "Ultrabooks", items: ["MacBook Air", "Dell XPS", "HP Spectre", "Surface Laptop"] },
    ],
  },
  {
    name: "Printers",
    subcategories: [
      { name: "Inkjet Printers", items: ["Canon PIXMA", "HP DeskJet", "Epson Expression", "Brother"] },
      { name: "Laser Printers", items: ["HP LaserJet", "Canon imageCLASS", "Brother HL", "Samsung"] },
      { name: "All-in-One", items: ["HP OfficeJet", "Canon MAXIFY", "Epson WorkForce", "Brother MFC"] },
    ],
  },
  {
    name: "Software",
    subcategories: [
      { name: "Operating Systems", items: ["Windows 11", "macOS", "Linux", "Chrome OS"] },
      { name: "Productivity", items: ["Microsoft Office", "Adobe Creative", "Google Workspace", "Notion"] },
      { name: "Security", items: ["Norton", "McAfee", "Bitdefender", "Kaspersky"] },
    ],
  },
]

interface MobileMenuProps {
  onClose: () => void
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  return (
    <SheetContent side="left" className="w-80 p-0 bg-white">
      <SheetHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?key=7pbcr" alt="Profile" />
            <AvatarFallback className="bg-orange-100 text-orange-600">U</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <SheetTitle className="text-lg font-semibold text-gray-900">Welcome!</SheetTitle>
            <p className="text-sm text-gray-500">Explore our products</p>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <Collapsible
              key={category.name}
              open={openCategories.includes(category.name)}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-12 px-6 rounded-none border-b border-gray-100 text-gray-700 font-medium"
                >
                  {category.name}
                  {openCategories.includes(category.name) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-gray-50/50">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.name} className="px-6 py-3 border-b border-gray-100/50">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">{subcategory.name}</h4>
                    <ul className="space-y-1">
                      {subcategory.items.map((item) => (
                        <li key={item}>
                          <a
                            href={`/products/${item.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm text-gray-700 hover:text-red-500 transition-colors block py-1"
                            onClick={onClose}
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}

          <div className="border-t border-gray-100 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-6 rounded-none text-gray-700 font-medium"
              asChild
            >
              <a href="/deals" onClick={onClose}>
                Deals
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-6 rounded-none text-gray-700 font-medium"
              asChild
            >
              <a href="/new-arrivals" onClick={onClose}>
                New Arrivals
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-6 rounded-none text-gray-700 font-medium"
              asChild
            >
              <a href="/top-rated" onClick={onClose}>
                Top Rated
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 space-y-2">
          <Button variant="outline" className="w-full justify-start bg-white border-gray-200 text-gray-700" asChild>
            <a href="/account" onClick={onClose}>
              <User className="mr-2 h-4 w-4" />
              My Account
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white border-gray-200 text-gray-700" asChild>
            <a href="/wishlist" onClick={onClose}>
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white border-gray-200 text-gray-700" asChild>
            <a href="/settings" onClick={onClose}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a>
          </Button>
        </div>
      </div>
    </SheetContent>
  )
}
