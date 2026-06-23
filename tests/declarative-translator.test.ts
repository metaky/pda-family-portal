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
});
