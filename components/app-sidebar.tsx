import * as React from "react";
import {
  Book,
  BookOpen,
  ChevronRight,
  Currency,
  GalleryVerticalEnd,
  Settings2,
  User,
} from "lucide-react";

import { SearchForm } from "@/components/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Bernzz",
    email: "m@example.com",
    avatar: "",
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
      icon: User,
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm">
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
