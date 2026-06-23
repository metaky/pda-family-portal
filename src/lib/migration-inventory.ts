export type MigrationInventoryItem = {
  feature: string;
  portalRoute: string;
  sourceProject: string;
  status: string;
  sourceFiles: string[];
  portingNotes: string[];
};

export const migrationInventory: MigrationInventoryItem[] = [
  {
    feature: "Declarative Language Translator",
    portalRoute: "/tools/declarative-language-translator",
    sourceProject: "/Users/kyle.wegner/Dev Projects/declarative",
    status:
      "Native MVP migrated into the portal with prompt behavior, variations, local history, privacy guardrails, mocked e2e coverage, and live Gemini route support; source eval parity still needs a live-key pass.",
    sourceFiles: [
      "components/Translator.tsx",
      "services/geminiService.ts",
      "services/translationPrompt.js",
      "services/translationUtils.ts",
      "services/historyStorage.ts",
      "services/analytics.ts",
      "components/DonationCallout.tsx",
      "components/PrivacyPolicy.tsx",
      "components/TermsOfService.tsx",
      "evals/gemini-translation-prompt-set.json",
      "evals/gemini-quality-rubric.md",
      "server.js",
    ],
    portingNotes: [
      "Preserve the fast input-output loop, tone variants, saved history behavior, and variation guardrails.",
      "Port prompt/eval assets before changing the translator output behavior.",
      "Keep analytics away from typed phrases and generated child/family content.",
    ],
  },
  {
    feature: "PDA IEP Advice",
    portalRoute: "/tools/pda-iep-advice",
    sourceProject: "/Users/kyle.wegner/Antigravity",
    status: "Native route stubbed; analyzer migration pending.",
    sourceFiles: [
      "src/app/analyze/page.tsx",
      "src/components/analyze-page-client.tsx",
      "src/components/upload-zone.tsx",
      "src/lib/rag-engine.ts",
      "src/lib/server/uploads.ts",
      "src/lib/server/security.ts",
      "src/lib/server/api-types.ts",
      "src/data/rag_docs/",
      "src/app/accommodations/page.tsx",
      "src/app/pda-guide/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/privacy-policy/page.tsx",
      "src/app/terms/page.tsx",
      "tests/critical-flows.spec.ts",
      "tests/analyze.spec.ts",
      "tests/api.spec.ts",
    ],
    portingNotes: [
      "Reuse the upload, PDF extraction, RAG, security, privacy, and testing patterns from the source app.",
      "Preserve the privacy-conscious upload stance and human verification behavior.",
      "Rename the product surface to PDA IEP Advice while retaining proven prompts and school-support content.",
    ],
  },
  {
    feature: "PDA Behavior Report Help",
    portalRoute: "/tools/pda-behavior-report-help",
    sourceProject: "/Users/kyle.wegner/Antigravity",
    status: "Standalone native route stubbed; behavior-report migration pending.",
    sourceFiles: [
      "src/app/behavior-report/page.tsx",
      "src/components/behavior-report-page-client.tsx",
      "src/components/dual-upload-zone.tsx",
      "src/lib/analyze-report-normalization.ts",
      "src/lib/rag-engine.ts",
      "src/lib/server/uploads.ts",
      "src/lib/server/security.ts",
      "src/lib/server/api-types.ts",
      "src/app/privacy/page.tsx",
      "src/app/privacy-policy/page.tsx",
      "src/app/terms/page.tsx",
      "tests/behavior-report.spec.ts",
      "tests/api.spec.ts",
    ],
    portingNotes: [
      "Keep this as its own portal feature, even though the source functionality lives inside PDA Your IEP.",
      "Preserve the dual-upload flow comparing behavior reports against an IEP or 504 plan.",
      "Keep output focused on missed supports, context, PDA-aware interpretation, and next steps.",
    ],
  },
];
