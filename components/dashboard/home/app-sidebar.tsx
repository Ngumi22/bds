"use client";

import * as React from "react";
import {
  Book,
  BookOpen,
  Currency,
  GalleryVerticalEnd,
  Settings2,
  User as UserIcon,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/home/nav-main";
import { NavUser } from "@/components/dashboard/home/nav-user";
import { TeamSwitcher } from "@/components/dashboard/home/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const sidebarData = {
    user: {
      name: user.name,
      email: user.email,
      avatar: user.image,
    },
    teams: [
      {
        name: "BDS Digital",
        logo: GalleryVerticalEnd,
      },
    ],
    navMain: [
      {
        title: "Inventory",
        icon: Book,
        isActive: true,
        items: [
          {
            title: "Products",
            url: "/dashboard/products",
          },
          {
            title: "Categories",
            url: "/dashboard/categories",
          },
          {
            title: "Brands",
            url: "/dashboard/brands",
          },
        ],
      },
      {
        title: "Sales",
        url: "/dashboard/sales",
        icon: Currency,
        items: [
          {
            title: "Orders",
            url: "/dashboard/sales/orders",
          },
          {
            title: "Invoices",
            url: "/dashboard/sales/invoices",
          },
        ],
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: UserIcon,
        items: [
          {
            title: "Users",
            url: "/dashboard/customers/users",
          },
        ],
      },
      {
        title: "Blog",
        icon: Book,
        items: [
          {
            title: "Posts",
            url: "/dashboard/blog-posts",
          },
        ],
      },
      {
        title: "Marketing",
        icon: BookOpen,
        items: [
          {
            title: "Collections",
            url: "/dashboard/collections",
          },
          {
            title: "Hero",
            url: "/dashboard/hero",
          },
        ],
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "/dashboard/settings/general",
          },
          {
            title: "Team",
            url: "/dashboard/settings/Team",
          },
          {
            title: "Billing",
            url: "/dashboard/settings/billing",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
