export type AudienceKey =
  | "teacher"
  | "substitute"
  | "relative"
  | "childcare"
  | "activity"
  | "medical"
  | "custom";

export type ChildContext = {
  name: string;
  pronouns: string;
  ageRange: string;
  connectionPoints: string;
};

export type SupportSheetAnswers = {
  audience: AudienceKey;
  child: ChildContext;
  helps: string[];
  demands: string[];
  distressSigns: string[];
  avoid: string[];
  escalationPlan: string[];
  recovery: string[];
  contactNote: string;
  customNotes: string;
};

export type OptionItem = {
  id: string;
  label: string;
  phrase: string;
};

export type AudienceOption = {
  id: AudienceKey;
  label: string;
  shortLabel: string;
  subtitle: string;
  emailRecipient: string;
  focus: string;
};

export type SupportSheetSection = {
  title: string;
  items: string[];
};

export type SupportSheetDocument = {
  title: string;
  subtitle: string;
  preparedAt: string;
  sections: SupportSheetSection[];
  footer: string;
};

export type SupportSheetOutputs = {
  sheet: SupportSheetDocument;
  email: string;
  shortText: string;
  privacyNote: string;
  disclaimer: string;
};

export type EditableSupportSheetDraft = SupportSheetOutputs & {
  updatedAt: string;
};

export const audienceOptions: AudienceOption[] = [
  {
    id: "teacher",
    label: "Teacher or school staff",
    shortLabel: "School",
    subtitle: "Practical support notes for school routines, transitions, and participation.",
    emailRecipient: "the school team",
    focus: "school",
  },
  {
    id: "substitute",
    label: "Substitute teacher",
    shortLabel: "Substitute",
    subtitle: "A quick classroom handoff for a new adult stepping in for the day.",
    emailRecipient: "the substitute or classroom team",
    focus: "the school day",
  },
  {
    id: "relative",
    label: "Grandparent or relative",
    shortLabel: "Family",
    subtitle: "A calm family guide for connection without pressure or power struggles.",
    emailRecipient: "family",
    focus: "family time",
  },
  {
    id: "childcare",
    label: "Babysitter or childcare",
    shortLabel: "Childcare",
    subtitle: "A practical handoff for safety, connection, and what to do if things get hard.",
    emailRecipient: "the caregiver",
    focus: "caregiving",
  },
  {
    id: "activity",
    label: "Coach, camp, or activity leader",
    shortLabel: "Activities",
    subtitle: "Participation support for groups, activities, camps, and coaching.",
    emailRecipient: "the activity leader",
    focus: "participation",
  },
  {
    id: "medical",
    label: "Doctor, dentist, or therapist",
    shortLabel: "Provider",
    subtitle: "Appointment support focused on consent, previewing, and reducing distress.",
    emailRecipient: "the provider",
    focus: "the appointment",
  },
  {
    id: "custom",
    label: "Custom adult",
    shortLabel: "Custom",
    subtitle: "A flexible one-page guide for an adult supporting this child.",
    emailRecipient: "the adult supporting them",
    focus: "the situation",
  },
];

export const helpOptions: OptionItem[] = [
  { id: "extra_processing_time", label: "Extra processing time", phrase: "extra processing time before answering or shifting tasks" },
  { id: "choices", label: "Choices", phrase: "real choices that protect a sense of autonomy" },
  { id: "indirect_language", label: "Indirect language", phrase: "indirect, invitational language instead of direct demands" },
  { id: "humor", label: "Humor or playfulness", phrase: "humor, playfulness, or joining through an interest" },
  { id: "calm_tone", label: "Low voice / calm tone", phrase: "a calm tone and low-arousal body language" },
  { id: "pause_space", label: "Space to pause", phrase: "permission to pause without being chased by more words" },
  { id: "previewing", label: "Previewing what will happen", phrase: "a preview of what will happen next" },
  { id: "reduced_language", label: "Reduced language when overwhelmed", phrase: "fewer words when stress is rising" },
  { id: "trusted_adult", label: "Trusted adult nearby", phrase: "a trusted adult nearby without making it a public issue" },
  { id: "sensory_supports", label: "Sensory supports", phrase: "sensory supports or a quieter place when needed" },
  { id: "opt_out", label: "Permission to opt out or try later", phrase: "a dignified way to opt out or try again later" },
];

export const demandOptions: OptionItem[] = [
  { id: "direct_instructions", label: "Direct instructions", phrase: "direct instructions that sound like there is only one acceptable answer" },
  { id: "being_watched", label: "Being watched", phrase: "being watched closely while trying to start" },
  { id: "being_rushed", label: "Being rushed", phrase: "rushing, countdowns, or urgent language" },
  { id: "public_correction", label: "Public correction", phrase: "public correction or being singled out" },
  { id: "unexpected_transitions", label: "Unexpected transitions", phrase: "unexpected transitions or surprise changes" },
  { id: "losing_control", label: "Losing control over choices", phrase: "losing control over choices or the order of events" },
  { id: "too_many_questions", label: "Too many questions", phrase: "too many questions at once" },
  { id: "consequences", label: "Consequences or threats", phrase: "consequences, threats, or reward pressure in the moment" },
  { id: "performance_praise", label: "Praise that creates pressure", phrase: "praise that makes the next step feel like a performance" },
  { id: "physical_prompting", label: "Physical prompting", phrase: "physical prompting or touch without consent" },
];

