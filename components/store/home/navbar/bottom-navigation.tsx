"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Heart, LayoutGrid, User as UserIcon } from "lucide-react";
import { User } from "@/lib/auth";
import { Account } from "./account";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  type?: "account";
};

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  {
    id: "collections",
    label: "Collections",
    icon: LayoutGrid,
    href: "/collections",
  },
  { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
  {
    id: "profile",
    label: "Account",
    icon: UserIcon,
    href: "/account",
    type: "account",
  },
];

export function BottomNavigation({ user }: { user?: User }) {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const handleClick = (item: NavItem) => {
    setActiveTab(item.id);
    router.push(item.href);
  };

  return (
    <div className="lg:hidden md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => handleClick(item)}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
  user,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  user?: User;
}) {
  const Icon = item.icon;

  const colorClass = active ? "text-gray-900" : "text-gray-500";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 h-auto cursor-pointer ${colorClass}`}>
      {item.type === "account" ? (
        <Account user={user} className="h-5 w-5 text-current" />
      ) : (
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      )}

      <span className="text-sm">{item.label}</span>
    </button>
  );
}
