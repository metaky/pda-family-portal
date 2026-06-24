import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: {
    default: "PDA Family Tools",
    template: "%s | PDA Family Tools",
  },
  description: "Free, practical PDA-aware tools for families, caregivers, and school advocacy.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "PDA Family Tools",
    description: "Free, practical PDA-aware tools for families, caregivers, and school advocacy.",
    url: "/",
    siteName: "PDA Family Tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
