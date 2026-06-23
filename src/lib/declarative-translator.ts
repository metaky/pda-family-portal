import {
  buildTranslationPrompt as buildSourceTranslationPrompt,
  buildVariationPrompt as buildSourceVariationPrompt,
  systemInstruction as sourceSystemInstruction,
} from "./declarative-prompt";

const sourceTranslationPrompt = buildSourceTranslationPrompt as (request: {
  existingTranslations?: Translation[];
  interest?: string;
  text: string;
  tone?: TranslatorTone;
  useFewerWords?: boolean;
}) => string;

const sourceVariationPrompt = buildSourceVariationPrompt as (request: {
  interest?: string;
  sourceTranslation: string;
  text: string;
  tone?: TranslatorTone;
  useFewerWords?: boolean;
  variationKind?: VariationKind;
}) => string;

export type TranslatorMode = "translate" | "moreIdeas" | "variation";

export type TranslatorTone =
  | "Default"
  | "Straightforward"
  | "Humorous"
  | "Equalizing"
  | "Interest Based";

export type VariationKind =
  | "shorter"
  | "longer"
  | "warmer"
  | "more_straightforward"
  | "more_playful";

export type Translation = {
  id?: string;
  translation: string;
};

export type TranslatorRequest = {
  mode: TranslatorMode;
  text: string;
  existingTranslations?: Translation[];
  tone?: TranslatorTone;
  interest?: string;
  useFewerWords?: boolean;
  sourceTranslation?: Translation;
  variationKind?: VariationKind;
};

export type TranslatorValidationResult =
  | { ok: true; value: TranslatorRequest }
  | { ok: false; error: string; status: number };

const toneOptions = new Set<TranslatorTone>([
  "Default",
  "Straightforward",
  "Humorous",
  "Equalizing",
  "Interest Based",
]);

const modeOptions = new Set<TranslatorMode>(["translate", "moreIdeas", "variation"]);

const variationOptions = new Set<VariationKind>([
  "shorter",
  "longer",
  "warmer",
  "more_straightforward",
  "more_playful",
]);

const SUMMARY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "before",
  "by",
  "can",
  "do",
  "for",
  "from",
  "get",
  "go",
  "going",
  "help",
  "here",
  "if",
  "in",
  "into",
  "is",
  "it",
  "just",
  "make",
  "next",
  "of",
  "off",
  "on",
  "or",
  "our",
  "out",
  "part",
  "ready",
  "so",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "up",
  "us",
  "we",
  "what",
  "when",
  "with",
  "would",
  "you",
  "your",
]);

const ANGLE_ORDER = ["setup", "transition", "logistics", "shared"];

export const translatorSystemInstruction = sourceSystemInstruction;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTranslatorMode(value: unknown): value is TranslatorMode {
  return typeof value === "string" && modeOptions.has(value as TranslatorMode);
}

function isTranslatorTone(value: unknown): value is TranslatorTone {
  return typeof value === "string" && toneOptions.has(value as TranslatorTone);
}

function isVariationKind(value: unknown): value is VariationKind {
  return typeof value === "string" && variationOptions.has(value as VariationKind);
}

