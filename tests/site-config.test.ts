import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCanonicalUrl,
  getDonationUrl,
  getPublicSiteUrl,
  portalRoutes,
} from "@/lib/site";

const originalEnv = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SITE_URL: process.env.SITE_URL,
  NEXT_PUBLIC_DONATION_URL: process.env.NEXT_PUBLIC_DONATION_URL,
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

  it("lists public canonical portal routes", () => {
    expect(portalRoutes).toContain("/tools/declarative-language-translator");
    expect(portalRoutes).toContain("/tools/pda-behavior-report-help");
  });
});
