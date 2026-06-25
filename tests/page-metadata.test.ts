import { describe, expect, it } from "vitest";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as donateMetadata } from "@/app/donate/page";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as migrationMetadata } from "@/app/migration-inventory/page";
import { metadata as privacyMetadata } from "@/app/privacy/page";
import { metadata as termsMetadata } from "@/app/terms/page";
import { metadata as declarativeMetadata } from "@/app/tools/declarative-language-translator/page";
import { metadata as behaviorReportMetadata } from "@/app/tools/pda-behavior-report-help/page";
import { metadata as pdaIepMetadata } from "@/app/tools/pda-iep-advice/page";
import { metadata as pdaIepAccommodationsMetadata } from "@/app/tools/pda-iep-advice/accommodations/page";
import { metadata as pdaIepAnalyzeMetadata } from "@/app/tools/pda-iep-advice/analyze/page";
import { metadata as pdaIepGuideMetadata } from "@/app/tools/pda-iep-advice/guide/page";
import { metadata as supportSheetMetadata } from "@/app/tools/support-sheet-builder/page";
import { metadata as supportSheetExamplesMetadata } from "@/app/tools/support-sheet-builder/examples/page";
import { generateMetadata as generateExampleMetadata } from "@/app/tools/support-sheet-builder/examples/[slug]/page";

const staticPages = [
  { metadata: homeMetadata, path: "/", title: "PDA Family Tools" },
  { metadata: aboutMetadata, path: "/about", title: "About PDA Family Tools" },
  { metadata: privacyMetadata, path: "/privacy", title: "Privacy and Safety" },
  { metadata: termsMetadata, path: "/terms", title: "Terms of Use" },
  { metadata: donateMetadata, path: "/donate", title: "Keep PDA Family Tools Free" },
  {
    metadata: migrationMetadata,
    path: "/migration-inventory",
    title: "How These Tools Are Built",
  },
  {
    metadata: declarativeMetadata,
    path: "/tools/declarative-language-translator",
    title: "Declarative Language Translator",
  },
  {
    metadata: supportSheetMetadata,
    path: "/tools/support-sheet-builder",
    title: "Support Sheet Builder",
  },
  {
    metadata: supportSheetExamplesMetadata,
    path: "/tools/support-sheet-builder/examples",
    title: "Support Sheet Examples",
  },
  { metadata: pdaIepMetadata, path: "/tools/pda-iep-advice", title: "PDA IEP Advice" },
  {
    metadata: pdaIepAnalyzeMetadata,
    path: "/tools/pda-iep-advice/analyze",
    title: "Review an IEP or 504 Plan",
  },
  {
    metadata: pdaIepAccommodationsMetadata,
    path: "/tools/pda-iep-advice/accommodations",
    title: "PDA-Aware Accommodation Ideas",
  },
  {
    metadata: pdaIepGuideMetadata,
    path: "/tools/pda-iep-advice/guide",
    title: "PDA IEP Support Guide",
  },
  {
    metadata: behaviorReportMetadata,
    path: "/tools/pda-behavior-report-help",
    title: "PDA Behavior Report Help",
  },
];

describe("page metadata", () => {
  it.each(staticPages)(
    "sets title, description, and canonical path for $path",
    ({ metadata, path, title }) => {
      expect(metadata.title).toBe(title);
      expect(metadata.description).toEqual(expect.any(String));
      expect(metadata.description).not.toBe("");
      expect(metadata.alternates).toMatchObject({ canonical: path });
      expect(metadata.openGraph).toMatchObject({
        title,
        description: metadata.description,
        url: path,
      });
    },
  );

  it("sets canonical metadata for support sheet example pages", async () => {
    const metadata = await generateExampleMetadata({
      params: Promise.resolve({ slug: "teacher" }),
    });

    expect(metadata.title).toBe("Teacher example");
    expect(metadata.description).toBe(
      "A school handoff for participation, transitions, and early support before stress builds.",
    );
    expect(metadata.alternates).toMatchObject({
      canonical: "/tools/support-sheet-builder/examples/teacher",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Teacher example",
      url: "/tools/support-sheet-builder/examples/teacher",
    });
  });
});
