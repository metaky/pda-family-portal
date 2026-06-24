import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
} from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "PDA IEP Advice: Accommodations",
  description:
    "Browse PDA-aware IEP accommodation ideas for language, flexibility, behavior support, scheduling, and school relationships.",
  path: "/tools/pda-iep-advice/accommodations",
});

const accommodationSections = [
  {
    title: "Language and Communication",
    icon: MessageCircle,
    items: [
      {
        title: "Use of Declarative Language",
        description:
          "Staff use observations, statements of fact, and I wonder language instead of direct commands whenever safety allows.",
        standard:
          "Standard plans often rely on clear direct commands, such as put on your coat.",
        pda:
          "Direct commands can feel like a threat. Declarative language invites collaboration while preserving autonomy.",
        why:
          "It lowers the demand signal so the student has more room to initiate the action themselves.",
      },
      {
        title: "Depersonalized Demands",
        description:
          "When a rule must stand, staff can point to the schedule, sign, timer, or shared plan instead of making it a personal power struggle.",
        standard:
          "The adult becomes the enforcer: you need to be quiet or you have to come now.",
        pda:
          "The adult stays an ally: the library sign says quiet voices or the bus leaves at 3:10.",
        why:
          "It keeps the relationship safer and reduces the chance that support turns into a control battle.",
      },
      {
        title: "Extended Wait Time",
        description:
          "After presenting an idea or option, staff wait without repeating, explaining harder, or adding urgency.",
        standard:
          "Wait time is often treated as cognitive processing time.",
        pda:
          "For PDA students, wait time is often emotional processing time. Their nervous system may need a moment before the first no reflex settles.",
        why:
          "Silence can reduce pressure more effectively than more words.",
      },
    ],
  },
  {
    title: "Schedule, Structure, and Flexibility",
    icon: CalendarClock,
    items: [
      {
        title: "Visual Menus Instead of Rigid Schedules",
        description:
          "Replace fixed first/then timelines with a menu of work or support options the student can help sequence.",
        standard:
          "A rigid visual schedule can be helpful for many autistic students.",
        pda:
          "For a PDA student, the same schedule can feel like a cage. A menu keeps predictability while adding autonomy.",
        why:
          "The plan can preserve expectations without making every next step feel like a demand.",
      },
      {
        title: "The Opt-Out or Safe Exit Clause",
        description:
          "The student can leave to a known safe space or use a pass without having to ask permission once distress is rising.",
        standard:
          "Students may be prompted to ask for a break.",
        pda:
          "Having to ask can become another demand. Knowing there is an exit may lower anxiety enough that the exit is used less often.",
        why:
          "Reducing the trapped feeling is one of the strongest ways to prevent escalation.",
      },
      {
        title: "Novelty and Interest-Led Modifications",
        description:
          "Let the student use interests, humor, or novelty as a bridge into hard tasks instead of saving interests as a reward after compliance.",
        standard:
          "Interest is often used as first work, then reward.",
        pda:
          "Pressure to earn the reward can drain motivation. Interest works better as an entry point.",
        why:
          "It makes participation feel more self-directed and less externally controlled.",
      },
    ],
  },
  {
    title: "Behavioral and Social Approaches",
    icon: HeartHandshake,
    items: [
      {
        title: "Collaboration Over Compliance",
        description:
          "IEP goals and support plans prioritize trust, co-regulation, flexible participation, and repair over immediate compliance.",
        standard:
          "Compliance-focused plans may use rewards, consequences, or planned ignoring.",
        pda:
          "Compliance pressure can increase threat and masking. The focus should be regulation, dignity, and relationship safety.",
        why:
          "A regulated student has better access to skills than a student pushed into survival mode.",
      },
      {
        title: "Indirect Praise",
        description:
          "Use low-pressure acknowledgement, praise the work itself, or let the student overhear positive feedback later.",
        standard:
          "Direct enthusiastic praise is often used as reinforcement.",
        pda:
          "Direct praise can feel like pressure to repeat the performance. Indirect praise lets pride land without a new demand.",
        why:
          "It supports confidence without turning success into a future expectation.",
      },
      {
        title: "Parallel Work and Body Doubling",
        description:
          "Allow work alongside another person who is also doing their own task, without hovering, correction, or surveillance.",
        standard:
          "Adult proximity may be used for supervision and prompting.",
        pda:
          "A collaborative parallel presence can support initiation without making the student feel watched.",
        why:
          "Connection can help more than control.",
      },
    ],
  },
];

export default function PdaIepAccommodationsPage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">PDA IEP Advice</span>
        <h1 className="page-title">PDA IEP Advice: Accommodations</h1>
        <p className="lede">
          Standard autism accommodations often emphasize structure, routine, and
          clear instructions. PDA-aware accommodations must also protect
          autonomy, flexibility, relationship safety, and anxiety reduction.
        </p>
        <div className="cta-row">
          <Link className="button button-primary" href="/tools/pda-iep-advice/analyze">
            Analyze your IEP
          </Link>
          <Link className="button button-secondary" href="/tools/pda-iep-advice/guide">
            Read the guide
          </Link>
        </div>
      </section>

      <div className="content-stack">
        {accommodationSections.map((section) => {
          const Icon = section.icon;
          return (
            <section className="content-section panel" key={section.title}>
              <div className="content-section-heading">
                <span className="content-icon" aria-hidden="true">
                  <Icon size={24} />
                </span>
                <h2>{section.title}</h2>
              </div>
              <div className="accommodation-list">
                {section.items.map((item) => (
                  <article className="accommodation-card" key={item.title}>
                    <h3>{item.title}</h3>
                    <p className="accommodation-description">{item.description}</p>
                    <div className="comparison-grid">
                      <div>
                        <strong>Standard support</strong>
                        <p>{item.standard}</p>
                      </div>
                      <div>
                        <strong>PDA-specific shift</strong>
                        <p>{item.pda}</p>
                      </div>
                    </div>
                    <p className="why-row">
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>
                        <strong>Why it helps:</strong> {item.why}
                      </span>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <Footer />
    </PortalShell>
  );
}
