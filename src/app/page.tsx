import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <PortalShell>
      <section className="hero">
        <div>
          <h1>Free PDA tools that reduce the explaining.</h1>
          <p>
            A portal for practical, low-input tools that help families translate
            demands, prepare school advocacy, review behavior reports, and share
            one-page support guidance with the next adult.
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
          <h2>Output first, no daily loop.</h2>
          <p>
            The MVP starts with a no-login Support Sheet Builder. Child details
            stay in the browser, and the result is printable, editable, and
            copyable.
          </p>
          <div className="notice">
            <ShieldCheck size={20} />
            <p style={{ margin: 0 }}>
              No server-side child profile storage for Support Sheet Builder.
            </p>
          </div>
        </div>
      </section>

      <section id="tools">
        <h2 className="page-title" style={{ fontSize: 38, marginTop: 36 }}>
          Tools
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
