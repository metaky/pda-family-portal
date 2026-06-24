import { Footer, PortalShell } from "@/components/PortalShell";
import { PdaIepAnalyzer } from "@/components/PdaIepAnalyzer";

export default function PdaIepAnalyzePage() {
  return (
    <PortalShell>
      <PdaIepAnalyzer />
      <Footer />
    </PortalShell>
  );
}
