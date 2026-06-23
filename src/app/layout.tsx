import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDA Family Tools",
  description: "Free, practical PDA-aware tools for families, caregivers, and school advocacy.",
  icons: {
    icon: "/favicon.svg",
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
