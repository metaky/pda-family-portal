"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Heart,
  History,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import type {
  Translation,
  TranslatorMode,
  TranslatorTone,
  VariationKind,
} from "@/lib/declarative-translator";

type TranslationWithId = Translation & { id: string };
type VariationCache = Partial<Record<VariationKind, TranslationWithId[]>>;
type VariationMap = Record<string, VariationCache>;

type HistoryItem = {
  id: string;
  createdAt: string;
  text: string;
  tone: TranslatorTone;
  interest?: string;
  useFewerWords: boolean;
  translations: TranslationWithId[];
  variations: VariationMap;
};

type VariationState = {
  error: string | null;
  isLoading: boolean;
  selectedKind?: VariationKind;
};

const HISTORY_STORAGE_KEY = "pdaPortalDeclarativeHistory";
const MAX_HISTORY_ITEMS = 20;

const examples = [
  {
    label: "School example",
    text: "Get your backpack and shoes on so we can get ready for school.",
  },
  {
    label: "Dinner example",
    text: "Please come down and wash your hands. It's dinner time.",
  },
  {
    label: "Volume example",
    text: "You are being way too loud right now. Please stop.",
  },
  {
    label: "Homework example",
    text: "You have a lot of homework tonight, so we need to get started now.",
  },
];

const tones: Array<{ description: string; name: TranslatorTone }> = [
  {
    description: "Natural, warm, low-pressure wording.",
    name: "Default",
  },
  {
    description: "Clear and practical without sounding bossy.",
    name: "Straightforward",
  },
  {
    description: "A small lift in wording without teasing or pressure.",
    name: "Humorous",
  },
  {
    description: "Lets the child be the checker, expert, or route planner.",
    name: "Equalizing",
  },
  {
    description: "Connects the request to a real interest without making things up.",
    name: "Interest Based",
  },
];

const variationLabels: Record<VariationKind, string> = {
  longer: "Longer",
  more_playful: "More playful",
  more_straightforward: "More straightforward",
  shorter: "Shorter",
  warmer: "Warmer",
};

const defaultVariationOrder: VariationKind[] = [
  "shorter",
  "warmer",
  "more_straightforward",
  "more_playful",
];

const fewerWordsVariationOrder: VariationKind[] = [
  "longer",
  "warmer",
  "more_straightforward",
  "more_playful",
];

