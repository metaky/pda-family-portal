# Phase 4 Declarative Translator Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Declarative Language Translator as a native PDA Family Tools portal feature with source-project prompt behavior, variations, local history, privacy guardrails, and mocked test coverage before live Gemini verification.

**Architecture:** Port the source translator as a portal-native feature instead of linking out. Keep browser state and history in client components, move Gemini calls behind a Next.js route handler, and make prompt building/testable request validation live in `src/lib/declarative-translator.ts`. Preserve the old app's request shape closely enough that later parity work can reuse eval fixtures and source prompts.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, Playwright, Gemini via server-side `fetch`/route abstraction in the MVP.

---

## Source Decisions

- Use `/Users/kyle.wegner/Dev Projects/declarative` as the source of truth for translator behavior.
- Port `services/translationPrompt.js` behavior into TypeScript instead of replacing it with a generic rewrite prompt.
- Adapt `/api/translate` from Express into `src/app/api/declarative/translate/route.ts`.
- Do not require a Gemini key for unit tests or e2e tests. Tests should mock the route response.
- Use `GEMINI_API_KEY` for live local Gemini checks. No new key is needed unless the local environment does not already provide one.
- Keep Support Sheet Builder's stronger portal rule for donations: donation prompts appear after value is delivered.
- Do not add PostHog or any analytics package in this phase. If analytics is added later, it must avoid typed phrases, generated outputs, child names, and interest text.

## Task 1: Translator Contract Types and Prompt Tests

**Files:**
- Create: `src/lib/declarative-translator.ts`
- Test: `tests/declarative-translator.test.ts`

- [ ] **Step 1: Write failing tests for request validation and prompt behavior**

Add tests that expect:

```ts
import { describe, expect, it } from "vitest";
import {
  buildDeclarativePrompt,
  buildVariationPrompt,
  normalizeTranslations,
  validateTranslatorRequest,
} from "../src/lib/declarative-translator";

describe("declarative translator contract", () => {
  it("builds prompts that preserve source tone and safety guardrails", () => {
    const prompt = buildDeclarativePrompt({
      mode: "translate",
      text: "Stop running in the house",
      tone: "Humorous",
      useFewerWords: true,
      existingTranslations: [],
    });

    expect(prompt).toContain("Rewrite into 3-4 declarative alternatives");
    expect(prompt).toContain("Safety case");
    expect(prompt).toContain("Humorous");
    expect(prompt).toContain("Fewer Words is a hard filter");
    expect(prompt).not.toContain("typedText");
  });

  it("requires an interest for Interest Based requests", () => {
    const result = validateTranslatorRequest({
      mode: "translate",
      text: "Put your shoes on",
      tone: "Interest Based",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Interest Based ideas need an entered interest.");
  });

  it("validates variation requests and creates two-result variation prompts", () => {
    const request = validateTranslatorRequest({
      mode: "variation",
      text: "Put the toys upstairs in your room",
      tone: "Equalizing",
      sourceTranslation: { id: "source-1", translation: "The toys have an upstairs spot." },
      variationKind: "warmer",
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;

    const prompt = buildVariationPrompt(request.value);
    expect(prompt).toContain("exactly 2 new declarative rewrites");
    expect(prompt).toContain("Variation direction");
    expect(prompt).toContain("Original caregiver request");
  });

  it("normalizes Gemini output without accepting blank suggestions", () => {
    expect(
      normalizeTranslations([
        { translation: "  Dinner is ready. Hands first.  " },
        { translation: "" },
        { translation: "Downstairs, hands, dinner?" },
      ]),
    ).toEqual([
      { translation: "Dinner is ready. Hands first." },
      { translation: "Downstairs, hands, dinner?" },
    ]);
  });
});
```

Run: `npm test -- tests/declarative-translator.test.ts`

Expected: FAIL because `src/lib/declarative-translator.ts` does not exist.

- [ ] **Step 2: Implement minimal contract and prompt helpers**

Create `src/lib/declarative-translator.ts` with:

