"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Heart,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import {
  audienceOptions,
  avoidOptions,
  createInitialSupportSheetDraft,
  defaultAnswers,
  demandOptions,
  distressOptions,
  escalationOptions,
  helpOptions,
  recoveryOptions,
  supportSheetPresets,
  type AudienceKey,
  type EditableSupportSheetDraft,
  type OptionItem,
  type SupportSheetAnswers,
  type SupportSheetSectionKey,
} from "@/lib/support-sheet";
import { audienceQuickStarts } from "@/lib/tools";

type ArrayField =
  | "helps"
  | "demands"
  | "distressSigns"
  | "avoid"
  | "escalationPlan"
  | "recovery";

type OutputTab = "sheet" | "email" | "short";

const sectionNoteFields: Array<{
  key: SupportSheetSectionKey;
  label: string;
  placeholder: string;
}> = [
  {
    key: "helps",
    label: "Extra detail for what helps",
    placeholder: "Example: A drawing pad helps during waiting time.",
  },
  {
    key: "demands",
    label: "Extra detail for pressure points",
    placeholder: "Example: Questions before transitions can pile up quickly.",
  },
  {
    key: "distressSigns",
    label: "Extra detail for early signs",
    placeholder: "Example: Complaints about noise are often the first clue.",
  },
  {
    key: "avoid",
    label: "Extra detail for what to avoid",
    placeholder: "Example: Please do not remove the comfort item unless safety requires it.",
  },
  {
    key: "escalationPlan",
    label: "Extra detail for escalation",
    placeholder: "Example: If they leave, stay nearby but do not follow closely.",
  },
  {
    key: "recovery",
    label: "Extra detail for recovery",
    placeholder: "Example: Reconnecting through a preferred topic works better than a debrief.",
  },
];

