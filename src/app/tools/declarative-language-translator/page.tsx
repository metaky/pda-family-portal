import { DeclarativeTranslator } from "@/components/DeclarativeTranslator";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Declarative Language Translator",
  description:
    "Turn direct, demand-heavy language into declarative, PDA-aware wording that preserves autonomy and meaning.",
  path: "/tools/declarative-language-translator",
});

export default function DeclarativeLanguageTranslatorPage() {
  return (
    <PortalShell>
      <DeclarativeTranslator />
      <Footer />
    </PortalShell>
  );
}
