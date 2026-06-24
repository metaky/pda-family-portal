import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("Next.js security headers", () => {
  it("sets baseline response security headers for every route", async () => {
    const headers = await nextConfig.headers?.();

    expect(headers).toContainEqual({
      source: "/:path*",
      headers: expect.arrayContaining([
        {
          key: "Content-Security-Policy",
          value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
      ]),
    });
  });
});
