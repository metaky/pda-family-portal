import { Footer, PortalShell } from "@/components/PortalShell";
import { SupportSheetBuilder } from "@/components/SupportSheetBuilder";

export default function SupportSheetBuilderPage() {
  return (
    <PortalShell>
      <SupportSheetBuilder />
      <Footer />
    </PortalShell>
  );
}
