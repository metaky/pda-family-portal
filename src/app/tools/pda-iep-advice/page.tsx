import Link from "next/link";
import { FileSearch, ListChecks, ShieldCheck } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "PDA IEP Advice",
  description:
    "Prepare for school meetings and plan revisions with PDA-aware IEP and 504 support.",
  path: "/tools/pda-iep-advice",
});

const sections = [
  {
    title: "Analyze an IEP or 504",
    description:
      "Upload a PDF and get a practical review of goals, accommodations, behavior supports, services, and missing safeguards.",
    href: "/tools/pda-iep-advice/analyze",
    icon: FileSearch,
  },
  {
    title: "Browse Accommodations",
    description:
      "Find PDA-aware accommodation ideas you can adapt for meetings, emails, or draft plan language.",
    href: "/tools/pda-iep-advice/accommodations",
    icon: ListChecks,
  },
  {
    title: "Understand the Shift",
    description:
      "See why PDA support often needs to move from compliance pressure toward safety, autonomy, and co-regulation.",
    href: "/tools/pda-iep-advice/guide",
    icon: ShieldCheck,
  },
];

export default function PdaIepAdvicePage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">PDA IEP Advice</span>
        <h1 className="page-title">PDA IEP Advice</h1>
        <p className="lede">
          Tools for parents and caregivers who need to ask better school
          questions, strengthen support language, and explain why a PDA-aware
          plan has to protect autonomy and relationship safety.
        </p>
      </section>

      <div className="content-stack">
        <section className="content-section panel">
          <div className="principle-grid">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.href}>
                  <Icon size={22} aria-hidden="true" />
                  <strong>{section.title}</strong>
                  <p>{section.description}</p>
                  <Link className="button button-secondary" href={section.href}>
                    Start here
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </PortalShell>
  );
}
