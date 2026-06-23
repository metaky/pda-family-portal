import type { AudienceKey } from "./support-sheet";

export type ToolStatus = "ready" | "migration-planned";

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
    description: "Turn direct, demand-heavy language into more declarative, autonomy-preserving phrasing.",
    status: "ready",
    job: "Type a phrase. Get gentler PDA-aware wording.",
  },
  {
    title: "Support Sheet Builder",
    href: "/tools/support-sheet-builder",
    description: "Create a one-page guide for adults who need to understand and support your PDA child.",
    status: "ready",
    job: "Answer a few prompts. Get printable, copyable handoffs.",
  },
  {
    title: "PDA IEP Advice",
    href: "/tools/pda-iep-advice",
    description: "Review IEPs, 504 plans, accommodations, and school supports through a PDA-aware lens.",
    status: "migration-planned",
    job: "Put in effort once. Strengthen school advocacy.",
  },
  {
    title: "PDA Behavior Report Help",
    href: "/tools/pda-behavior-report-help",
    description: "Review behavior incident reports against documented supports and identify practical next steps.",
    status: "migration-planned",
    job: "Understand what happened and what support may have been missed.",
  },
];

export const audienceQuickStarts: Record<AudienceKey, string> = {
  teacher: "School staff need a credible one-page guide they can use during busy routines.",
  substitute: "Substitutes need the shortest path to keeping the day calm.",
  relative: "Family members often need language that explains support without sounding like a debate about discipline.",
  childcare: "Caregivers need safety, contact, and what to do when things start going sideways.",
  activity: "Activity leaders need flexible participation guidance without public pressure.",
  medical: "Providers need consent, previewing, and a lower-demand appointment plan.",
  custom: "Use this when the adult or setting does not fit the common templates.",
};
