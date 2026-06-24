const DEFAULT_SITE_URL = "http://localhost:3000";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export type DonationTier = {
  id: "small" | "large" | "custom" | "monthly";
  title: string;
  amount: string;
  cadence: string;
  description: string;
  buttonLabel: string;
  envKey: string;
  href: string | null;
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

export function getDonationTiers(): DonationTier[] {
  return [
    {
      id: "small",
      title: "Small donation",
      amount: "$3",
      cadence: "One-time",
      description: "A small one-time donation that helps keep the tools available.",
      buttonLabel: "Donate $3",
      envKey: "NEXT_PUBLIC_DONATION_SMALL_URL",
      href: normalizeUrl(process.env.NEXT_PUBLIC_DONATION_SMALL_URL),
    },
    {
      id: "large",
      title: "Large donation",
      amount: "$8",
      cadence: "One-time",
      description: "A larger one-time donation toward hosting and AI costs.",
      buttonLabel: "Donate $8",
      envKey: "NEXT_PUBLIC_DONATION_LARGE_URL",
      href: normalizeUrl(process.env.NEXT_PUBLIC_DONATION_LARGE_URL),
    },
    {
      id: "custom",
      title: "Custom donation",
      amount: "Custom",
      cadence: "One-time",
      description: "Choose the one-time amount that feels right for you.",
      buttonLabel: "Choose amount",
      envKey: "NEXT_PUBLIC_DONATION_CUSTOM_URL",
      href: normalizeUrl(process.env.NEXT_PUBLIC_DONATION_CUSTOM_URL),
    },
    {
      id: "monthly",
      title: "Monthly donation",
      amount: "$5",
      cadence: "Monthly",
      description: "Optional monthly support for recurring hosting and AI costs.",
      buttonLabel: "Donate $5 monthly",
      envKey: "NEXT_PUBLIC_DONATION_MONTHLY_URL",
      href: normalizeUrl(process.env.NEXT_PUBLIC_DONATION_MONTHLY_URL),
    },
  ];
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
