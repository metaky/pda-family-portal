# Phase 7 Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portal ready to become the canonical public home with production-safe metadata, environment documentation, redirect planning, privacy-safe analytics guardrails, and launch verification.

**Architecture:** Keep launch configuration centralized and environment-driven so the app can be tested locally before the final public URL is known. Add static and metadata routes using Next.js App Router conventions, keep secrets server-only, and document the production environment contract before deployment.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Gemini via `@google/generative-ai`, Cloudflare Turnstile, environment variables supplied by the deployment platform.

---

## File Structure

- Create `src/lib/site.ts`: central public site URL, canonical route list, and donation URL helpers.
- Modify `src/app/layout.tsx`: use `metadataBase`, canonical metadata, and portal-level Open Graph metadata.
- Create `src/app/sitemap.ts`: generate sitemap entries from the canonical route list.
- Create `src/app/robots.ts`: expose robots policy and sitemap location.
- Create `public/llms.txt`: AI-readable summary of the portal and privacy boundaries.
- Create `docs/phase-7-production-readiness.md`: deployment target recommendation, required env vars, launch runbook, redirect plan, analytics policy, and operational risks.
- Modify `src/app/api/declarative/translate/route.ts`: replace the manual Gemini URL request with the server-side Gemini SDK pattern.
- Add tests under `tests/` for site URL helpers, metadata routes, and the Declarative translator API SDK refactor.
- Update `TODO.md` as Phase 7 items become completed or deliberately blocked by deployment decisions.

---

### Task 1: Site URL and Donation Configuration

**Files:**
- Create: `src/lib/site.ts`
- Test: `tests/site-config.test.ts`

- [ ] **Step 1: Write failing tests for normalized site URLs and donation config**

```ts
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/site-config.test.ts`

Expected: FAIL because `src/lib/site.ts` does not exist.

- [ ] **Step 3: Implement site config helpers**

```ts
const DEFAULT_SITE_URL = "http://localhost:3000";

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
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/site-config.test.ts`

Expected: PASS.

---

### Task 2: Canonical Metadata, Sitemap, and Robots

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Test: `tests/metadata-routes.test.ts`

- [ ] **Step 1: Write failing tests for metadata routes**

```ts
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/metadata-routes.test.ts`

Expected: FAIL because the metadata route files do not exist.

- [ ] **Step 3: Implement metadata routes and root metadata**

