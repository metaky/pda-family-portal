import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCanonicalUrl,
  getDonationTiers,
  getDonationUrl,
  getPublicSiteUrl,
  portalRoutes,
} from "@/lib/site";

const originalEnv = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SITE_URL: process.env.SITE_URL,
  NEXT_PUBLIC_DONATION_URL: process.env.NEXT_PUBLIC_DONATION_URL,
  NEXT_PUBLIC_DONATION_SMALL_URL: process.env.NEXT_PUBLIC_DONATION_SMALL_URL,
  NEXT_PUBLIC_DONATION_LARGE_URL: process.env.NEXT_PUBLIC_DONATION_LARGE_URL,
  NEXT_PUBLIC_DONATION_CUSTOM_URL: process.env.NEXT_PUBLIC_DONATION_CUSTOM_URL,
  NEXT_PUBLIC_DONATION_MONTHLY_URL: process.env.NEXT_PUBLIC_DONATION_MONTHLY_URL,
};

afterEach(() => {
  vi.unstubAllEnvs();
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("site config", () => {
  it("falls back to localhost for local metadata", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", "");

    expect(getPublicSiteUrl()).toBe("http://localhost:3000");
    expect(getCanonicalUrl("/tools/support-sheet-builder").toString()).toBe(
      "http://localhost:3000/tools/support-sheet-builder",
    );
  });

  it("normalizes configured site URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    expect(getPublicSiteUrl()).toBe("https://example.com");
    expect(getCanonicalUrl("/privacy").toString()).toBe("https://example.com/privacy");
  });

  it("keeps donation URL null until a live destination is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_DONATION_URL", "");
    expect(getDonationUrl()).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_DONATION_URL", "https://buy.stripe.com/example");
    expect(getDonationUrl()).toBe("https://buy.stripe.com/example");
  });

  it("normalizes tiered donation destinations", () => {
    vi.stubEnv("NEXT_PUBLIC_DONATION_SMALL_URL", "https://donate.stripe.com/small ");
    vi.stubEnv("NEXT_PUBLIC_DONATION_LARGE_URL", "https://donate.stripe.com/large/");
    vi.stubEnv("NEXT_PUBLIC_DONATION_CUSTOM_URL", "https://buy.stripe.com/custom");
    vi.stubEnv("NEXT_PUBLIC_DONATION_MONTHLY_URL", "https://donate.stripe.com/monthly");

    expect(getDonationTiers()).toMatchObject([
      { id: "small", href: "https://donate.stripe.com/small" },
      { id: "large", href: "https://donate.stripe.com/large" },
      { id: "custom", href: "https://buy.stripe.com/custom" },
      { id: "monthly", href: "https://donate.stripe.com/monthly" },
    ]);
  });

  it("keeps unconfigured donation tiers disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_DONATION_SMALL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DONATION_LARGE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DONATION_CUSTOM_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DONATION_MONTHLY_URL", "");

    expect(getDonationTiers().every((tier) => tier.href === null)).toBe(true);
  });

  it("lists public canonical portal routes", () => {
    expect(portalRoutes).toContain("/tools/declarative-language-translator");
    expect(portalRoutes).toContain("/tools/pda-behavior-report-help");
  });
});
