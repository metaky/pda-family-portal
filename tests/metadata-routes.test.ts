import { describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("metadata routes", () => {
  it("generates sitemap entries from the configured public URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pda-family-tools.example");
    const entries = sitemap();

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://pda-family-tools.example/",
        }),
        expect.objectContaining({
          url: "https://pda-family-tools.example/tools/support-sheet-builder",
        }),
        expect.objectContaining({
          url: "https://pda-family-tools.example/tools/pda-behavior-report-help",
        }),
      ]),
    );
  });

  it("points robots.txt at the canonical sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pda-family-tools.example");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://pda-family-tools.example/sitemap.xml",
    });
  });
});