function normalizeTranslationText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeInterestName(value: string | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeForSummary(text: string) {
  return text.trim().replace(/\s+/g, " ").replace(/[.!?]+$/g, "");
}

function classifyExistingAngle(text: string) {
  const normalized = text.toLowerCase();

  if (/^i wonder\b|^i'm\b|^i am\b|^we\b|^our\b/.test(normalized)) {
    return "shared";
  }

  if (/\b(before|after|then|next|first|path|route|sequence|part)\b/.test(normalized)) {
    return "transition";
  }

  if (/\b(help|easier|expert|better way|smarter way|second opinion)\b/.test(normalized)) {
    return "logistics";
  }

  return "setup";
}

function buildKeyFragment(text: string) {
  const normalized = normalizeForSummary(text)
    .replace(
      /^(it looks like|there is|there's|there are|i wonder if|i wonder|i'm thinking|i am thinking|maybe|should we|do we want to)\s+/i,
      "",
    )
    .replace(/^(the|a|an)\s+/i, "");

  const words = normalized
    .split(/\s+/)
    .filter((word) => !SUMMARY_STOP_WORDS.has(word.toLowerCase()))
    .slice(0, 6);

  return words.length > 0 ? words.join(" ").toLowerCase() : normalized.toLowerCase();
}

function extractOpeningPattern(text: string) {
  return normalizeForSummary(text)
    .toLowerCase()
    .replace(/^["'([{]+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
}

function buildFollowUpCoverage(existingTranslations: Translation[] = []) {
  const grouped = new Map<string, string[]>();
  const openingPatterns: string[] = [];
  const seenOpenings = new Set<string>();
  const angleCounts = new Map(ANGLE_ORDER.map((label) => [label, 0]));

  for (const item of existingTranslations) {
    if (!item.translation) continue;

    const angle = classifyExistingAngle(item.translation);
    const fragment = buildKeyFragment(item.translation);
    const existing = grouped.get(angle) || [];
    if (existing.length < 2) {
      existing.push(fragment);
      grouped.set(angle, existing);
    }

    angleCounts.set(angle, (angleCounts.get(angle) || 0) + 1);

    const opening = extractOpeningPattern(item.translation);
    if (opening && !seenOpenings.has(opening) && openingPatterns.length < 6) {
      seenOpenings.add(opening);
      openingPatterns.push(opening);
    }
  }

  const usedAngles = Array.from(grouped.entries())
    .map(([angle, fragments]) => `${angle} (${fragments.join("; ")})`)
    .join(" | ");

  const underusedAngles = ANGLE_ORDER.slice()
    .sort((left, right) => (angleCounts.get(left) || 0) - (angleCounts.get(right) || 0))
    .slice(0, 2)
    .join(", ");

  return { openingPatterns, underusedAngles, usedAngles };
}

export function normalizeTranslations(values: Array<Partial<Translation>>): Translation[] {
  return values
    .map((value) => {
      const translation = normalizeTranslationText(value.translation || "");
      if (!translation) return null;

      return {
        ...(typeof value.id === "string" && value.id.trim() ? { id: value.id } : {}),
        translation,
      };
    })
    .filter((value): value is Translation => value !== null);
}

export function validateTranslatorRequest(input: unknown): TranslatorValidationResult {
  if (!isRecord(input)) {
    return { error: 'Missing or invalid "text" field.', ok: false, status: 400 };
  }

  const mode = input.mode === undefined ? "translate" : input.mode;
  const text = typeof input.text === "string" ? normalizeTranslationText(input.text) : "";
  const tone = input.tone === undefined ? "Default" : input.tone;
  const interest = typeof input.interest === "string" ? normalizeTranslationText(input.interest) : undefined;
  const existingTranslations = Array.isArray(input.existingTranslations)
    ? normalizeTranslations(input.existingTranslations as Array<Partial<Translation>>)
    : [];

  if (!text) {
    return { error: 'Missing or invalid "text" field.', ok: false, status: 400 };
  }

  if (text.length > 500) {
    return {
      error: "Input text exceeds the maximum limit of 500 characters.",
      ok: false,
      status: 400,
    };
  }

  if (!isTranslatorMode(mode)) {
    return { error: 'Missing or invalid "mode" field.', ok: false, status: 400 };
  }

  if (!isTranslatorTone(tone)) {
    return { error: 'Missing or invalid "tone" field.', ok: false, status: 400 };
  }

  if (tone === "Interest Based" && !interest) {
    return {
      error: "Interest Based ideas need an entered interest.",
      ok: false,
      status: 400,
    };
  }

  if (mode === "variation") {
    const sourceTranslation = isRecord(input.sourceTranslation)
      ? normalizeTranslations([input.sourceTranslation as Partial<Translation>])[0]
      : undefined;

    if (!sourceTranslation) {
      return { error: "Missing or invalid source translation.", ok: false, status: 400 };
    }

    if (!isVariationKind(input.variationKind)) {
      return { error: "Missing or invalid variation kind.", ok: false, status: 400 };
    }

    return {
      ok: true,
      value: {
        existingTranslations,
        interest,
        mode,
        sourceTranslation,
        text,
        tone,
        useFewerWords: input.useFewerWords === true,
        variationKind: input.variationKind,
      },
    };
  }

  return {
    ok: true,
    value: {
      existingTranslations,
      interest,
      mode,
      text,
      tone,
      useFewerWords: input.useFewerWords === true,
    },
  };
}

function getToneInstruction(tone: TranslatorTone | undefined, interest?: string) {
  if (!tone || tone === "Default") {
    return 'Use "Default": natural, warm, and easy to say out loud. Prefer grounded conversational wording over perfect declarative theory.';
  }

  const normalizedInterest = normalizeInterestName(interest);
  const isPokemonInterest = normalizedInterest === "pokemon";

  if (tone === "Straightforward") {
    return 'Use "Straightforward": clear, practical, and calm. Get to the point without orders, faux choices, clipped bossiness, jokes, or emotional pressure.';
  }

  if (tone === "Humorous") {
    return 'Use "Humorous": add a little lift through rhythm or one small playful image. Keep it usable, short, and anchored to the task.';
  }

  if (tone === "Equalizing") {
    return 'Use "Equalizing": make status-leveling the real move. Let the child be the checker, expert, leader, route planner, or destination boss, or let the adult be gently unsure/forgetful.';
  }

  if (!interest) {
    return 'Use "Interest Based" with no entered interest: do not pretend there is an interest. Fall back to natural, warm, low-pressure Default wording.';
  }

  return `Use "Interest Based": every returned suggestion must meaningfully incorporate "${interest}" or a recognizable element from "${interest}". A plain non-interest option is a miss for this tone. A bare name-drop is also a miss; the interest element must do real work in the logic of the sentence. Do not invent ${interest} objects/cards/TV/plates/props, story worlds, battles, quests, or character actions.${isPokemonInterest ? " For Pokemon, favor concrete elements that naturally map to the moment: Squirtle/water/sink, Poke-stop/transition stop, Trainer/route, Pikachu/speed, and careful Pokemon steps." : " For non-Pokemon interests, use only details that belong naturally to the entered interest, and do not reuse Pokemon-specific examples."}`;
}

function buildContextInstruction(text: string, tone?: TranslatorTone, interest?: string) {
  const normalized = text.toLowerCase();
  const instructions: string[] = [];
  const hasInterest = tone === "Interest Based" && Boolean(interest);
  const isPokemonInterest = hasInterest && normalizeInterestName(interest) === "pokemon";

  if (
    /\b(stop|slow|careful|unsafe|danger|hurt)\b/.test(normalized) &&
    /\b(run|running|fast|speed|jump|climb)\b/.test(normalized)
  ) {
    instructions.push(
      "Safety case: avoid threat/harm warnings; keep a low-pressure alternative like walking speed inside or running outside.",
    );
  }

  if (/\b(dinner|lunch|breakfast|eat|food)\b/.test(normalized) && /\b(hand|hands|wash|sink)\b/.test(normalized)) {
    instructions.push(
      "Meal sequence: keep coming down/downstairs when present, handwashing, and meal timing in each option. Preserve order when the request says come down and wash hands.",
    );
    if (isPokemonInterest) {
      instructions.push(
        `Pokemon meal transition: use "${interest}" or a recognizable Pokemon element to make the sequence or wash-up make sense. Good shapes: "The sink is like Squirtle, washing hands before dinner." / "The sink is our next Poke-stop before dinner." / "Trainer route: downstairs, sink, then dinner." Bad shapes: "Pokemon hand wash," "Pokemon clean hands," "Pokemon-level clean," "Pokemon quick stop: hands, then dinner," "Pikachu-speed down," "Quick Attack" or rapid-fire language for handwashing, "Pokemon dinner," or turning dinner, hands, plates, or the sink into Pokemon objects.`,
      );
    } else if (hasInterest) {
      instructions.push(
        `Interest Based meal transition: use "${interest}" or a recognizable element from it to make the sequence or wash-up make sense without turning hands, dinner, food, plates, or the sink into ${interest} objects.`,
      );
    }
  }

  if (/\b(pick up|put\b.*\baway|clean|cleanup|toys?|blocks?|clothes?)\b/.test(normalized) && /\b(upstairs|room|bedroom|closet|shelf|basket|bin|drawer)\b/.test(normalized)) {
    instructions.push("Cleanup destination: keep both picking up/putting away and the destination.");
    if (isPokemonInterest) {
      instructions.push(
        `Pokemon cleanup: use "${interest}" or a recognizable Pokemon element as a route, map, trainer path, careful steps, or comparison while keeping the facts unchanged. Do not rename real toys as Pokemon. Do not say "these Pokemon," "loose Pokemon," "Pokemon toys," or "the Pokemon" unless the caregiver said the toys are Pokemon. Keep saying toys/items/things for the real objects. Do not use Poke-stop for cleanup, do not send toys to a pretend Pokemon place, and avoid "Pokemon cleanup," "Pokemon'd away," "Toy Poke-stop," and generic challenge/checkpoint language unless it includes concrete Pokemon route logic.`,
      );
    } else if (hasInterest) {
      instructions.push(
        `Interest Based cleanup: use "${interest}" as a style, route, map, path, or comparison while keeping the facts unchanged. Do not turn the toys into part of the interest world or send them to invented ${interest} containers, vehicles, or places.`,
      );
    }
  }

  if (hasInterest) {
    instructions.push(
      isPokemonInterest
        ? `Interest Based: use "${interest}" or a recognizable Pokemon element in a way that explains the task without renaming real objects as Pokemon objects.`
        : `Interest Based: use "${interest}" or a recognizable element from it as a style, route, comparison, or connection while keeping real task facts unchanged.`,
    );
  }

  return instructions.length > 0 ? ` ${instructions.join(" ")}` : "";
}

function buildFewerWordsInstruction(text: string, tone?: TranslatorTone, interest?: string) {
  const normalized = text.toLowerCase();
  const instructions = [
    "Fewer Words is a hard filter: make every option materially shorter than standard mode, usually 4-9 words for simple moments and 6-12 words for multi-step moments.",
    "Cut filler unless a word is doing real work.",
    "Keep the important safety, sequence, location, and destination details even when phrasing is clipped.",
  ];

  if (/\b(stop|slow|careful|unsafe|danger|hurt)\b/.test(normalized) && /\b(run|running|fast|speed|jump|climb)\b/.test(normalized)) {
    instructions.push('Safety shapes: "Walking inside. Running outside." / "Fast feet fit outside."');
  }

  if (tone === "Equalizing") {
    instructions.push("For Equalizing, every compact option still needs an obvious status move: adult unsure/stuck/forgetful, or child as checker/expert/leader.");
  }

  if (tone === "Interest Based" && interest) {
    instructions.push(`For Interest Based, every compact option must still include "${interest}" or a recognizable element from it, and that element must connect logically to the task.`);
    if (normalizeInterestName(interest) === "pokemon") {
      instructions.push(
        `For Pokemon cleanup, do not use Poke-stop. Do not say "these Pokemon," "loose Pokemon," "Pokemon toys," "Pokemon cleanup," or "Pokemon'd away" for real toys. For Pokemon meal transitions, avoid "Pokemon hand wash," "Pikachu-speed down," and fake Pokemon labels for hands, dinner, the sink, or toys.`,
      );
    }
  }

  return ` CRITICAL: ${instructions.join(" ")}`;
}

export function buildDeclarativePrompt(request: TranslatorRequest) {
  return sourceTranslationPrompt({
    existingTranslations: request.existingTranslations ?? [],
    interest: request.interest,
    text: request.text,
    tone: request.tone,
    useFewerWords: request.useFewerWords,
  });
}

export function buildVariationPrompt(request: TranslatorRequest) {
  return sourceVariationPrompt({
    interest: request.interest,
    sourceTranslation: request.sourceTranslation?.translation ?? "",
    text: request.text,
    tone: request.tone,
    useFewerWords: request.useFewerWords,
    variationKind: request.variationKind ?? "warmer",
  });
}

function cleanTaskText(text: string) {
  return normalizeForSummary(text)
    .replace(/^(please\s+)?/i, "")
    .replace(/^(sit down|stand up|put on|get|go|come|stop|start|do|finish|clean|pick up|focus on|work on|brush|wash|grab|take|leave|head to|turn off|turn on)\b\s*/i, "")
    .trim();
}

function isSafetyPrompt(text: string) {
  const normalized = text.toLowerCase();
  return /\b(stop|don't|dont|no|quit|slow|careful|safe|unsafe|danger|dangerous|hurt)\b/.test(normalized) &&
    /\b(run|running|fast|speed|climb|jump|throw|hit|stairs|street|road|hot|sharp)\b/.test(normalized);
}

function isDinnerHandwashingPrompt(text: string) {
  const normalized = text.toLowerCase();
  return /\bdinner\b/.test(normalized) && /\bwash(?:ing)?\b.*\bhands?\b|\bhands?\b.*\bwash(?:ed|ing)?\b/.test(normalized);
}

function isCleanupPrompt(text: string) {
  const normalized = text.toLowerCase();
  return /\b(clean|cleanup|pick up|put\b.*\baway|toys?|blocks?|clothes?|things?)\b/.test(normalized) &&
    /\b(upstairs|room|bedroom|closet|shelf|basket|bin|drawer)\b/.test(normalized);
}

function buildMockVariationTranslations(request: TranslatorRequest) {
  const source = normalizeForSummary(request.sourceTranslation?.translation || "This has another way through.");

  if (request.variationKind === "shorter") {
    return normalizeTranslations([
      { translation: `${source.split(/\s+/).slice(0, 7).join(" ")}.` },
      { translation: "Same idea, fewer words." },
    ]);
  }

  if (request.variationKind === "longer") {
    return normalizeTranslations([
      { translation: `${source}, with a little more room for the moment.` },
      { translation: `${source}, and it can happen without rushing.` },
    ]);
  }

  if (request.variationKind === "more_playful") {
    return normalizeTranslations([
      { translation: `${source}, with a tiny bit of lift.` },
      { translation: `${source}, and the moment gets a lighter touch.` },
    ]);
  }

  if (request.variationKind === "more_straightforward") {
    return normalizeTranslations([
      { translation: `${source}.` },
      { translation: "This is the next part, when it works." },
    ]);
  }

  return normalizeTranslations([
    { translation: `${source}, and we can keep it gentle.` },
    { translation: `${source}, with a little extra softness around it.` },
  ]);
}

export function buildMockDeclarativeTranslations(request: TranslatorRequest) {
  if (request.mode === "variation") {
    return buildMockVariationTranslations(request);
  }

  if (isDinnerHandwashingPrompt(request.text)) {
    return normalizeTranslations([
      { translation: "Dinner is ready. Hands first." },
      { translation: "Downstairs, hands, then dinner." },
      { translation: "The table is ready after hands are washed." },
    ]);
  }

  if (isSafetyPrompt(request.text)) {
    return normalizeTranslations([
      { translation: "Walking speed works inside. Running fits outside." },
      { translation: "Fast feet have more room outside." },
      { translation: "Inside is a walking-speed space." },
    ]);
  }

  if (isCleanupPrompt(request.text)) {
    return normalizeTranslations([
      { translation: "The toys have an upstairs spot." },
      { translation: "This cleanup includes getting the toys to their room." },
      { translation: "The room reset has a clear destination." },
    ]);
  }

  const task = cleanTaskText(request.text) || "this next part";
  const interest = request.tone === "Interest Based" && request.interest ? ` with ${request.interest} nearby` : "";

  return normalizeTranslations([
    { translation: `${task} is part of what is happening${interest}.` },
    { translation: `It looks like ${task}${interest} is on the plan.` },
    { translation: `I wonder what would make ${task}${interest} feel easier.` },
  ]);
}
