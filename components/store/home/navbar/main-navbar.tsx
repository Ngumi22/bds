"use client";

import { useState } from "react";
import { Grid3X3, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MobileMenu } from "./mobile-menu";
import { CartSheet } from "./cart-sheet";

export function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount] = useState(3);

  return (
    <nav className="bg-white lg:hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <Grid3X3 className="h-5 w-5 text-gray-700" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
          </Sheet>

          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Home
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2 relative">
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </SheetTrigger>
              <CartSheet />
            </Sheet>

            <Button variant="ghost" size="icon" className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/abstract-profile.png" alt="Profile" />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                  U
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
