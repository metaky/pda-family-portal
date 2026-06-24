import { afterEach, describe, expect, it, vi } from "vitest";
import { getDonationHref, isExternalDonationHref } from "@/lib/client/donation";

const originalDonationUrl = process.env.NEXT_PUBLIC_DONATION_URL;

afterEach(() => {
  vi.unstubAllEnvs();
  if (originalDonationUrl === undefined) {
    delete process.env.NEXT_PUBLIC_DONATION_URL;
  } else {
    process.env.NEXT_PUBLIC_DONATION_URL = originalDonationUrl;
  }
});

describe("donation links", () => {
  it("falls back to the portal donation page until a live destination exists", () => {
    vi.stubEnv("NEXT_PUBLIC_DONATION_URL", "");

    expect(getDonationHref()).toBe("/donate");
    expect(isExternalDonationHref(getDonationHref())).toBe(false);
  });

  it("uses the configured live donation destination", () => {
    vi.stubEnv("NEXT_PUBLIC_DONATION_URL", "https://buy.stripe.com/test-link ");

    expect(getDonationHref()).toBe("https://buy.stripe.com/test-link");
    expect(isExternalDonationHref(getDonationHref())).toBe(true);
  });
});