export const distressOptions: OptionItem[] = [
  { id: "goes_quiet", label: "Goes quiet", phrase: "going quiet or seeming harder to reach" },
  { id: "says_no", label: "Says no repeatedly", phrase: "saying no repeatedly" },
  { id: "negotiates_or_delays", label: "Negotiates or delays", phrase: "negotiating, delaying, or trying to regain control" },
  { id: "leaves_area", label: "Leaves the area", phrase: "leaving the area or needing distance" },
  { id: "silly_disruptive", label: "Becomes silly or disruptive", phrase: "becoming silly, loud, or disruptive as stress rises" },
  { id: "freezes", label: "Freezes", phrase: "freezing or seeming unable to start" },
  { id: "louder", label: "Becomes louder", phrase: "getting louder or more intense" },
  { id: "hides", label: "Hides", phrase: "hiding or withdrawing" },
  { id: "pain_illness", label: "Complains of pain or illness", phrase: "reporting pain, illness, or not feeling right" },
  { id: "appears_controlling", label: "Appears controlling", phrase: "trying to control small details to feel safer" },
];

export const avoidOptions: OptionItem[] = [
  { id: "pushing_through_refusal", label: "Pushing through refusal", phrase: "pushing through refusal as if it is simple noncompliance" },
  { id: "repeat_louder", label: "Repeating the demand louder", phrase: "repeating the demand louder or with more urgency" },
  { id: "public_consequences", label: "Public consequences", phrase: "public consequences or public problem-solving" },
  { id: "taking_items", label: "Taking away preferred items", phrase: "taking away preferred items in the middle of escalation" },
  { id: "debating", label: "Debating", phrase: "debating, lecturing, or proving the point" },
  { id: "you_have_to", label: "Saying 'you have to'", phrase: "phrases like 'you have to' or 'because I said so'" },
  { id: "surprise_changes", label: "Surprise changes", phrase: "surprise changes without time to adjust" },
  { id: "touching_without_consent", label: "Touching without consent", phrase: "touching, moving, or blocking without consent unless safety requires it" },
  { id: "power_struggle", label: "Power struggle", phrase: "turning the moment into a power struggle" },
];

export const escalationOptions: OptionItem[] = [
  { id: "reduce_language", label: "Reduce language", phrase: "reduce language and keep the tone calm" },
  { id: "create_space", label: "Create space", phrase: "create space and lower the number of demands" },
  { id: "remove_demand", label: "Remove the immediate demand", phrase: "remove or pause the immediate demand if possible" },
  { id: "neutral_reset", label: "Offer a neutral reset", phrase: "offer a neutral reset without requiring an explanation" },
  { id: "avoid_consequences", label: "Avoid consequences in the moment", phrase: "avoid consequences or lectures while stress is high" },
  { id: "contact_parent", label: "Contact parent/caregiver", phrase: "contact the parent or caregiver if safety or recovery is not improving" },
  { id: "quieter_area", label: "Move to a quieter area", phrase: "move to a quieter area if the child can do that safely" },
  { id: "choices_no_answer", label: "Offer choices without requiring an answer", phrase: "offer two gentle options without requiring an immediate answer" },
  { id: "wait_try_again", label: "Wait before trying again", phrase: "wait before trying again" },
];

export const recoveryOptions: OptionItem[] = [
  { id: "time_alone", label: "Time alone", phrase: "time alone or quiet nearby presence" },
  { id: "no_post_event_lecture", label: "No post-event lecture", phrase: "no post-event lecture while they are recovering" },
  { id: "reconnect_without_shame", label: "Reconnection without shame", phrase: "reconnection without shame or forcing an apology" },
  { id: "snack_drink", label: "Snack or drink", phrase: "a snack, drink, or basic body check" },
  { id: "quiet_activity", label: "Quiet activity", phrase: "a quiet activity that does not require performance" },
  { id: "preferred_interest", label: "Preferred interest", phrase: "a preferred interest as a bridge back to connection" },
  { id: "sensory_regulation", label: "Sensory regulation", phrase: "sensory regulation before processing what happened" },
  { id: "try_later", label: "Try again later", phrase: "trying again later when their nervous system has settled" },
  { id: "parent_contact", label: "Parent contact", phrase: "parent contact if the hard moment is not resolving" },
];

const privacyNote =
  "This tool does not require an account. The information you enter is used in your browser to create your support sheet and is not stored by this MVP on a server.";

const disclaimer =
  "This tool is for practical communication and educational support. It is not medical, legal, diagnostic, or therapeutic advice. You know your child best; edit anything that does not fit.";

