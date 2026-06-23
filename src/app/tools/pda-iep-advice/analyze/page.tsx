import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";

export default function PdaIepAnalyzePage() {
  return (
    <PortalShell>
      <ToolPlaceholder
        description="The future analyzer route will port the existing upload and analysis flow from PDA Your IEP rather than imitating it from scratch."
        route="/tools/pda-iep-advice"
        title="PDA IEP Advice: Analyze"
      />
      <Footer />
    </PortalShell>
  );
}
