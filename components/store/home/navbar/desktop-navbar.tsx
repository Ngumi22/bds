import {
  Phone,
  MapPin,
  Truck,
  Clock,
  Headphones,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
} from "lucide-react";
import { MegaMenu } from "./mega-menu";
import { getMegaMenuCategories } from "@/lib/actions/categories";
import { ProductSearchBar } from "./search-bar";
import CartButton from "./cart";
import WishButton from "./wish";
import { Account } from "./account";
import { MobileSearch } from "./mobile-search";
import { getServerSession } from "@/lib/actions/auth";
import Logo from "./logo";

export async function DesktopNavbar() {
  const { data: categories } = await getMegaMenuCategories();
  const session = await getServerSession();
  return (
    <div className="sticky top-0 z-40 w-full bg-white">
      <div className="px-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between h-10 text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Truck className="h-5 w-5" />
            <span className="hidden md:flex">Fast delivery</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span className="hidden md:flex">Pickup in one hour</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Headphones className="h-5 w-5" />
            <span className="hidden md:flex">Technical Support</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <Facebook className="h-5 w-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
            <Twitter className="h-5 w-5 text-gray-500 hover:text-blue-400 cursor-pointer" />
            <Youtube className="h-5 w-5 text-gray-500 hover:text-red-600 cursor-pointer" />
            <Instagram className="h-5 w-5 text-gray-500 hover:text-pink-600 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo />
            <div className="hidden md:block">
              <ProductSearchBar />
            </div>
            <div className="hidden lg:flex space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div className="text-xs">
                  <div className="font-semibold text-gray-900">
                    Revlon, Kimathi Street
                  </div>
                  <div className="text-gray-500">Opened Until 19:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <div className="text-xs">
                  <div className="font-semibold text-gray-900">
                    (+254) 112 - 725364
                  </div>
                  <div className="text-gray-500">mon-sat: 8:00 - 19:00</div>
                </div>
              </div>
            </div>
            <div className="relative flex items-center space-x-3 md:space-x-8">
              <MobileSearch />

              <div className="hidden md:block cursor-pointer">
                <Account user={session?.user} className="h-8 w-8" />
              </div>

              <WishButton />
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b flex items-center justify-between px-4 py-1">
        <MegaMenu categories={categories} />
        <div className="md:hidden flex space-x-6">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div className="text-xs">
              <div className="font-semibold text-gray-900">
                Revlon, Kimathi Street
              </div>
              <div className="text-gray-500">Opened Until 19:00</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-gray-500" />
            <div className="text-xs">
              <div className="font-semibold text-gray-900">
                (+254) 112 - 725364
              </div>
              <div className="text-gray-500">mon-sat: 8:00 - 19:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
