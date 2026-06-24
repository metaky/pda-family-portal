import { Footer, PortalShell } from "@/components/PortalShell";
import { SupportSheetBuilder } from "@/components/SupportSheetBuilder";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Support Sheet Builder",
  description:
    "Create a printable, editable, copyable one-page support sheet for adults supporting a PDA child.",
  path: "/tools/support-sheet-builder",
});

export default function SupportSheetBuilderPage() {
  return (
    <PortalShell>
      <SupportSheetBuilder />
      <Footer />
    </PortalShell>
  );
}
