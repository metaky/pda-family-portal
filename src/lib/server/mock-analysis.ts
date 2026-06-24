import type { AnalyzeReport } from "@/lib/server/api-types";

export const MOCK_ANALYZE_REPORT: AnalyzeReport = {
  score: 82,
  summary:
    "Analyzed document: This IEP includes several supportive elements, but some goals and compliance-oriented language should be revised to better support autonomy and regulation.",
  strengths: [
    "Includes multiple accommodations that acknowledge sensory needs.",
    "Services are described with enough detail to review implementation.",
  ],
  opportunities: [
    "Several goals focus on compliance rather than regulation and collaboration.",
    "The plan would benefit from clearer co-regulation and demand-reduction supports.",
  ],
  categorySuggestions: {
    Goal: {
      add: ["Replace compliance goals with collaborative self-advocacy goals."],
      remove: ["Remove vague compliance targets that rely on adult prompts."],
    },
    Accommodation: {
      add: ["Offer declarative language and opt-in breaks."],
      remove: ["Remove contingent reward systems tied to compliance."],
    },
    Service: {
      add: ["Add staff coaching on PDA-informed support strategies."],
      remove: [],
    },
    "Behavior Plan": {
      add: ["Add co-regulation and low-demand recovery steps."],
      remove: ["Remove planned ignoring and escalation-based responses."],
    },
  },
  results: [
    {
      category: "Goal",
      title: "Reading Fluency",
      status: "Needs Review",
      description:
        "The goal is measurable, but the framing centers adult-directed performance rather than collaborative support.",
      recommendation:
        "Rewrite this goal to include student choice, co-regulation supports, and clearly defined low-demand practice options.",
      quote: "Student will comply with reading tasks for 15 minutes with no refusals.",
      page: 7,
    },
    {
      category: "Accommodation",
      title: "Break Access",
      status: "Good",
      description:
        "The document includes a useful sensory break accommodation that can support regulation.",
      recommendation:
        "Clarify that breaks can be self-initiated and do not require prior escalation.",
      quote: "Student may access a quiet sensory break area as needed.",
      page: 5,
    },
  ],
};
