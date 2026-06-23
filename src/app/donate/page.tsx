import { Heart } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";

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
