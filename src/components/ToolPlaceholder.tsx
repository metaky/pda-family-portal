import Link from "next/link";
import { ArrowRight, Boxes, FileCode2 } from "lucide-react";
import { migrationInventory } from "@/lib/migration-inventory";

const friendlyNotes: Record<string, string[]> = {
  "Declarative Language Translator": [
    "Keep the fast phrase-in, phrase-out flow.",
    "Keep typed phrases and generated wording out of analytics.",
  ],
  "PDA IEP Advice": [
    "Keep upload privacy and human verification in place.",
    "Keep the output focused on school conversations parents actually need to have.",
  ],
  "PDA Behavior Report Help": [
    "Keep incident review separate from IEP review.",
    "Keep the output focused on missed supports, context, and next questions.",
  ],
};

export function ToolPlaceholder({
  title,
  route,
  description,
}: {
  title: string;
  route: string;
  description: string;
}) {
  const inventory = migrationInventory.find((item) => item.portalRoute === route);

  return (
    <div className="placeholder-grid">
      <section className="panel">
        <span className="status pending">Tool coming together</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          {title}
        </h1>
        <p className="lede">{description}</p>
        <div className="notice">
          <Boxes size={22} aria-hidden="true" />
          <p style={{ margin: 0 }}>
            This page is being shaped into a practical tool families can use
            here, without being sent to a separate app.
          </p>
        </div>
      </section>

      {inventory && (
        <section className="inventory-card">
          <h2>How this tool is being built</h2>
          <p className="small-copy">
            Source project: <code>{inventory.sourceProject}</code>
          </p>
          <div className="code-list">
            {inventory.sourceFiles.map((file) => (
              <div key={file}>{file}</div>
            ))}
          </div>
          <ul>
            {(friendlyNotes[inventory.feature] ?? [
              "Keep privacy, practical output, and parent usefulness at the center.",
            ]).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <Link className="button button-secondary" href="/migration-inventory">
            <FileCode2 size={16} /> See source notes <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </div>
  );
}
