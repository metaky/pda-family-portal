import { migrationInventory } from "@/lib/migration-inventory";

const familySummaries: Record<string, string> = {
  "Declarative Language Translator":
    "This tool brings the proven translator into the portal so families can get usable wording without leaving the site.",
  "PDA IEP Advice":
    "This school-planning area keeps the focus on practical IEP and 504 language parents can bring into meetings and emails.",
  "PDA Behavior Report Help":
    "This tool stays separate from IEP review because an incident report creates a different parent need: understanding what happened and what support was missing.",
};

const familyNotes: Record<string, string[]> = {
  "Declarative Language Translator": [
    "Keeps the fast type-a-phrase, get-a-few-options flow.",
    "Keeps typed phrases and generated wording out of analytics.",
    "Keeps the translator focused on wording a caregiver could actually say.",
  ],
  "PDA IEP Advice": [
    "Supports school-document review without pretending to replace legal advice.",
    "Keeps upload privacy, file validation, and human verification in the flow.",
    "Uses PDA-aware school guidance so the result is more than a generic document summary.",
  ],
  "PDA Behavior Report Help": [
    "Compares the incident report against the IEP or 504 plan instead of treating behavior in isolation.",
    "Keeps the output focused on missed supports, context, and practical next questions.",
    "Stays a standalone tool because parents need a different kind of help after an incident.",
  ],
};

function familyStatus(status: string) {
  return status.toLowerCase().includes("production launch")
    ? "Available here; final public-safety checks still matter"
    : "Available here";
}

export function MigrationInventory() {
  return (
    <div className="inventory-grid">
      {migrationInventory.map((item) => (
        <article className="inventory-card" key={item.feature}>
          <span className="status pending">{familyStatus(item.status)}</span>
          <h2>{item.feature}</h2>
          <p>{familySummaries[item.feature]}</p>
          <ul>
            {(familyNotes[item.feature] ?? item.portingNotes).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <details>
            <summary>Technical source notes</summary>
            <p className="small-copy">
              Portal route: <code>{item.portalRoute}</code>
              <br />
              Source project: <code>{item.sourceProject}</code>
            </p>
            <div className="code-list">
              {item.sourceFiles.map((file) => (
                <div key={file}>{file}</div>
              ))}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
