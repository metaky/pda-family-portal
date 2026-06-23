import Link from "next/link";
import { ArrowRight, Boxes, FileCode2 } from "lucide-react";
import { migrationInventory } from "@/lib/migration-inventory";

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
        <span className="status pending">Native portal route</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          {title}
        </h1>
        <p className="lede">{description}</p>
        <div className="notice">
          <Boxes size={22} aria-hidden="true" />
          <p style={{ margin: 0 }}>
            This is a first-MVP native route, not a permanent external link or
            iframe. The actual working module should be ported from the source
            project listed below so prompts, privacy language, tests, and edge
            cases come forward intact.
          </p>
        </div>
      </section>

      {inventory && (
        <section className="inventory-card">
          <h2>Migration Inventory</h2>
          <p className="small-copy">
            Source project: <code>{inventory.sourceProject}</code>
          </p>
          <div className="code-list">
            {inventory.sourceFiles.map((file) => (
              <div key={file}>{file}</div>
            ))}
          </div>
          <ul>
            {inventory.portingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <Link className="button button-secondary" href="/migration-inventory">
            <FileCode2 size={16} /> View full inventory <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </div>
  );
}