const loadingMessages = [
  "Finding gentler wording...",
  "Keeping the meaning, lowering the pressure...",
  "Drafting sayable options...",
  "Making the request easier to hear...",
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withIds(translations: Translation[], prefix = "translation"): TranslationWithId[] {
  return translations
    .map((item) => ({
      id: item.id?.trim() || createId(prefix),
      translation: item.translation.trim().replace(/\s+/g, " "),
    }))
    .filter((item) => item.translation);
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch {
    // Local history is a convenience only.
  }
}

async function requestTranslations({
  existingTranslations = [],
  interest,
  mode,
  sourceTranslation,
  text,
  tone,
  useFewerWords,
  variationKind,
}: {
  existingTranslations?: Translation[];
  interest?: string;
  mode: TranslatorMode;
  sourceTranslation?: Translation;
  text: string;
  tone: TranslatorTone;
  useFewerWords: boolean;
  variationKind?: VariationKind;
}) {
  const response = await fetch("/api/declarative/translate", {
    body: JSON.stringify({
      existingTranslations,
      interest,
      mode,
      sourceTranslation,
      text,
      tone,
      useFewerWords,
      variationKind,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : "The translator could not create ideas right now.",
    );
  }

  return withIds(Array.isArray(payload.translations) ? payload.translations : []);
}

export function DeclarativeTranslator() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<TranslatorTone>("Default");
  const [interest, setInterest] = useState("");
  const [useFewerWords, setUseFewerWords] = useState(false);
  const [translations, setTranslations] = useState<TranslationWithId[]>([]);
  const [variations, setVariations] = useState<VariationMap>({});
  const [variationStates, setVariationStates] = useState<Record<string, VariationState>>({});
  const [openVariationId, setOpenVariationId] = useState<string | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    setHistoryItems(loadHistory());
  }, []);

  const selectedTone = tones.find((option) => option.name === tone) ?? tones[0];
  const trimmedText = text.trim();
  const selectedInterest = tone === "Interest Based" ? interest.trim() : undefined;
  const interestMissing = tone === "Interest Based" && !selectedInterest;
  const canGenerate = Boolean(trimmedText) && !interestMissing && !isLoading;
  const variationKinds = useMemo(
    () => (useFewerWords ? fewerWordsVariationOrder : defaultVariationOrder),
    [useFewerWords],
  );

  function rememberRun(nextItem: HistoryItem) {
    setHistoryItems((current) => {
      const remaining = current.filter((item) => item.id !== nextItem.id);
      const next = [nextItem, ...remaining].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(next);
      return next;
    });
  }

  function persistCurrentRun(nextTranslations: TranslationWithId[], nextVariations = variations) {
    const runId = currentRunId ?? createId("history");
    setCurrentRunId(runId);
    rememberRun({
      createdAt: new Date().toISOString(),
      id: runId,
      interest: selectedInterest,
      text: trimmedText,
      tone,
      translations: nextTranslations,
      useFewerWords,
      variations: nextVariations,
    });
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setIsLoading(true);
    setError(null);
    setTranslations([]);
    setVariations({});
    setVariationStates({});
    setOpenVariationId(null);

    try {
      const results = await requestTranslations({
        interest: selectedInterest,
        mode: "translate",
        text: trimmedText,
        tone,
        useFewerWords,
      });
      const runId = createId("history");
      setCurrentRunId(runId);
      setTranslations(results);
      rememberRun({
        createdAt: new Date().toISOString(),
        id: runId,
        interest: selectedInterest,
        text: trimmedText,
        tone,
        translations: results,
        useFewerWords,
        variations: {},
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The translator could not create ideas.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMoreIdeas() {
    if (!trimmedText || isMoreLoading || interestMissing || translations.length === 0) return;

    setIsMoreLoading(true);
    setError(null);

    try {
      const results = await requestTranslations({
        existingTranslations: translations,
        interest: selectedInterest,
        mode: "moreIdeas",
        text: trimmedText,
        tone,
        useFewerWords,
      });
      const combined = [...translations, ...results];
      setTranslations(combined);
      persistCurrentRun(combined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The translator could not create more ideas.");
    } finally {
      setIsMoreLoading(false);
    }
  }

  async function handleVariation(item: TranslationWithId, variationKind: VariationKind) {
    const cached = variations[item.id]?.[variationKind];
    setOpenVariationId(item.id);

    if (cached?.length) {
      setVariationStates((current) => ({
        ...current,
        [item.id]: { error: null, isLoading: false, selectedKind: variationKind },
      }));
      return;
    }

    setVariationStates((current) => ({
      ...current,
      [item.id]: { error: null, isLoading: true, selectedKind: variationKind },
    }));

    try {
      const results = await requestTranslations({
        interest: selectedInterest,
        mode: "variation",
        sourceTranslation: item,
        text: trimmedText,
        tone,
        useFewerWords,
        variationKind,
      });
      setVariations((current) => {
        const next = {
          ...current,
          [item.id]: {
            ...(current[item.id] ?? {}),
            [variationKind]: results,
          },
        };
        persistCurrentRun(translations, next);
        return next;
      });
      setVariationStates((current) => ({
        ...current,
        [item.id]: { error: null, isLoading: false, selectedKind: variationKind },
      }));
    } catch (caught) {
      setVariationStates((current) => ({
        ...current,
        [item.id]: {
          error: caught instanceof Error ? caught.message : "Could not create that variation.",
          isLoading: false,
          selectedKind: variationKind,
        },
      }));
    }
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  }

  function selectHistory(item: HistoryItem) {
    setText(item.text);
    setTone(item.tone);
    setInterest(item.interest ?? "");
    setUseFewerWords(item.useFewerWords);
    setTranslations(item.translations);
    setVariations(item.variations);
    setVariationStates({});
    setOpenVariationId(null);
    setCurrentRunId(item.id);
    setError(null);
    setShowHistory(false);
  }

  function clearHistory() {
    saveHistory([]);
    setHistoryItems([]);
    setShowHistory(false);
  }

  function reset() {
    setText("");
    setTone("Default");
    setInterest("");
    setUseFewerWords(false);
    setTranslations([]);
    setVariations({});
    setVariationStates({});
    setOpenVariationId(null);
    setCurrentRunId(null);
    setError(null);
  }

  return (
    <div className="translator-layout">
      <section className="panel translator-panel">
        <span className="status">Native MVP</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          Declarative Language Translator
        </h1>
        <p className="lede">
          Turn a direct phrase into low-pressure wording that keeps the practical meaning intact.
        </p>

        <div className="form-stack">
          <div className="field">
            <label htmlFor="caregiver-phrase">Caregiver phrase</label>
            <textarea
              data-ph-no-autocapture
              id="caregiver-phrase"
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Example: Please come down and wash your hands. It's dinner time."
              rows={4}
              value={text}
            />
          </div>

          <div className="translator-example-row" aria-label="Example phrases">
            {examples.map((example) => (
              <button
                className="chip"
                key={example.label}
                onClick={() => setText(example.text)}
                type="button"
              >
                {example.label}
              </button>
            ))}
          </div>

          <div className="field">
            <div className="group-label">Tone</div>
            <div className="tone-grid">
              {tones.map((option) => (
                <button
                  aria-pressed={tone === option.name}
                  className={`tone-option ${tone === option.name ? "selected" : ""}`}
                  key={option.name}
                  onClick={() => {
                    setTone(option.name);
                    setOpenVariationId(null);
                    setVariationStates({});
                  }}
                  type="button"
                >
                  <span>{option.name}</span>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </div>

          {tone === "Interest Based" ? (
            <div className="field">
              <label htmlFor="child-interest">Child interest</label>
              <input
                data-ph-no-autocapture
                id="child-interest"
                onChange={(event) => setInterest(event.target.value)}
                placeholder="Example: Pokemon"
                value={interest}
              />
              <p className="small-copy">
                Interest Based ideas need one real interest so the connection stays grounded.
              </p>
            </div>
          ) : null}

          <div className="translator-toggle-row">
            <div>
              <strong>Fewer Words</strong>
              <p className="small-copy">Shorter wording can lower the demand when a child is already overloaded.</p>
            </div>
            <button
              aria-pressed={useFewerWords}
              className={`switch-button ${useFewerWords ? "on" : ""}`}
              onClick={() => {
                setUseFewerWords((current) => !current);
                setOpenVariationId(null);
                setVariationStates({});
              }}
              type="button"
            >
              <span aria-hidden="true" />
              Fewer words
            </button>
          </div>

          {error ? (
            <div className="translator-error" role="alert">
              <strong>Oops.</strong> {error}
            </div>
          ) : null}

          <div className="translator-actions">
            <button
              className="button button-primary"
              disabled={!canGenerate}
              onClick={handleGenerate}
              type="button"
            >
              <Sparkles size={18} aria-hidden="true" />
              {isLoading ? "Getting ideas..." : "Get ideas"}
            </button>
            <button className="button button-secondary" onClick={() => setShowHistory(true)} type="button">
              <History size={18} aria-hidden="true" />
              Recent
            </button>
            <button className="button button-ghost" onClick={reset} type="button">
              <RotateCcw size={18} aria-hidden="true" />
              Reset
            </button>
          </div>

          {interestMissing ? (
            <p className="small-copy" role="status">
              Add an interest to generate Interest Based ideas.
            </p>
          ) : null}
        </div>

        <div className="notice">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Typed phrases are sent to the translator API and AI service to create wording.
            Recent translations stay in this browser only. Do not paste emergency, medical,
            or confidential school records here.
          </p>
        </div>
      </section>

      <section className="sheet-preview translator-results" aria-live="polite">
        <div className="translator-results-header">
          <div>
            <span className="status">{selectedTone.name}</span>
            <h2>Ideas you can actually say</h2>
          </div>
          {translations.length > 0 ? (
            <button
              className="button button-secondary"
              disabled={isMoreLoading}
              onClick={handleMoreIdeas}
              type="button"
            >
              <Lightbulb size={18} aria-hidden="true" />
              {isMoreLoading ? "Getting more..." : "Get more ideas"}
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="translator-empty" role="status">
            <Sparkles size={22} aria-hidden="true" />
            <p>{loadingMessage}</p>
          </div>
        ) : null}

        {!isLoading && translations.length === 0 ? (
          <div className="translator-empty">
            <MessageCircle size={24} aria-hidden="true" />
            <p>
              Add a phrase on the left. The first useful set of alternatives will appear here.
            </p>
          </div>
        ) : null}

        {translations.length > 0 ? (
          <div className="translation-list">
            {translations.map((item) => {
              const variationState = variationStates[item.id];
              const selectedKind = variationState?.selectedKind;
              const cachedVariations = selectedKind ? variations[item.id]?.[selectedKind] ?? [] : [];
              const isOpen = openVariationId === item.id;

              return (
                <article className="translation-card" key={item.id}>
                  <div className="translation-card-main">
                    <p>{item.translation}</p>
                    <button
                      aria-label="Copy suggestion"
                      className="icon-button"
                      onClick={() => copyText("suggestion", item.translation)}
                      type="button"
                    >
                      {copied === "suggestion" ? (
                        <Check size={18} aria-hidden="true" />
                      ) : (
                        <Clipboard size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <button
                    className="variation-toggle"
                    data-ph-no-autocapture
                    onClick={() => setOpenVariationId((current) => (current === item.id ? null : item.id))}
                    type="button"
                  >
                    {isOpen ? "Hide variations" : "Try a variation"}
                  </button>

                  {isOpen ? (
                    <div className="variation-panel">
                      <div className="variation-button-row">
                        {variationKinds.map((kind) => (
                          <button
                            className={`chip ${selectedKind === kind ? "selected" : ""}`}
                            key={kind}
                            onClick={() => handleVariation(item, kind)}
                            type="button"
                          >
                            {variationLabels[kind]}
                          </button>
                        ))}
                      </div>
                      {variationState?.isLoading ? <p className="small-copy">Trying a new pass...</p> : null}
                      {variationState?.error ? (
                        <div className="translator-error" role="alert">
                          {variationState.error}
                        </div>
                      ) : null}
                      {!variationState?.isLoading && !variationState?.error && cachedVariations.length === 0 ? (
                        <p className="small-copy">Pick a version to explore. Saved variation results appear here.</p>
                      ) : null}
                      {cachedVariations.map((variation) => (
                        <div className="variation-result" key={variation.id}>
                          <p>{variation.translation}</p>
                          <button
                            aria-label="Copy variation"
                            className="icon-button"
                            onClick={() => copyText("variation", variation.translation)}
                            type="button"
                          >
                            <Clipboard size={16} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        {copied ? (
          <div className="copy-confirmation" role="status">
            Copied {copied}
          </div>
        ) : null}

        {translations.length > 0 ? (
          <div className="donation-panel">
            <div>
              <strong>If this helped you find usable words, keep it free for the next parent.</strong>
              <p className="small-copy">
                PDA Family Tools is donation-supported. No premium tier, no account wall.
              </p>
            </div>
            <Link className="button button-coral" href="/donate">
              <Heart size={18} aria-hidden="true" />
              Donate
            </Link>
          </div>
        ) : null}
      </section>

      {showHistory ? (
        <div className="history-modal" role="dialog" aria-modal="true" aria-label="Recent translations">
          <div className="history-card">
            <div className="sheet-toolbar">
              <div>
                <h2>Recent Translations</h2>
                <p className="small-copy">Saved locally in this browser.</p>
              </div>
              <button className="icon-button" onClick={() => setShowHistory(false)} type="button">
                <Check size={18} aria-hidden="true" />
              </button>
            </div>

            {historyItems.length > 0 ? (
              <div className="history-list">
                {historyItems.map((item) => (
                  <button
                    className="history-item"
                    key={item.id}
                    onClick={() => selectHistory(item)}
                    type="button"
                  >
                    <span>{item.tone}</span>
                    <strong>{item.text}</strong>
                    <small>{item.translations.length} suggestion(s)</small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="small-copy">No recent translations yet.</p>
            )}

            {historyItems.length > 0 ? (
              <button className="button button-secondary" onClick={clearHistory} type="button">
                <Trash2 size={18} aria-hidden="true" />
                Clear local history
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
