import { migrationInventory } from "@/lib/migration-inventory";

export function MigrationInventory() {
  return (
    <div className="inventory-grid">
      {migrationInventory.map((item) => (
        <article className="inventory-card" key={item.feature}>
          <span className="status pending">{item.status}</span>
          <h2>{item.feature}</h2>
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
          <ul>
            {item.portingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
