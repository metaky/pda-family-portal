const FALLBACK_DONATION_HREF = "/donate";

function normalizeDonationUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function getDonationHref() {
  return normalizeDonationUrl(process.env.NEXT_PUBLIC_DONATION_URL) ?? FALLBACK_DONATION_HREF;
}

export function isExternalDonationHref(href: string) {
  return /^https?:\/\//.test(href);
}
