import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import {
  getSupportSheetExample,
  supportSheetExampleSlugs,
  supportSheetExamples,
} from "@/lib/support-sheet-examples";

export function generateStaticParams() {
  return supportSheetExampleSlugs.map((slug) => ({ slug }));
}

export default async function SupportSheetExamplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const example = getSupportSheetExample(slug);

  if (!example) {
    notFound();
  }

  return (
    <PortalShell>
      <div className="example-layout">
        <section className="panel">
          <Link className="back-link" href="/tools/support-sheet-builder/examples">
            <ArrowLeft size={16} /> All examples
          </Link>
          <span className="status" style={{ marginTop: 18 }}>
            Fictional example
          </span>
          <h1 className="page-title" style={{ marginTop: 16 }}>
            {example.title}
          </h1>
          <p className="lede">{example.summary}</p>
          <div className="example-value">
            <h2>What this shows</h2>
            <p>{example.valueStatement}</p>
            <ul className="example-meta-list">
              {example.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="cta-row">
            <Link className="button button-primary" href="/tools/support-sheet-builder">
              <ClipboardList size={17} /> Build your own support sheet
            </Link>
          </div>
        </section>

        <article className="sheet-paper example-sheet" aria-label={`${example.title} support sheet`}>
          <header className="sheet-header">
            <span className="sheet-icon" aria-hidden="true">
              <ClipboardList size={26} />
            </span>
            <div>
              <h2>{example.outputs.sheet.title}</h2>
              <p>{example.outputs.sheet.subtitle}</p>
            </div>
            <span className="sheet-date">{example.outputs.sheet.preparedAt}</span>
          </header>

          <div className="sheet-sections">
            {example.outputs.sheet.sections.map((section) => (
              <section className="sheet-section example-section" key={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="sheet-footer">{example.outputs.sheet.footer}</footer>
        </article>
      </div>

      <section className="panel">
        <h2>More examples</h2>
        <div className="example-pill-row">
          {supportSheetExamples
            .filter((item) => item.slug !== example.slug)
            .map((item) => (
              <Link
                className="button button-secondary"
                href={`/tools/support-sheet-builder/examples/${item.slug}`}
                key={item.slug}
              >
                {item.shortTitle}
              </Link>
            ))}
        </div>
      </section>

      <Footer />
    </PortalShell>
  );
}
