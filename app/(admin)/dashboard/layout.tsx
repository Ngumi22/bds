import "./dashboard.css";
import "@uploadthing/react/styles.css";
import { AppSidebar } from "@/components/dashboard/home/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/home/site-header";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

import { Toaster } from "sonner";
import { requireAdmin } from "@/lib/guards";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();

  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <SidebarProvider>
        <AppSidebar user={session?.user} />
        <SidebarInset>
          <SiteHeader user={session?.user} />
          <div className="flex flex-1 flex-col gap-4 p-2 pt-0 mt-2">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors closeButton />
    </>
  );
}
