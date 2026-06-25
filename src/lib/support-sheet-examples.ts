import {
  createInitialSupportSheetDraft,
  supportSheetPresets,
  type AudienceKey,
  type EditableSupportSheetDraft,
  type SupportSheetAnswers,
} from "./support-sheet";

export type SupportSheetExample = {
  slug: string;
  audience: AudienceKey;
  title: string;
  shortTitle: string;
  summary: string;
  valueStatement: string;
  bestFor: string[];
  answers: SupportSheetAnswers;
  outputs: EditableSupportSheetDraft;
  isFictional: true;
};

type ExampleDefinition = {
  audience: AudienceKey;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  valueStatement: string;
  bestFor: string[];
};

const exampleDefinitions: ExampleDefinition[] = [
  {
    audience: "teacher",
    slug: "teacher",
    title: "Teacher example",
    shortTitle: "Teacher",
    summary: "A school handoff for participation, transitions, and early support before stress builds.",
    valueStatement:
      "See how a parent can give school staff a credible one-page guide without writing a long defensive email or expecting a teacher to read a full PDA article.",
    bestFor: ["new classroom teams", "start-of-year handoffs", "meeting follow-up"],
  },
  {
    audience: "relative",
    slug: "family",
    title: "Grandparent or relative example",
    shortTitle: "Family",
    summary: "A family-facing note that explains support without starting a discipline debate.",
    valueStatement:
      "See how the sheet can explain why low-pressure support is practical care, not permissive parenting, while still keeping the language calm enough to send.",
    bestFor: ["grandparents", "aunts and uncles", "holiday visits"],
  },
  {
    audience: "childcare",
    slug: "childcare",
    title: "Babysitter or childcare example",
    shortTitle: "Childcare",
    summary: "A practical care note for safety, early stress signs, and when to contact the parent.",
    valueStatement:
      "See how a short handoff can help a caregiver understand what to avoid, what to try first, and when to call, without needing private family history.",
    bestFor: ["babysitters", "childcare handoffs", "short-term caregivers"],
  },
  {
    audience: "medical",
    slug: "medical-provider",
    title: "Dentist or provider example",
    shortTitle: "Provider",
    summary: "An appointment note centered on consent, previewing, pauses, and recovery.",
    valueStatement:
      "See how the builder turns appointment concerns into concrete support language a dentist, doctor, therapist, or evaluator can use quickly.",
    bestFor: ["dentist visits", "doctor appointments", "therapy or evaluation sessions"],
  },
  {
    audience: "activity",
    slug: "activity-leader",
    title: "Coach, camp, or activity example",
    shortTitle: "Activities",
    summary: "A participation note for group activities where pressure, public correction, or praise can backfire.",
    valueStatement:
      "See how a parent can ask for flexible participation and dignity-preserving support without asking a coach or leader to learn everything about PDA first.",
    bestFor: ["coaches", "camp staff", "club or lesson leaders"],
  },
];

function presetForAudience(audience: AudienceKey) {
  const preset = supportSheetPresets.find((item) => item.audience === audience);

  if (!preset) {
    throw new Error(`Missing support sheet preset for ${audience}`);
  }

  return preset;
}

export const supportSheetExamples: SupportSheetExample[] = exampleDefinitions.map((definition) => {
  const preset = presetForAudience(definition.audience);

  return {
    ...definition,
    answers: preset.answers,
    outputs: createInitialSupportSheetDraft(preset.answers),
    isFictional: true,
  };
});

export const supportSheetExampleSlugs = supportSheetExamples.map((example) => example.slug);

export function getSupportSheetExample(slug: string) {
  return supportSheetExamples.find((example) => example.slug === slug);
}
