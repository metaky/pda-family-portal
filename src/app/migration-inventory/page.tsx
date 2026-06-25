import { Footer, PortalShell } from "@/components/PortalShell";
import { MigrationInventory } from "@/components/MigrationInventory";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "How These Tools Are Built",
  description:
    "See how PDA Family Tools keeps its parent-facing tools grounded in proven source projects, privacy choices, and practical use cases.",
  path: "/migration-inventory",
});

export default function MigrationInventoryPage() {
  return (
    <PortalShell>
      <section className="panel" style={{ marginBottom: 20 }}>
        <h1 className="page-title">How These Tools Are Built</h1>
        <p className="lede">
          PDA Family Tools pulls together work that started in separate tools.
          This page is mostly here for transparency: it shows which experiences
          were brought into the portal and what promises need to stay intact for
          families.
        </p>
      </section>
      <MigrationInventory />
      <Footer />
    </PortalShell>
  );
}
