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
          These tools are free to use. Donations help cover the real costs of
          keeping them available for the next exhausted parent who needs a
          practical starting point.
        </p>
        <p>
          If a tool saved you an hour of explaining, translating, or preparing,
          you can support the same relief for someone else.
        </p>
        <DonationOptions tiers={donationTiers} />
      </section>
      <Footer />
    </PortalShell>
  );
}
