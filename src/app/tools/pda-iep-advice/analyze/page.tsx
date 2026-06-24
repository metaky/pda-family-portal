import { Footer, PortalShell } from "@/components/PortalShell";
import { PdaIepAnalyzer } from "@/components/PdaIepAnalyzer";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "PDA IEP Advice: Analyze",
  description:
    "Upload an IEP or 504 PDF for a PDA-aware review of goals, accommodations, services, and behavior-plan language.",
  path: "/tools/pda-iep-advice/analyze",
});

export default function PdaIepAnalyzePage() {
  return (
    <PortalShell>
      <PdaIepAnalyzer />
      <Footer />
    </PortalShell>
  );
}
