import Link from "next/link";
import { AlertTriangle, CheckCircle2, Heart, Shield, Sparkles } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "PDA IEP Support Guide",
  description:
    "Understand the PDA-aware shift parents can ask school teams to make in IEP and 504 supports.",
  path: "/tools/pda-iep-advice/guide",
});

export default function PdaIepGuidePage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">PDA IEP Advice</span>
        <h1 className="page-title">PDA IEP Support Guide</h1>
        <p className="lede">
          If school support keeps becoming a fight over compliance, start here.
          A PDA-aware plan names what adults will do to reduce threat, preserve
          dignity, and help the student recover.
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
            <h2>The Shift to Ask For</h2>
          </div>
          <div className="comparison-grid large">
            <div>
              <h3>
                <AlertTriangle size={18} aria-hidden="true" /> Traditional view
              </h3>
              <ul>
                <li>Behavior is framed as choice or defiance.</li>
                <li>Rewards and consequences are used to motivate.</li>
                <li>The goal is compliance, obedience, or proving the student can do it.</li>
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
            language. A useful plan names what adults will do differently when
            stress rises, instead of putting all the burden on the student to
            cope better.
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
          <h2>Common Plan Language to Reconsider</h2>
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
            participation, and regulation. If a goal mostly measures compliance,
            it may create more pressure than support.
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
