import { describe, expect, it } from "vitest";
import {
  getSupportSheetExample,
  supportSheetExampleSlugs,
  supportSheetExamples,
} from "../src/lib/support-sheet-examples";

describe("support sheet public examples", () => {
  it("defines stable example routes for the five common sharing audiences", () => {
    expect(supportSheetExampleSlugs).toEqual([
      "teacher",
      "family",
      "childcare",
      "medical-provider",
      "activity-leader",
    ]);

    expect(supportSheetExamples.map((example) => example.audience)).toEqual([
      "teacher",
      "relative",
      "childcare",
      "medical",
      "activity",
    ]);
  });

  it("uses fictional sample data and no real child identifiers", () => {
    const sampleNames = supportSheetExamples.map((example) => example.answers.child.name);

    expect(sampleNames).toEqual(["Riley", "Jordan", "Avery", "Morgan", "Casey"]);
    for (const example of supportSheetExamples) {
      expect(example.isFictional).toBe(true);
      expect(example.answers.child.connectionPoints).not.toMatch(/school name|teacher name/i);
      expect(example.outputs.email).not.toContain("Kyle");
    }
  });

  it("makes each example's value clear before a parent enters form data", () => {
    for (const example of supportSheetExamples) {
      expect(example.title).toMatch(/example/i);
      expect(example.valueStatement.length).toBeGreaterThan(70);
      expect(example.bestFor.length).toBeGreaterThanOrEqual(3);
      expect(example.outputs.sheet.sections).toHaveLength(8);
      expect(example.outputs.email).toContain(example.answers.child.name);
    }
  });

  it("looks up examples by route slug", () => {
    const medical = getSupportSheetExample("medical-provider");
    const missing = getSupportSheetExample("not-real");

    expect(medical?.title).toBe("Dentist or provider example");
    expect(medical?.outputs.sheet.sections[1].items.join(" ")).toContain("consent");
    expect(missing).toBeUndefined();
  });
});
