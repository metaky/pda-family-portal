import { describe, expect, it } from "vitest";
import { pathToFileURL } from "node:url";
import {
  buildDeclarativePrompt,
  buildVariationPrompt,
  normalizeTranslations,
  translatorSystemInstruction,
  validateTranslatorRequest,
} from "../src/lib/declarative-translator";

async function loadSourcePromptModule() {
  return import(
    pathToFileURL(
      "/Users/kyle.wegner/Dev Projects/declarative/services/translationPrompt.js",
    ).href
  ) as Promise<{
    buildTranslationPrompt: (request: {
      existingTranslations?: Array<{ translation: string }>;
      interest?: string;
      text: string;
      tone?: string;
      useFewerWords?: boolean;
    }) => string;
    buildVariationPrompt: (request: {
      interest?: string;
      sourceTranslation: string;
      text: string;
      tone?: string;
      useFewerWords?: boolean;
      variationKind?: string;
    }) => string;
    systemInstruction: string;
  }>;
}

describe("declarative translator contract", () => {
  it("builds prompts that preserve source tone and safety guardrails", () => {
    const prompt = buildDeclarativePrompt({
      existingTranslations: [],
      mode: "translate",
      text: "Stop running in the house",
      tone: "Humorous",
      useFewerWords: true,
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
      sourceTranslation: {
        id: "source-1",
        translation: "The toys have an upstairs spot.",
      },
      text: "Put the toys upstairs in your room",
      tone: "Equalizing",
      variationKind: "warmer",
    });

    expect(request.ok).toBe(true);
    if (!request.ok) {
      return;
    }

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

  it("includes source guardrails for Pokemon dinner and cleanup prompts", () => {
    const dinnerPrompt = buildDeclarativePrompt({
      interest: "Pokemon",
      mode: "translate",
      text: "Please come down and wash your hands. It's dinner time.",
      tone: "Interest Based",
      useFewerWords: true,
    });
    const cleanupPrompt = buildDeclarativePrompt({
      interest: "Pokemon",
      mode: "translate",
      text: "Pick up your toys and put them away upstairs in your room",
      tone: "Interest Based",
      useFewerWords: true,
    });

    expect(dinnerPrompt).toContain("Bad shapes");
    expect(dinnerPrompt).toContain("Pokemon hand wash");
    expect(dinnerPrompt).toContain("Pikachu/speed");
    expect(cleanupPrompt).toContain("do not use Poke-stop");
    expect(cleanupPrompt).toContain("Pokemon toys");
    expect(cleanupPrompt).toContain("Toys to the Poke-stop upstairs");
  });

  it("matches the existing Declarative app master prompt exactly", async () => {
    const sourcePrompt = await loadSourcePromptModule();

    expect(translatorSystemInstruction).toBe(sourcePrompt.systemInstruction);
  });

  it("matches the existing Declarative app translation prompt for tone, fewer words, and follow-up behavior", async () => {
    const sourcePrompt = await loadSourcePromptModule();
    const request = {
      existingTranslations: [
        { translation: "The car is ready, and shoes are part of getting out the door." },
        { translation: "It looks like shoes and heading to the car are the next part." },
      ],
      interest: "Pokemon",
      mode: "moreIdeas" as const,
      text: "Please come down and wash your hands. It's dinner time.",
      tone: "Interest Based" as const,
      useFewerWords: true,
    };

    expect(buildDeclarativePrompt(request)).toBe(
      sourcePrompt.buildTranslationPrompt(request),
    );
  });

  it("matches the existing Declarative app variation prompt for tone and fewer words behavior", async () => {
    const sourcePrompt = await loadSourcePromptModule();
    const request = {
      interest: "Dinosaurs",
      mode: "variation" as const,
      sourceTranslation: {
        translation:
          "The bathroom is the next dinosaur stop, and bedtime still has room for teeth plus a dinosaur companion.",
      },
      text: "Please come to the bathroom, brush your teeth, and bring your dinosaur to bed.",
      tone: "Interest Based" as const,
      useFewerWords: false,
      variationKind: "warmer" as const,
    };

    expect(buildVariationPrompt(request)).toBe(
      sourcePrompt.buildVariationPrompt({
        ...request,
        sourceTranslation: request.sourceTranslation.translation,
      }),
    );
  });
});
