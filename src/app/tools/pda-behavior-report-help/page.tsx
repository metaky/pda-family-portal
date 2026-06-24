import { Footer, PortalShell } from "@/components/PortalShell";
import { BehaviorReportAnalyzer } from "@/components/BehaviorReportAnalyzer";
import { getServerConfig } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export default function PdaBehaviorReportHelpPage() {
  const config = getServerConfig();

  return (
    <PortalShell>
      <BehaviorReportAnalyzer
        featureEnabled={config.features.behaviorReport}
        maintenanceMode={config.maintenanceMode}
      />
      <Footer />
    </PortalShell>
  );
}