function estimateRows(items: string[]) {
  return Math.max(
    5,
    items.reduce((total, item) => total + Math.max(1, Math.ceil(item.length / 30)), 0) + 1,
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: OptionItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="field">
      <div className="group-label">{label}</div>
      <div className="chip-grid">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              className={`chip ${active ? "selected" : ""}`}
              key={option.id}
              onClick={() => onToggle(option.id)}
              type="button"
            >
              {active ? <Check size={14} aria-hidden="true" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SupportSheetBuilder() {
  const [answers, setAnswers] = useState<SupportSheetAnswers>(defaultAnswers);
  const [draft, setDraft] = useState<EditableSupportSheetDraft>(
    createInitialSupportSheetDraft(defaultAnswers),
  );
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputTab>("sheet");
  const [copied, setCopied] = useState<string | null>(null);

  const audience = useMemo(
    () => audienceOptions.find((option) => option.id === answers.audience) ?? audienceOptions[0],
    [answers.audience],
  );

  function updateAnswer<K extends keyof SupportSheetAnswers>(
    key: K,
    value: SupportSheetAnswers[K],
  ) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function updateChild<K extends keyof SupportSheetAnswers["child"]>(
    key: K,
    value: SupportSheetAnswers["child"][K],
  ) {
    setAnswers((current) => ({
      ...current,
      child: { ...current.child, [key]: value },
    }));
  }

  function updateSectionNote(key: SupportSheetSectionKey, value: string) {
    setAnswers((current) => ({
      ...current,
      sectionNotes: {
        ...current.sectionNotes,
        [key]: value,
      },
    }));
  }

  function toggleArrayValue(field: ArrayField, id: string) {
    setAnswers((current) => {
      const selected = current[field];
      return {
        ...current,
        [field]: selected.includes(id)
          ? selected.filter((item) => item !== id)
          : [...selected, id],
      };
    });
  }

  function generate() {
    setDraft(createInitialSupportSheetDraft(answers));
    setGenerated(true);
    setActiveTab("sheet");
  }

  function reset() {
    setAnswers(defaultAnswers);
    setDraft(createInitialSupportSheetDraft(defaultAnswers));
    setGenerated(false);
    setActiveTab("sheet");
    setCopied(null);
  }

  function loadPreset(index: number) {
    const preset = supportSheetPresets[index];
    if (!preset) {
      return;
    }

    setAnswers(preset.answers);
    setDraft(createInitialSupportSheetDraft(preset.answers));
    setGenerated(false);
    setActiveTab("sheet");
    setCopied(null);
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  }

  function updateSection(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      sheet: {
        ...current.sheet,
        sections: current.sheet.sections.map((section, sectionIndex) =>
          sectionIndex === index
            ? {
                ...section,
                items: value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }
            : section,
        ),
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateSheetText(field: "title" | "subtitle", value: string) {
    setDraft((current) => ({
      ...current,
      sheet: { ...current.sheet, [field]: value },
      updatedAt: new Date().toISOString(),
    }));
  }

  return (
    <div className="page-grid">
      <section className="panel no-print">
        <span className="status">Ready in MVP</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          Support Sheet Builder
        </h1>
        <p className="lede">
          Create a one-page guide for the adults who do not understand your PDA
          child yet.
        </p>

        <div className="form-stack">
          <div className="field">
            <div className="group-label">1. Who is this support sheet for?</div>
            <div className="audience-picker">
              {audienceOptions.map((option) => (
                <button
                  className={`chip ${answers.audience === option.id ? "selected" : ""}`}
                  key={option.id}
                  onClick={() => updateAnswer("audience", option.id)}
                  type="button"
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
            <p className="small-copy" style={{ margin: 0 }}>
              {audienceQuickStarts[answers.audience]}
            </p>
          </div>

          <div className="field">
            <div className="group-label">Sample starters</div>
            <div className="preset-grid">
              {supportSheetPresets.map((preset, index) => (
                <button
                  className="preset-button"
                  key={preset.label}
                  onClick={() => loadPreset(index)}
                  type="button"
                >
                  <strong>{preset.label}</strong>
                  <span>{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Child name or nickname</span>
              <input
                onChange={(event) => updateChild("name", event.target.value)}
                value={answers.child.name}
              />
            </label>
            <label className="field">
              <span>Optional pronouns</span>
              <input
                onChange={(event) => updateChild("pronouns", event.target.value)}
                placeholder="they/them"
                value={answers.child.pronouns}
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Age range</span>
              <select
                onChange={(event) => updateChild("ageRange", event.target.value)}
                value={answers.child.ageRange}
              >
                <option value="preschool">Preschool</option>
                <option value="elementary">Elementary</option>
                <option value="middle school">Middle school</option>
                <option value="high school">High school</option>
                <option value="young adult">Young adult</option>
              </select>
            </label>
            <label className="field">
              <span>Connection points</span>
              <input
                onChange={(event) => updateChild("connectionPoints", event.target.value)}
                placeholder="interests, strengths, trusted topics"
                value={answers.child.connectionPoints}
              />
            </label>
          </div>

          <ChipGroup
            label="2. What helps this child feel safer or more regulated?"
            onToggle={(id) => toggleArrayValue("helps", id)}
            options={helpOptions}
            selected={answers.helps}
          />
          <ChipGroup
            label="3. What can quickly feel like pressure?"
            onToggle={(id) => toggleArrayValue("demands", id)}
            options={demandOptions}
            selected={answers.demands}
          />
          <ChipGroup
            label="4. Early signs of distress"
            onToggle={(id) => toggleArrayValue("distressSigns", id)}
            options={distressOptions}
            selected={answers.distressSigns}
          />
          <ChipGroup
            label="5. Please avoid"
            onToggle={(id) => toggleArrayValue("avoid", id)}
            options={avoidOptions}
            selected={answers.avoid}
          />
          <ChipGroup
            label="6. If things escalate"
            onToggle={(id) => toggleArrayValue("escalationPlan", id)}
            options={escalationOptions}
            selected={answers.escalationPlan}
          />
          <ChipGroup
            label="7. Recovery and afterward"
            onToggle={(id) => toggleArrayValue("recovery", id)}
            options={recoveryOptions}
            selected={answers.recovery}
          />

          <div className="field">
            <div className="group-label">Optional section details</div>
            <p className="small-copy" style={{ margin: 0 }}>
              Add one specific note to any section that needs more context.
            </p>
            <div className="section-note-grid">
              {sectionNoteFields.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  <textarea
                    onChange={(event) => updateSectionNote(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    value={answers.sectionNotes[field.key] ?? ""}
                  />
                </label>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Parent / caregiver note</span>
            <textarea
              onChange={(event) => updateAnswer("contactNote", event.target.value)}
              value={answers.contactNote}
            />
          </label>
          <label className="field">
            <span>Anything else this adult should know?</span>
            <textarea
              onChange={(event) => updateAnswer("customNotes", event.target.value)}
              value={answers.customNotes}
            />
          </label>

          <div className="cta-row">
            <button className="button button-primary" onClick={generate} type="button">
              <Sparkles size={17} /> Generate support sheet
            </button>
            <button className="button button-ghost" onClick={reset} type="button">
              <RotateCcw size={16} /> Clear form
            </button>
          </div>

          <div className="notice">
            <ShieldCheck size={22} aria-hidden="true" />
            <p style={{ margin: 0 }}>
              {draft.privacyNote} Do not include anything you would not want in a
              printed or copied note.
            </p>
          </div>
          <p className="small-copy">{draft.disclaimer}</p>
        </div>
      </section>

      <section className="sheet-preview">
        <div className="sheet-toolbar no-print">
          <div className="tabs" role="tablist" aria-label="Generated outputs">
            <button
              aria-selected={activeTab === "sheet"}
              className={`tab ${activeTab === "sheet" ? "active" : ""}`}
              onClick={() => setActiveTab("sheet")}
              role="tab"
              type="button"
            >
              One-page sheet
            </button>
            <button
              aria-selected={activeTab === "email"}
              className={`tab ${activeTab === "email" ? "active" : ""}`}
              onClick={() => setActiveTab("email")}
              role="tab"
              type="button"
            >
              Email
            </button>
            <button
              aria-selected={activeTab === "short"}
              className={`tab ${activeTab === "short" ? "active" : ""}`}
              onClick={() => setActiveTab("short")}
              role="tab"
              type="button"
            >
              Short text
            </button>
          </div>
          <div className="cta-row" style={{ margin: 0 }}>
            {activeTab === "sheet" ? (
              <button className="button button-secondary" onClick={() => window.print()} type="button">
                <Printer size={16} /> Print / save
              </button>
            ) : null}
            <button
              className="button button-secondary"
              onClick={() =>
                copyText(
                  activeTab,
                  activeTab === "email" ? draft.email : activeTab === "short" ? draft.shortText : draft.sheet.sections.map((section) => `${section.title}\n${section.items.join("\n")}`).join("\n\n"),
                )
              }
              type="button"
            >
              <Clipboard size={16} /> {copied === activeTab ? `Copied ${activeTab}` : "Copy"}
            </button>
          </div>
        </div>

        {copied ? (
          <div className="copy-confirmation no-print" role="status" aria-live="polite">
            Copied {copied === "short" ? "short text" : copied} to your clipboard.
          </div>
        ) : null}

        {!generated ? (
          <div className="notice no-print" style={{ marginBottom: 16 }}>
            <Sprout size={22} aria-hidden="true" />
            <p style={{ margin: 0 }}>
              This is a sample preview. Click generate after editing the form to
              create the copyable and printable version.
            </p>
          </div>
        ) : null}

        {activeTab === "sheet" ? (
          <div className="printable-sheet sheet-paper">
            <header className="sheet-header">
              <span className="sheet-icon" aria-hidden="true">
                <Sprout size={28} />
              </span>
              <div style={{ flex: 1 }}>
                <input
                  aria-label="Support sheet title"
                  className="edit-input no-print"
                  onChange={(event) => updateSheetText("title", event.target.value)}
                  value={draft.sheet.title}
                />
                <h2 className="print-only-title">{draft.sheet.title}</h2>
                <textarea
                  aria-label="Support sheet subtitle"
                  className="edit-area no-print"
                  onChange={(event) => updateSheetText("subtitle", event.target.value)}
                  rows={3}
                  style={{ minHeight: 84, marginTop: 8 }}
                  value={draft.sheet.subtitle}
                />
                <p className="print-only-subtitle">{draft.sheet.subtitle}</p>
              </div>
              <span className="sheet-date">{draft.sheet.preparedAt}</span>
            </header>

            <div className="sheet-sections">
              {draft.sheet.sections.map((section, index) => (
                <section className="sheet-section" key={section.title}>
                  <h3>{section.title}</h3>
                  <textarea
                    aria-label={section.title}
                    className="edit-area no-print"
                    onChange={(event) => updateSection(index, event.target.value)}
                    rows={estimateRows(section.items)}
                    value={section.items.join("\n")}
                  />
                  <ul className="print-only-list">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <footer className="sheet-footer">{draft.sheet.footer}</footer>
          </div>
        ) : (
          <textarea
            className="copy-box"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [activeTab === "email" ? "email" : "shortText"]: event.target.value,
                updatedAt: new Date().toISOString(),
              }))
            }
            value={activeTab === "email" ? draft.email : draft.shortText}
          />
        )}

        {generated ? (
          <aside className="donation-panel no-print">
            <div>
              <strong>If this saved you an hour of emotional labor, you can help keep it free for the next parent.</strong>
              <p className="small-copy" style={{ margin: "6px 0 0" }}>
                Donation prompt appears only after generation.
              </p>
            </div>
            <a className="button button-coral" href="/donate">
              <Heart size={16} /> Donate to support
            </a>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
