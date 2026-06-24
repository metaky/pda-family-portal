import Link from "next/link";
import { AlertTriangle, CheckCircle2, Heart, Shield, Sparkles } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "PDA IEP Advice: Guide",
  description:
    "Learn how PDA-aware IEP support shifts from compliance to connection, co-regulation, autonomy, and nervous-system safety.",
  path: "/tools/pda-iep-advice/guide",
});

export default function PdaIepGuidePage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">PDA IEP Advice</span>
        <h1 className="page-title">PDA IEP Advice: Guide</h1>
        <p className="lede">
          A PDA-affirming IEP starts with a foundational shift: behavior is not
          treated as defiance to overcome, but as nervous-system communication
          that needs safety, autonomy, and co-regulation.
        </p>
        <div className="cta-row">
          <Link className="button button-primary" href="/tools/pda-iep-advice/analyze">
            Analyze your IEP
          </Link>
          <Link className="button button-secondary" href="/tools/pda-iep-advice/accommodations">
            Browse accommodations
          </Link>
        </div>
      </section>

      <div className="content-stack">
        <section className="content-section panel">
          <div className="content-section-heading">
            <span className="content-icon" aria-hidden="true">
              <Sparkles size={24} />
            </span>
            <h2>A Foundational Shift</h2>
          </div>
          <div className="comparison-grid large">
            <div>
              <h3>
                <AlertTriangle size={18} aria-hidden="true" /> Traditional view
              </h3>
              <ul>
                <li>Behavior is framed as choice or defiance.</li>
                <li>Rewards and consequences are used to motivate.</li>
                <li>The goal is compliance and obedience.</li>
              </ul>
            </div>
            <div>
              <h3>
                <Heart size={18} aria-hidden="true" /> PDA reality
              </h3>
              <ul>
                <li>Behavior is often a survival response.</li>
                <li>Safety and connection make skills more available.</li>
                <li>The goal is regulation, trust, and flexible participation.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-section panel">
          <div className="content-section-heading">
            <span className="content-icon" aria-hidden="true">
              <Shield size={24} />
            </span>
            <h2>Compliance to Connection and Co-regulation</h2>
          </div>
          <p>
            The most important IEP shift is moving away from compliance-first
            language. A PDA-aware plan names what adults will do to lower threat,
            reduce demands, preserve dignity, and help the student recover.
          </p>
          <div className="principle-grid">
            <article>
              <strong>Autonomy</strong>
              <p>
                Build in choices, opt-out paths, flexible task order, and shared
                decision-making.
              </p>
            </article>
            <article>
              <strong>Equality</strong>
              <p>
                Use collaborative language, avoid power struggles, and keep staff
                positioned as allies.
              </p>
            </article>
            <article>
              <strong>Lowering Demands</strong>
              <p>
                Adjust expectations based on regulation, not ability, and reduce
                workload or adult language when distress rises.
              </p>
            </article>
          </div>
        </section>

        <section className="content-section panel">
          <h2>The Three Pillars of Safety</h2>
          <div className="table-card">
            <div className="table-row table-head">
              <strong>Traditional or unhelpful</strong>
              <strong>PDA-affirming alternative</strong>
            </div>
            <div className="table-row">
              <span>Rigid first/then schedule</span>
              <span>Flexible rhythm or visual menu</span>
            </div>
            <div className="table-row">
              <span>Token boards and sticker charts</span>
              <span>Natural motivation, novelty, and relationship safety</span>
            </div>
            <div className="table-row">
              <span>Forced social skills group</span>
              <span>Optional groups, buddy systems, or parallel participation</span>
            </div>
            <div className="table-row">
              <span>Linear prescribed tasks</span>
              <span>Shared demands, starting in the middle, or choice of method</span>
            </div>
          </div>
        </section>

        <section className="content-section panel">
          <h2>Meaningful Goals</h2>
          <p>
            Goals should support long-term well-being, self-advocacy, flexible
            participation, and regulation. They should not simply measure how
            often a student complies.
          </p>
          <div className="goal-example">
            <div>
              <span>Problematic goal</span>
              <p>Student will complete 80% of worksheets independently.</p>
            </div>
            <div>
              <span>PDA-affirming goal</span>
              <p>
                When given executive-functioning supports and choice, learner
                will begin the task using one agreed support option on 4 of 5
                opportunities.
              </p>
            </div>
          </div>
          <p className="why-row">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>
              A useful IEP is a living plan built on trust, flexibility, and a
              clear description of what adults will do differently.
            </span>
          </p>
        </section>
      </div>
      <Footer />
    </PortalShell>
  );
}
