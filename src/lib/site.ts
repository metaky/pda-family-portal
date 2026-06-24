const DEFAULT_SITE_URL = "http://localhost:3000";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export const portalRoutes = [
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/donate",
  "/migration-inventory",
  "/tools/declarative-language-translator",
  "/tools/support-sheet-builder",
  "/tools/support-sheet-builder/examples",
  "/tools/support-sheet-builder/examples/teacher",
  "/tools/support-sheet-builder/examples/family",
  "/tools/support-sheet-builder/examples/childcare",
  "/tools/support-sheet-builder/examples/medical-provider",
  "/tools/support-sheet-builder/examples/activity-leader",
  "/tools/pda-iep-advice",
  "/tools/pda-iep-advice/accommodations",
  "/tools/pda-iep-advice/analyze",
  "/tools/pda-iep-advice/guide",
  "/tools/pda-behavior-report-help",
] as const;

function normalizeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

export function getPublicSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.SITE_URL) ??
    DEFAULT_SITE_URL
  );
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, getPublicSiteUrl());
}

export function getDonationUrl() {
  return normalizeUrl(process.env.NEXT_PUBLIC_DONATION_URL);
}

export function createPageMetadata({ title, description, path }: PageMetadataInput) {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "PDA Family Tools",
      type: "website",
    },
  } as const;
}
