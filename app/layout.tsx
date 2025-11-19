import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bernzz Digital Solutions",
  description: "Electronics Store Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jost.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
