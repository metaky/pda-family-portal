"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { ApiResponse } from "@/lib/server/api-types";
import {
  getSecurityHeaders,
  getSecurityTestToken,
} from "@/lib/client/security";

export function HumanVerificationPanel({
  onClose,
  onVerified,
  open,
  purpose = "analyze",
}: {
  onClose: () => void;
  onVerified: () => void;
  open: boolean;
  purpose?: "analyze" | "behavior-report";
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  async function submitVerification() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/pda-iep-advice/human-verify", {
        body: JSON.stringify({
          purpose,
          token: getSecurityTestToken(),
        }),
        headers: {
          "content-type": "application/json",
          ...getSecurityHeaders(),
        },
        method: "POST",
      });
      const data = (await response.json()) as ApiResponse<{ verified: boolean }>;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      onVerified();
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="verification-backdrop" role="presentation">
      <section
        aria-modal="true"
        className="verification-modal"
        role="dialog"
      >
        <div className="verification-icon" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>
        <h2>Complete security check</h2>
        <p>
          We verify a human session only when you start an upload. This helps
          protect the analyzer from automated abuse.
        </p>

        <button
          className="button button-primary"
          disabled={isSubmitting}
          onClick={() => void submitVerification()}
          type="button"
        >
          {isSubmitting ? "Verifying..." : "Complete security check"}
        </button>

        {error && (
          <div className="translator-error" role="alert">
            {error}
          </div>
        )}

        <button className="button button-ghost" onClick={onClose} type="button">
          Cancel
        </button>
      </section>
    </div>
  );
}
