import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import Script from "next/script";

const roboto = Roboto({ subsets: ["latin"], weight: "400" });

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bernzz Digital Solutions",
  url: "https://www.bernzzdigitalsolutions.co.ke",
  logo: "https://www.bernzzdigitalsolutions.co.ke/logo.png",
  sameAs: [
    "https://www.facebook.com/BDStechnologies",
    "https://www.instagram.com/bernzztechnologies",
    "https://x.com/Shiks_peters",
    "https://www.tiktok.com/@eunicepeters4",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+254-112-725364",
    contactType: "Sales",
  },
};

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
    url: "https://www.bernzzdigitalsolutions.co.ke",
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
  verification: {
    google: process.env.NEXT_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
