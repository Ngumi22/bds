import type { Metadata } from "next";
import { Jost, Roboto } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const jost = Jost({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "Bernzz Digital Solutions - Premium Electronics",
    template: "%s | Bernzz Digital Solutions",
  },
  description: "Your one-stop shop for phones, laptops, printers and software",
  keywords: "electronics, phones, laptops, printers, software, technology",
  authors: [{ name: "Bernzz Digital Solutions" }],
  creator: "Bernzz Digital Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: " https://www.bernzzdigitalsolutions.co.ke",
    title: "Bernzz Digital Solutions - Premium Electronics",
    description:
      "Your one-stop shop for phones, laptops, printers and software",
    siteName: "Bernzz Digital Solutions",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
