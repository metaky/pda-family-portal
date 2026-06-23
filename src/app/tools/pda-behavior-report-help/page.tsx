import { Footer, PortalShell } from "@/components/PortalShell";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";

export default function PdaBehaviorReportHelpPage() {
  return (
    <PortalShell>
      <ToolPlaceholder
        description="This route treats behavior incident review as a standalone portal feature. The actual dual-upload report comparison should be migrated from PDA Your IEP."
        route="/tools/pda-behavior-report-help"
        title="PDA Behavior Report Help"
      />
      <Footer />
    </PortalShell>
  );
}
