import { DeclarativeTranslator } from "@/components/DeclarativeTranslator";
import { Footer, PortalShell } from "@/components/PortalShell";

export default function DeclarativeLanguageTranslatorPage() {
  return (
    <PortalShell>
      <DeclarativeTranslator />
      <Footer />
    </PortalShell>
  );
}