```ts
export type TranslatorMode = "translate" | "moreIdeas" | "variation";
export type TranslatorTone =
  | "Default"
  | "Straightforward"
  | "Humorous"
  | "Equalizing"
  | "Interest Based";
export type VariationKind =
  | "shorter"
  | "longer"
  | "warmer"
  | "more_straightforward"
  | "more_playful";

export type Translation = {
  id?: string;
  translation: string;
};

export type TranslatorRequest = {
  mode: TranslatorMode;
  text: string;
  existingTranslations?: Translation[];
  tone?: TranslatorTone;
  interest?: string;
  useFewerWords?: boolean;
  sourceTranslation?: Translation;
  variationKind?: VariationKind;
};

export type ValidationResult =
  | { ok: true; value: TranslatorRequest }
  | { ok: false; error: string; status: number };

export const translatorSystemInstruction = `You are an AI assistant named "Declarative," designed as a co-regulation tool for parents and caregivers of children with a Pathological Demand Avoidance (PDA) profile. Your primary job is to turn caregiver demands into real, sayable, low-pressure language.`;

export function validateTranslatorRequest(input: unknown): ValidationResult {
  const value = input as Partial<TranslatorRequest>;
  const mode = value.mode ?? "translate";
  const text = typeof value.text === "string" ? value.text.trim() : "";

  if (!text) return { ok: false, status: 400, error: 'Missing or invalid "text" field.' };
  if (text.length > 500) return { ok: false, status: 400, error: "Input text exceeds the maximum limit of 500 characters." };
  if (!["translate", "moreIdeas", "variation"].includes(mode)) return { ok: false, status: 400, error: 'Missing or invalid "mode" field.' };
  if (value.tone === "Interest Based" && !value.interest?.trim()) return { ok: false, status: 400, error: "Interest Based ideas need an entered interest." };
  if (mode === "variation" && !value.sourceTranslation?.translation) return { ok: false, status: 400, error: "Missing or invalid source translation." };
  if (mode === "variation" && !["shorter", "longer", "warmer", "more_straightforward", "more_playful"].includes(String(value.variationKind))) {
    return { ok: false, status: 400, error: "Missing or invalid variation kind." };
  }

  return {
    ok: true,
    value: {
      mode,
      text,
      existingTranslations: Array.isArray(value.existingTranslations) ? value.existingTranslations : [],
      tone: value.tone ?? "Default",
      interest: typeof value.interest === "string" ? value.interest.trim() : undefined,
      useFewerWords: value.useFewerWords === true,
      sourceTranslation: value.sourceTranslation,
      variationKind: value.variationKind,
    },
  };
}

export function buildDeclarativePrompt(request: TranslatorRequest) {
  const tone = request.tone ?? "Default";
  const fewerWords = request.useFewerWords
    ? " CRITICAL: Fewer Words is a hard filter: make every option materially shorter while preserving safety, sequence, location, and destination."
    : "";
  const safety = /\b(stop|slow|careful|unsafe|danger|hurt)\b/i.test(request.text) && /\b(run|running|fast|speed|jump|climb)\b/i.test(request.text)
    ? " Safety case: avoid threat/harm warnings; keep a low-pressure alternative like walking speed inside or running outside."
    : "";
  const followUp = request.existingTranslations?.length
    ? " Write 3-4 genuinely new alternatives. Treat earlier angles, openings, and sentence shapes as used."
    : "";

  return `Rewrite into 3-4 declarative alternatives that preserve full meaning while reducing pressure: "${request.text}". Address all parts.${safety} Tone: Use "${tone}" as the strategy, not decorative flavor.${fewerWords} Return only the JSON array.${followUp}`;
}

export function buildVariationPrompt(request: TranslatorRequest) {
  return `Refine one existing declarative suggestion into exactly 2 new declarative rewrites.

Original caregiver request: "${request.text}"
Selected source suggestion: "${request.sourceTranslation?.translation}"
Variation direction: "${request.variationKind}"

Return only the valid JSON array.`;
}

export function normalizeTranslations(values: Array<Partial<Translation>>) {
  return values
    .map((item) => ({ translation: String(item.translation ?? "").trim().replace(/\s+/g, " ") }))
    .filter((item) => item.translation.length > 0);
}
```

Run: `npm test -- tests/declarative-translator.test.ts`

Expected: PASS.

## Task 2: Next.js API Route With Mockable Gemini Boundary

**Files:**
- Create: `src/app/api/declarative/translate/route.ts`
- Modify: `src/lib/declarative-translator.ts`
- Test: `tests/declarative-api.test.ts`

- [ ] **Step 1: Write failing tests for route validation and privacy-safe response shape**

Test the route by importing `POST` and passing `Request` objects:

```ts
import { describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/declarative/translate/route";

describe("declarative translate route", () => {
  it("rejects invalid Interest Based requests before any model call", async () => {
    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        method: "POST",
        body: JSON.stringify({ text: "Brush teeth", tone: "Interest Based" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Interest Based ideas need an entered interest.",
    });
    expect(response.status).toBe(400);
  });

  it("returns deterministic mock translations in test mode", async () => {
    vi.stubEnv("DEV_USE_MOCK_TRANSLATIONS", "true");
    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        method: "POST",
        body: JSON.stringify({ text: "Please come down and wash your hands. It's dinner time.", tone: "Straightforward" }),
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.translations[0].translation).toContain("Dinner");
    expect(JSON.stringify(body)).not.toContain("Please come down");
    vi.unstubAllEnvs();
  });
});
```

