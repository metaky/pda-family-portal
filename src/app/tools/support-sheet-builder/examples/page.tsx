import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";
import { supportSheetExamples } from "@/lib/support-sheet-examples";

export const metadata = createPageMetadata({
  title: "Support Sheet Examples",
  description:
    "Preview fictional PDA support sheet examples before entering your own family details.",
  path: "/tools/support-sheet-builder/examples",
});

export default function SupportSheetExamplesPage() {
  return (
    <PortalShell>
      <section className="panel">
        <span className="status">Public examples</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          Support Sheet Examples
        </h1>
        <p className="lede">
          Preview fictional examples before entering child details.
        </p>
        <div className="notice">
          <ShieldCheck size={22} aria-hidden="true" />
          <p style={{ margin: 0 }}>
            These samples use fictional children and common situations. They show
            the kind of handoff the builder creates without asking for your
            family&apos;s information first.
          </p>
        </div>
        <div className="cta-row">
          <Link className="button button-primary" href="/tools/support-sheet-builder">
            <ClipboardList size={17} /> Build your own support sheet
          </Link>
        </div>
      </section>

      <section className="example-card-grid" aria-label="Support sheet example routes">
        {supportSheetExamples.map((example) => (
          <Link
            className="example-card"
            href={`/tools/support-sheet-builder/examples/${example.slug}`}
            key={example.slug}
          >
            <span className="status">Fictional example</span>
            <h2>{example.title}</h2>
            <p>{example.summary}</p>
            <span className="example-card-link">
              View example <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>

      <Footer />
    </PortalShell>
  );
}
