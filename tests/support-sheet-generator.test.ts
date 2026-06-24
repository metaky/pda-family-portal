import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  addToolUrlToSupportSheetDraft,
  applySupportSheetContextPreset,
  createInitialSupportSheetDraft,
  generateSupportSheetOutputs,
  supportSheetContextPresets,
  supportSheetPresets,
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
  sectionNotes: {
    helps: "Offer a drawing pad before asking Sam to join.",
    escalationPlan: "If Sam leaves, wait by the doorway instead of following.",
  },
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

  it("uses audience-specific wording for medical and family recipients", () => {
    const medical = generateSupportSheetOutputs({
      ...baseAnswers,
      audience: "medical",
      demands: ["direct_instructions"],
      helps: ["previewing", "choices"],
    });
    const relative = generateSupportSheetOutputs({
      ...baseAnswers,
      audience: "relative",
      demands: ["direct_instructions"],
      helps: ["choices"],
    });

    expect(medical.sheet.sections[2].items.join(" ")).toContain("procedures");
    expect(medical.sheet.sections[1].items.join(" ")).toContain("consent");
    expect(relative.sheet.sections[2].items.join(" ")).toContain("collaborative");
    expect(relative.sheet.sections[2].items.join(" ")).not.toContain("procedures");
  });

  it("adds section-specific parent notes to the matching generated sections", () => {
    const outputs = generateSupportSheetOutputs(baseAnswers);
    const helps = outputs.sheet.sections.find((section) => section.title === "What Helps");
    const escalation = outputs.sheet.sections.find(
      (section) => section.title === "If Things Escalate",
    );
    const avoid = outputs.sheet.sections.find((section) => section.title === "Please Avoid");

    expect(helps?.items.at(-1)).toBe("Offer a drawing pad before asking Sam to join.");
    expect(escalation?.items.at(-1)).toBe(
      "If Sam leaves, wait by the doorway instead of following.",
    );
    expect(avoid?.items.join(" ")).not.toContain("drawing pad");
  });

  it("provides non-sensitive sample presets for common audiences", () => {
    expect(supportSheetPresets.map((preset) => preset.audience)).toEqual([
      "teacher",
      "relative",
      "childcare",
      "medical",
      "activity",
    ]);

    for (const preset of supportSheetPresets) {
      expect(preset.label).toMatch(/example/i);
      expect(preset.answers.child.name).toMatch(/^(Riley|Jordan|Avery|Morgan|Casey)$/);
      expect(preset.answers.customNotes).not.toContain("Sam");
    }
  });

  it("applies optional context starters without replacing child details", () => {
    expect(supportSheetContextPresets.map((preset) => preset.id)).toEqual([
      "school_year",
      "appointment",
      "activity",
    ]);

    const schoolYear = applySupportSheetContextPreset(baseAnswers, "school_year");
    const appointment = applySupportSheetContextPreset(baseAnswers, "appointment");
    const activity = applySupportSheetContextPreset(baseAnswers, "activity");

    expect(schoolYear.child).toEqual(baseAnswers.child);
    expect(schoolYear.audience).toBe("teacher");
    expect(schoolYear.helps).toContain("previewing");
    expect(schoolYear.sectionNotes.about).toContain("school year");
    expect(schoolYear.sectionNotes.escalationPlan).toBe(baseAnswers.sectionNotes.escalationPlan);

    expect(appointment.audience).toBe("medical");
    expect(appointment.helps).toContain("opt_out");
    expect(appointment.sectionNotes.helps).toMatch(/consent/i);

    expect(activity.audience).toBe("activity");
    expect(activity.helps).toContain("trusted_adult");
    expect(activity.sectionNotes.recovery).toContain("rejoin");
  });

  it("does not introduce a Support Sheet Builder API route or server persistence path", () => {
    const projectRoot = join(__dirname, "..");

    expect(existsSync(join(projectRoot, "src/app/api/support-sheet"))).toBe(false);
    expect(existsSync(join(projectRoot, "src/app/api/support-sheet-builder"))).toBe(false);
    expect(existsSync(join(projectRoot, "src/server/support-sheet.ts"))).toBe(false);
  });

  it("adds a quiet editable tool URL footer without child data or query strings", () => {
    const draft = createInitialSupportSheetDraft(baseAnswers);
    const withToolUrl = addToolUrlToSupportSheetDraft(
      draft,
      "https://example.org/tools/support-sheet-builder?child=Sam&source=email",
    );

    expect(withToolUrl.sheet.footer).toBe(
      "Created with the free PDA Support Sheet Builder: https://example.org/tools/support-sheet-builder",
    );
    expect(withToolUrl.email).toContain(
      "Created with the free PDA Support Sheet Builder: https://example.org/tools/support-sheet-builder",
    );
    expect(withToolUrl.sheet.footer).not.toContain("Sam");
    expect(withToolUrl.sheet.footer).not.toContain("?");
    expect(withToolUrl.shortText).toBe(draft.shortText);
  });
});
