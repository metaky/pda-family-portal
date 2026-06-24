import { Footer, PortalShell } from "@/components/PortalShell";
import { BehaviorReportAnalyzer } from "@/components/BehaviorReportAnalyzer";
import { createPageMetadata } from "@/lib/site";
import { getServerConfig } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "PDA Behavior Report Help",
  description:
    "Compare a behavior incident report with an IEP or 504 plan to identify missed supports and practical PDA-aware next steps.",
  path: "/tools/pda-behavior-report-help",
});

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
