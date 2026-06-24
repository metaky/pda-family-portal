"use client";

import { Heart } from "lucide-react";
import type { DonationTier } from "@/lib/site";
import { trackPortalEvent } from "@/lib/client/analytics";

type DonationOptionsProps = {
  tiers: DonationTier[];
};

export function DonationOptions({ tiers }: DonationOptionsProps) {
  const configuredCount = tiers.filter((tier) => tier.href).length;

  return (
    <div className="donation-choice-grid">
      {tiers.map((tier) => {
        const target = `donation_${tier.id}`;

        return (
          <article className="donation-choice" key={tier.id}>
            <div>
              <p className="status">{tier.cadence}</p>
              <h2>{tier.title}</h2>
              <p className="donation-amount">{tier.amount}</p>
              <p>{tier.description}</p>
            </div>
            {tier.href ? (
              <a
                className="button button-coral"
                href={tier.href}
                onClick={() =>
                  trackPortalEvent("donation_click", {
                    source: "donate_page",
                    target,
                  })
                }
                rel="noreferrer"
                target="_blank"
              >
                <Heart size={16} /> {tier.buttonLabel}
              </a>
            ) : (
              <span className="button button-secondary donation-disabled" aria-disabled="true">
                Coming soon
              </span>
            )}
          </article>
        );
      })}
      {configuredCount === 0 ? (
        <p className="small-copy">
          The live donation destinations will be connected before launch.
        </p>
      ) : null}
    </div>
  );
}
