import { Footer, PortalShell } from "@/components/PortalShell";
import { PdaIepAnalyzer } from "@/components/PdaIepAnalyzer";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Review an IEP or 504 Plan",
  description:
    "Upload an IEP or 504 PDF and get PDA-aware questions and language to prepare for a school conversation.",
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
