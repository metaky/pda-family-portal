import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";

export default function PdaIepAccommodationsPage() {
  return (
    <PortalShell>
      <ToolPlaceholder
        description="The future accommodations route will port source guidance and school-support language from the PDA Your IEP project."
        route="/tools/pda-iep-advice"
        title="PDA IEP Advice: Accommodations"
      />
      <Footer />
    </PortalShell>
  );
}
