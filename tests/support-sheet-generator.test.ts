import { describe, expect, it } from "vitest";
import {
  createInitialSupportSheetDraft,
  generateSupportSheetOutputs,
  type SupportSheetAnswers,
} from "../src/lib/support-sheet";

const baseAnswers: SupportSheetAnswers = {
  audience: "teacher",
  child: {
    name: "Sam",
    pronouns: "they/them",
    ageRange: "elementary",
    connectionPoints: "Minecraft, drawing, animals",
  },
  helps: ["choices", "extra_processing_time", "indirect_language"],
  demands: ["direct_instructions", "being_rushed", "public_correction"],
  distressSigns: ["goes_quiet", "negotiates_or_delays", "leaves_area"],
  avoid: ["pushing_through_refusal", "public_consequences", "debating"],
  escalationPlan: ["reduce_language", "create_space", "remove_demand"],
  recovery: ["time_alone", "no_post_event_lecture", "reconnect_without_shame"],
  contactNote: "Text me if the day is getting hard.",
  customNotes: "Sam does best when adults sound curious instead of firm.",
};

describe("support sheet generator", () => {
  it("creates audience-specific one-page sections from structured answers", () => {
    const outputs = generateSupportSheetOutputs(baseAnswers);

    expect(outputs.sheet.title).toBe("How to Support Sam");
    expect(outputs.sheet.subtitle).toContain("school");
    expect(outputs.sheet.sections.map((section) => section.title)).toEqual([
      "About Sam",
      "What Helps",
      "What May Feel Like Pressure",
      "Early Signs of Distress",
      "Please Avoid",
      "If Things Escalate",
      "Recovery and Afterward",
      "Parent / Caregiver Note",
    ]);
    expect(outputs.sheet.sections[1].items.join(" ")).toContain("choices");
  });

  it("generates copyable email and short text outputs without requiring server storage", () => {
    const outputs = generateSupportSheetOutputs(baseAnswers);

    expect(outputs.email).toContain("I wanted to share a short support guide for Sam");
    expect(outputs.email).toContain("Created with the free PDA Support Sheet Builder");
    expect(outputs.shortText).toContain("Quick note for supporting Sam");
    expect(outputs.shortText.length).toBeLessThan(650);
    expect(outputs.privacyNote).toContain("does not require an account");
  });

  it("creates an editable draft object with all generated output fields", () => {
    const draft = createInitialSupportSheetDraft(baseAnswers);

    expect(draft.sheet.sections).toHaveLength(8);
    expect(draft.email.length).toBeGreaterThan(200);
    expect(draft.shortText.length).toBeGreaterThan(80);
    expect(draft.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
