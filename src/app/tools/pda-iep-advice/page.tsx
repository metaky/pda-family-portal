import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";

export default function PdaIepAdvicePage() {
  return (
    <PortalShell>
      <ToolPlaceholder
        description="This route will migrate the PDA Your IEP analyzer, accommodations, guide, upload, privacy, security, RAG, and test coverage into the portal."
        route="/tools/pda-iep-advice"
        title="PDA IEP Advice"
      />
      <Footer />
    </PortalShell>
  );
}
