import { Heart } from "lucide-react";
import { DonationOptions } from "@/components/DonationOptions";
import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata, getDonationTiers } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Keep PDA Family Tools Free",
  description:
    "Support PDA Family Tools so practical, low-burden PDA-aware resources can stay free for families.",
  path: "/donate",
});

export default function DonatePage() {
  const donationTiers = getDonationTiers();

  return (
    <PortalShell>
      <section className="panel">
        <Heart color="var(--coral)" size={32} />
        <h1 className="page-title">Keep PDA Family Tools Free</h1>
        <p className="lede">
          Donation support belongs after value is delivered. These tools stay
          free to use, and donations help cover the real costs of running them.
        </p>
        <p>
          If this saved you an hour of emotional labor, you can help keep the
          same support available for the next parent.
        </p>
        <DonationOptions tiers={donationTiers} />
      </section>
      <Footer />
    </PortalShell>
  );
}
