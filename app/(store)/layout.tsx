import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";
import { Providers } from "../providers";
import Footer from "@/components/store/home/navbar/footer-server";

export const metadata: Metadata = {
  title: "Bernzz Digital Solutions",
  description: "Electronics Store Kenya",
};

const DesktopNavbar = dynamic(
  () =>
    import("@/components/store/home/navbar/desktop-navbar").then(
      (mod) => mod.DesktopNavbar
    ),
  { ssr: true }
);
const BottomNavigation = dynamic(
  () =>
    import("@/components/store/home/navbar/bottom-navigation").then(
      (mod) => mod.BottomNavigation
    ),
  { ssr: true }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DesktopNavbar />
      <Providers>{children}</Providers>
      <BottomNavigation />
      <Footer />
      <Toaster />
    </>
  );
}
