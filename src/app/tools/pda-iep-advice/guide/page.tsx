import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";

export default function PdaIepGuidePage() {
  return (
    <PortalShell>
      <ToolPlaceholder
        description="The future guide route will migrate the existing PDA guide content into the shared portal naming and navigation."
        route="/tools/pda-iep-advice"
        title="PDA IEP Advice: Guide"
      />
      <Footer />
    </PortalShell>
  );
}
