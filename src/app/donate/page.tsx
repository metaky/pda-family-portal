import { Heart } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Keep PDA Family Tools Free",
  description:
    "Support PDA Family Tools so practical, low-burden PDA-aware resources can stay free for families.",
  path: "/donate",
});

export default function DonatePage() {
  return (
    <PortalShell>
      <section className="panel">
        <Heart color="var(--coral)" size={32} />
        <h1 className="page-title">Keep PDA Family Tools Free</h1>
        <p className="lede">
          Donation support belongs after value is delivered. In the MVP, this is
          a simple placeholder for the future donation destination.
        </p>
        <p>
          If this saved you an hour of emotional labor, you can help keep it free
          for the next parent.
        </p>
      </section>
      <Footer />
    </PortalShell>
  );
}