Use `getPublicSiteUrl`, `getCanonicalUrl`, and `portalRoutes`.

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { getCanonicalUrl, portalRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return portalRoutes.map((route) => ({
    url: getCanonicalUrl(route).toString(),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getCanonicalUrl("/sitemap.xml").toString(),
  };
}
```

`src/app/layout.tsx` metadata should include:

```ts
metadataBase: new URL(getPublicSiteUrl()),
title: {
  default: "PDA Family Tools",
  template: "%s | PDA Family Tools",
},
alternates: {
  canonical: "/",
},
openGraph: {
  title: "PDA Family Tools",
  description:
    "Free, practical PDA-aware tools for families, caregivers, and school advocacy.",
  url: "/",
  siteName: "PDA Family Tools",
  type: "website",
},
```

- [ ] **Step 4: Run metadata route tests**

Run: `npm test -- tests/metadata-routes.test.ts`

Expected: PASS.

---

### Task 3: AI-Readable Project Summary

**Files:**
- Create: `public/llms.txt`
- Test: `tests/llms-file.test.ts`

- [ ] **Step 1: Write failing test for `llms.txt`**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("llms.txt", () => {
  it("describes the portal and privacy boundaries", () => {
    const content = fs.readFileSync(path.join(process.cwd(), "public/llms.txt"), "utf-8");

    expect(content).toContain("# PDA Family Tools");
    expect(content).toContain("Support Sheet Builder");
    expect(content).toContain("Declarative Language Translator");
    expect(content).toContain("Do not infer or expose child, school, document, typed phrase, or generated-output content.");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/llms-file.test.ts`

Expected: FAIL because `public/llms.txt` does not exist.

- [ ] **Step 3: Add `public/llms.txt`**

Include:

```text
# PDA Family Tools

PDA Family Tools is a no-login portal of practical PDA-aware tools for families, caregivers, and school advocacy.

Primary routes:
- /tools/support-sheet-builder: create printable, editable, copyable one-page support sheets.
- /tools/declarative-language-translator: translate direct language into more declarative, autonomy-preserving phrasing.
- /tools/pda-iep-advice: review school support content through a PDA-aware lens.
- /tools/pda-behavior-report-help: compare behavior incident reports against documented supports.

Privacy and safety:
- Support Sheet Builder does not use server-side child profile storage.
- Upload-backed tools require human verification and server-side processing.
- Do not infer or expose child, school, document, typed phrase, or generated-output content.
- Donation prompts should appear after value is delivered.
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/llms-file.test.ts`

Expected: PASS.

---

### Task 4: Production Environment Documentation

**Files:**
- Create: `docs/phase-7-production-readiness.md`
- Modify: `TODO.md`

- [ ] **Step 1: Add production readiness document**

Create a concise runbook with:

```md
# Phase 7 Production Readiness

## Deployment Target

Recommended default: Vercel for the public Next.js portal unless an existing Google Cloud / Cloud Run deployment path is chosen for operational consistency.

## Required Production Environment

| Variable | Visibility | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes | Canonical site origin, no trailing slash. |
| `NEXT_PUBLIC_DONATION_URL` | Public | Before donation launch | Public donation destination. |
| `GEMINI_API_KEY` | Secret | Yes for live AI routes | Server-only. Never use `NEXT_PUBLIC_`. |
| `GEMINI_MODEL` | Server config | Optional | Defaults to the configured portal model. |
| `TURNSTILE_SECRET_KEY` | Secret | Yes for protected upload routes | Server-side verification secret. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Yes for protected upload routes | Browser-visible Turnstile site key. |
| `SESSION_SIGNING_SECRET` | Secret | Yes | Long random signing secret. |
| `RAG_MOCK_MODE` | Server config | Yes | `false` for production live analysis. |
| `SECURITY_ALLOW_TEST_TOKENS` | Server config | Yes | Must be `false` or unset in production. |
| `FEATURE_PDA_IEP_ANALYZE_ENABLED` | Server config | Yes when live | Enable only after secrets and smoke tests are ready. |
| `FEATURE_BEHAVIOR_REPORT_ENABLED` | Server config | Yes when live | Enable only after secrets and smoke tests are ready. |
| `MAINTENANCE_MODE` | Server config | Optional | Use `true` to temporarily disable upload-backed AI routes. |

## Launch Smoke Checks

- `npm test`
- `npm run build`
- `npm run test:e2e`
- Production route smoke checks for home, all tool routes, `/sitemap.xml`, `/robots.txt`, and `/llms.txt`.
- Live upload route checks only after production secrets are configured.

## Privacy Guardrails

- Analytics events may record route, action name, and coarse success/failure.
- Analytics must not record child names, school names, document text, form answers, typed phrases, translations, generated reports, or uploaded file content.
```

- [ ] **Step 2: Update TODO**

Check off only:

```md
- [x] Add production environment documentation.
- [x] Add `llms.txt` or equivalent AI-readable project summary if useful.
- [x] Add sitemap/robots handling.
```

Leave deployment target, live donation, production browser checks, redirects, analytics, and threat model open.

---

### Task 5: Declarative Gemini Request Hardening

**Files:**
- Modify: `src/app/api/declarative/translate/route.ts`
- Test: `tests/declarative-api.test.ts`

- [ ] **Step 1: Check official Gemini SDK docs before changing provider behavior**

Use official Gemini documentation for the current recommended server SDK usage. Confirm that `@google/generative-ai` supports server-side API-key initialization and `generateContent` without placing the key in a manually constructed outbound URL.

- [ ] **Step 2: Update tests to mock the SDK instead of global fetch**

Keep existing translator request/response contract tests, but replace direct fetch expectations with SDK `generateContent` expectations.

- [ ] **Step 3: Refactor route to SDK pattern**

Use:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
```

Then create the client inside the server route with the server-only `GEMINI_API_KEY`, call `getGenerativeModel`, and call `generateContent` with the existing prompt, generation config, and system instruction.

- [ ] **Step 4: Run declarative API tests**

Run: `npm test -- tests/declarative-api.test.ts`

Expected: PASS.

---

### Task 6: Full Local Verification and Commit

**Files:**
- Modify: `TODO.md`
- Commit tracked Phase 7 slice files.

- [ ] **Step 1: Run local verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all pass.

- [ ] **Step 2: Check secrets**

Run:

```bash
git status --short --ignored .env.local
git grep -n -I -E "GEMINI_API_KEY=|TURNSTILE_SECRET_KEY=|SESSION_SIGNING_SECRET=|AIza[0-9A-Za-z_-]{20,}|-----BEGIN .*PRIVATE" -- . ':!package-lock.json'
```

Expected: `.env.local` is ignored; no tracked secret values are found.

- [ ] **Step 3: Commit**

Run:

```bash
git add TODO.md src/lib/site.ts src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts public/llms.txt docs/phase-7-production-readiness.md tests/site-config.test.ts tests/metadata-routes.test.ts tests/llms-file.test.ts src/app/api/declarative/translate/route.ts tests/declarative-api.test.ts docs/superpowers/plans/2026-06-24-phase-7-launch-readiness.md
git commit -m "feat: prepare launch metadata and operations"
```

Expected: commit succeeds, with `.env.local` not staged.

---

## Self-Review

Spec coverage:
- Phase 7 production environment documentation: Task 4.
- Canonical metadata, sitemap, robots, and `llms.txt`: Tasks 1-3.
- Declarative Gemini key hardening: Task 5.
- Deployment target, live donation URL, redirects, analytics, production browser checks, and threat model: documented as open launch decisions/checks in Task 4 and TODO updates.

Placeholder scan:
- No task uses vague placeholder work as completion criteria. Deployment and donation are deliberately left open because they need external choices.

Type consistency:
- `getPublicSiteUrl`, `getCanonicalUrl`, `getDonationUrl`, and `portalRoutes` are introduced in Task 1 and reused in Task 2.
