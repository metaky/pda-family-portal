import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolCard } from "@/components/ToolCard";
import { createPageMetadata } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata = createPageMetadata({
  title: "PDA Family Tools",
  description:
    "Free PDA-aware tools that help parents and caregivers explain less, prepare better, and share support that other adults can actually use.",
  path: "/",
});

export default function HomePage() {
  return (
    <PortalShell>
      <section className="hero">
        <div>
          <h1>Free PDA tools for the moments when you need other adults to understand.</h1>
          <p>
            Turn hard-to-say requests into lower-pressure language, make a
            one-page support sheet, and prepare for school conversations without
            starting from a blank page every time.
          </p>
          <div className="cta-row">
            <Link className="button button-primary" href="/tools/support-sheet-builder">
              <ClipboardList size={17} /> Build a support sheet
            </Link>
            <Link className="button button-secondary" href="#tools">
              See all tools <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="panel" style={{ boxShadow: "none" }}>
          <Sparkles color="var(--teal)" size={28} />
          <h2>Built for tired parents, not perfect paperwork.</h2>
          <p>
            These tools are meant for practical handoffs: something to say,
            send, print, or bring into the next conversation.
          </p>
          <div className="notice">
            <ShieldCheck size={20} />
            <p style={{ margin: 0 }}>
              No account needed for the Support Sheet Builder. No saved child
              profile on the server.
            </p>
          </div>
        </div>
      </section>

      <section id="tools">
        <h2 className="page-title" style={{ fontSize: 38, marginTop: 36 }}>
          What do you need help with today?
        </h2>
        <div className="tool-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </section>
      <Footer />
    </PortalShell>
  );
}
