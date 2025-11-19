import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { User } from "@/lib/auth";

export function SiteHeader({ user }: { user: User }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          <Link href="/dashboard">BDS</Link>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
