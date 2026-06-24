import { Footer, PortalShell } from "@/components/PortalShell";
import { MigrationInventory } from "@/components/MigrationInventory";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Migration Inventory",
  description:
    "Track how Declarative App and PDA Your IEP source features are being migrated into native PDA Family Tools portal routes.",
  path: "/migration-inventory",
});

export default function MigrationInventoryPage() {
  return (
    <PortalShell>
      <section className="panel" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Migration Inventory</h1>
        <p className="lede">
          The portal treats Declarative App and PDA Your IEP as source projects
          to migrate into native features. This inventory keeps the later porting
          work grounded in real modules, prompts, privacy copy, and tests.
        </p>
      </section>
      <MigrationInventory />
      <Footer />
    </PortalShell>
  );
}