Run: `npm test -- tests/declarative-api.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 2: Implement route using validation and mock mode**

Create the route with:

```ts
import { NextResponse } from "next/server";
import {
  buildMockDeclarativeTranslations,
  normalizeTranslations,
  validateTranslatorRequest,
} from "@/lib/declarative-translator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateTranslatorRequest(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  if (process.env.DEV_USE_MOCK_TRANSLATIONS === "true" || process.env.NODE_ENV === "test") {
    return NextResponse.json({
      translations: buildMockDeclarativeTranslations(validation.value),
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "API key not configured on server." }, { status: 500 });
  }

  return NextResponse.json({ translations: normalizeTranslations([]) }, { status: 501 });
}
```

Add `buildMockDeclarativeTranslations` to `src/lib/declarative-translator.ts` with dinner/safety/cleanup-aware deterministic suggestions.

Run: `npm test -- tests/declarative-api.test.ts`

Expected: PASS.

## Task 3: Client Translator Component

**Files:**
- Create: `src/components/DeclarativeTranslator.tsx`
- Modify: `src/app/tools/declarative-language-translator/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/declarative-translator.spec.ts`

- [ ] **Step 1: Write failing Playwright coverage for the native route**

Add e2e tests that intercept `POST /api/declarative/translate` and return mock results. Cover:

- Parent enters a phrase and receives results.
- Tone controls send the selected tone.
- Interest Based disables generation until an interest is entered.
- Fewer Words changes variation options from Shorter to Longer.
- Copy button writes a generated suggestion to clipboard.
- Donation prompt is absent before generation and visible after generation.

Run: `npm run test:e2e -- tests/e2e/declarative-translator.spec.ts --project=chromium`

Expected: FAIL because the route is still a placeholder.

- [ ] **Step 2: Build the component**

Implement `DeclarativeTranslator` with:

- Textarea and example chips.
- Tone picker: Default, Straightforward, Humorous, Equalizing, Interest Based.
- Interest input only when Interest Based is selected.
- Fewer Words toggle.
- `Get Ideas` submit button.
- Results cards with copy buttons.
- `Get more ideas` button.
- One open variation panel at a time.
- Variation buttons and cached variation results.
- Local history stored in `localStorage`.
- Inline privacy/disclaimer copy.
- Donation panel visible only after translations exist.

Run: `npm run test:e2e -- tests/e2e/declarative-translator.spec.ts --project=chromium`

Expected: PASS.

## Task 4: Privacy, Terms, and Inventory Updates

**Files:**
- Modify: `src/lib/migration-inventory.ts`
- Modify: `src/lib/tools.ts`
- Modify: `TODO.md`
- Modify: `src/components/DeclarativeTranslator.tsx`

- [ ] **Step 1: Write or extend tests for privacy guardrails**

Add unit/e2e assertions that:

- No `/api/declarative/analytics` route exists.
- API responses do not echo the submitted text.
- The UI privacy note says translations are sent to the AI service but recent history stays in the browser.
- Donation is shown only after value is delivered.

Run: `npm test && npm run test:e2e -- tests/e2e/declarative-translator.spec.ts --project=chromium`

Expected: PASS after implementation.

- [ ] **Step 2: Update product status**

Set Declarative Language Translator to `ready` in `src/lib/tools.ts`.

Update migration inventory status to:

```ts
"Native MVP migrated into the portal with prompt behavior, variations, local history, and mocked e2e coverage; live Gemini parity/eval pass still required before public launch."
```

Check off Phase 4 implementation tasks that were completed and leave live Gemini/eval verification unchecked if no key/output comparison was run.

Run: `npm test && npm run build && npm run test:e2e`

Expected: all commands pass.

## Task 5: Browser QA and Commit

**Files:**
- Modify only if verification finds a concrete issue.

- [ ] **Step 1: Start the local app**

Run: `npm run dev`

Expected: local Next.js server is reachable at `http://127.0.0.1:3000`.

- [ ] **Step 2: Run Playwright CLI smoke checks**

Use the local Playwright CLI wrapper to open `/tools/declarative-language-translator`, take a snapshot, fill a short phrase, verify results, and inspect console/network output.

- [ ] **Step 3: Run final visual QA**

Use `$playwright-interactive` or checked-in Playwright screenshots for desktop and mobile:

- Desktop route renders without overlap.
- Mobile route has no horizontal overflow.
- Loading, empty, error, copy, variation, history, and donation states are readable.

- [ ] **Step 4: Commit**

Run:

```bash
git status --short
git add .
git commit -m "Migrate Declarative translator MVP"
```

Expected: one Phase 4 commit with tests, implementation, TODO updates, and migration inventory updates.
