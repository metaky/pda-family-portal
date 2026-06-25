import type { AudienceKey } from "./support-sheet";

export type ToolStatus = "quick" | "school";

export type PortalTool = {
  title: string;
  href: string;
  description: string;
  status: ToolStatus;
  job: string;
};

export const tools: PortalTool[] = [
  {
    title: "Declarative Language Translator",
    href: "/tools/declarative-language-translator",
    description: "When you know a request may land badly, get a few lower-pressure ways to say the same thing.",
    status: "quick",
    job: "Type the sentence you were about to say. Pick wording that is easier to hear.",
  },
  {
    title: "Support Sheet Builder",
    href: "/tools/support-sheet-builder",
    description: "Make a calm one-page guide for the next teacher, relative, sitter, coach, or provider.",
    status: "quick",
    job: "Answer a few prompts once. Get something you can print, copy, or send.",
  },
  {
    title: "PDA IEP Advice",
    href: "/tools/pda-iep-advice",
    description: "Look at school plans through a PDA-aware lens before a meeting, email, or revision request.",
    status: "school",
    job: "Upload a plan or browse examples. Leave with clearer advocacy language.",
  },
  {
    title: "PDA Behavior Report Help",
    href: "/tools/pda-behavior-report-help",
    description: "Compare an incident report with the supports your child was supposed to receive.",
    status: "school",
    job: "Spot missed supports and prepare calmer, more specific follow-up questions.",
  },
];

export const audienceQuickStarts: Record<AudienceKey, string> = {
  teacher: "Useful for a new teacher, classroom change, meeting follow-up, or staff handoff.",
  substitute: "Keep this short enough for someone stepping in during a busy school day.",
  relative: "Explain what helps without turning family support into a discipline debate.",
  childcare: "Focus on safety, contact details, and what to try before things escalate.",
  activity: "Help coaches and leaders support participation without public pressure.",
  medical: "Give providers a consent, previewing, and pause plan before the appointment starts.",
  custom: "Use this for any adult or setting that does not fit the common templates.",
};