export const defaultAnswers: SupportSheetAnswers = {
  audience: "teacher",
  child: {
    name: "Sam",
    pronouns: "they/them",
    ageRange: "elementary",
    connectionPoints: "Minecraft, drawing, animals",
  },
  helps: ["choices", "extra_processing_time", "indirect_language"],
  demands: ["direct_instructions", "being_rushed", "public_correction"],
  distressSigns: ["goes_quiet", "negotiates_or_delays", "leaves_area"],
  avoid: ["pushing_through_refusal", "public_consequences", "debating"],
  escalationPlan: ["reduce_language", "create_space", "remove_demand"],
  recovery: ["time_alone", "no_post_event_lecture", "reconnect_without_shame"],
  contactNote: "Text or call me if the day is getting hard.",
  customNotes: "Sam does best when adults sound curious instead of firm.",
};

function getAudience(audience: AudienceKey) {
  return audienceOptions.find((option) => option.id === audience) ?? audienceOptions[0];
}

function getPhrases(ids: string[], options: OptionItem[]) {
  const selected = ids
    .map((id) => options.find((option) => option.id === id))
    .filter((item): item is OptionItem => Boolean(item));

  return selected.map((item) => item.phrase);
}

function listSentence(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function firstName(name: string) {
  return name.trim() || "this child";
}

export function generateSupportSheetOutputs(
  answers: SupportSheetAnswers,
): SupportSheetOutputs {
  const audience = getAudience(answers.audience);
  const name = firstName(answers.child.name);
  const connection = answers.child.connectionPoints.trim();
  const customNotes = answers.customNotes.trim();
  const contactNote = answers.contactNote.trim();
  const helps = getPhrases(answers.helps, helpOptions);
  const demands = getPhrases(answers.demands, demandOptions);
  const distressSigns = getPhrases(answers.distressSigns, distressOptions);
  const avoid = getPhrases(answers.avoid, avoidOptions);
  const escalationPlan = getPhrases(answers.escalationPlan, escalationOptions);
  const recovery = getPhrases(answers.recovery, recoveryOptions);
  const preparedAt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const aboutItems = [
    connection
      ? `${name} connects through ${connection}. Starting with connection usually makes ${audience.focus} easier.`
      : `${name} does best when adults begin with connection and keep expectations flexible.`,
    customNotes || `${name} is more likely to stay connected when adults use low-pressure, collaborative support.`,
  ];

  const sections: SupportSheetSection[] = [
    { title: `About ${name}`, items: aboutItems },
    { title: "What Helps", items: helps.length ? helps : ["calm, flexible support and time to process"] },
    { title: "What May Feel Like Pressure", items: demands.length ? demands : ["direct pressure, urgency, or too many words at once"] },
    { title: "Early Signs of Distress", items: distressSigns.length ? distressSigns : ["changes in voice, movement, participation, or ability to respond"] },
    { title: "Please Avoid", items: avoid.length ? avoid : ["turning the moment into a public correction or power struggle"] },
    { title: "If Things Escalate", items: escalationPlan.length ? escalationPlan : ["reduce language, create space, and pause the demand when possible"] },
    { title: "Recovery and Afterward", items: recovery.length ? recovery : ["time to recover, reconnection without shame, and trying again later"] },
    { title: "Parent / Caregiver Note", items: [contactNote || "Please contact me if support is not helping or safety becomes a concern."] },
  ];

  const email = [
    `Hi,`,
    ``,
    `I wanted to share a short support guide for ${name}. PDA can mean that everyday demands sometimes register as a threat, especially when ${name} feels rushed, watched, corrected, or out of control. The ideas below are the approaches that tend to help ${name} stay connected and able to participate.`,
    ``,
    `${name} connects through: ${connection || "connection, trust, and low-pressure support."}`,
    ``,
    `What helps: ${listSentence(helps)}.`,
    `What may feel like pressure: ${listSentence(demands)}.`,
    `Early signs ${name} is struggling: ${listSentence(distressSigns)}.`,
    `Please avoid: ${listSentence(avoid)}.`,
    `If things escalate: ${listSentence(escalationPlan)}.`,
    `Recovery afterward: ${listSentence(recovery)}.`,
    ``,
    contactNote || `If things are getting hard, please contact me so we can help ${name} recover without shame.`,
    ``,
    `Thank you for supporting ${name} with flexibility and care.`,
    ``,
    `Created with the free PDA Support Sheet Builder.`,
  ].join("\n");

  const shortText = `Quick note for supporting ${name}: direct pressure can feel much bigger than it looks, so ${listSentence(
    helps.slice(0, 3),
  ) || "choices, extra time, and indirect language"} usually work better. If ${name} gets stuck, please ${
    listSentence(escalationPlan.slice(0, 3)) || "reduce language, give space, and pause the demand"
  }. Avoid turning it into a power struggle. ${contactNote || "Please call/text me if things are escalating."}`;

  return {
    sheet: {
      title: `How to Support ${name}`,
      subtitle: audience.subtitle,
      preparedAt,
      sections,
      footer: "Created with the free PDA Support Sheet Builder.",
    },
    email,
    shortText,
    privacyNote,
    disclaimer,
  };
}

export function createInitialSupportSheetDraft(
  answers: SupportSheetAnswers,
): EditableSupportSheetDraft {
  return {
    ...generateSupportSheetOutputs(answers),
    updatedAt: new Date().toISOString(),
  };
}
