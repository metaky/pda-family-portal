import Link from "next/link";
import { FileSearch, ListChecks, ShieldCheck } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";

const sections = [
  {
    title: "Analyze an IEP or 504",
    description:
      "Upload a PDF and get a PDA-aware review of goals, accommodations, behavior supports, services, and missing safeguards.",
    href: "/tools/pda-iep-advice/analyze",
    icon: FileSearch,
  },
  {
    title: "Browse Accommodations",
    description:
      "Review practical PDA-specific shifts for language, scheduling, flexibility, behavior supports, and school relationships.",
    href: "/tools/pda-iep-advice/accommodations",
    icon: ListChecks,
  },
  {
    title: "Read the Guide",
    description:
      "Learn the core IEP mindset shift from compliance to connection, co-regulation, autonomy, and nervous-system safety.",
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
          A native portal suite for reviewing school documents through a
          PDA-aware lens, preparing advocacy language, and understanding what
          safety-centered support can look like in an IEP.
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
                    Open
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
