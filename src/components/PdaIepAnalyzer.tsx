"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { HumanVerificationPanel } from "@/components/HumanVerificationPanel";
import { UploadZone } from "@/components/UploadZone";
import { trackPortalEvent } from "@/lib/client/analytics";
import { getDonationHref, isExternalDonationHref } from "@/lib/client/donation";
import { getSecurityHeaders } from "@/lib/client/security";
import type {
  AnalyzeFindingCategory,
  AnalyzeReport,
  ApiResponse,
} from "@/lib/server/api-types";

type PendingWarning = {
  message: string;
  warningId: string;
};

type PendingSubmission = {
  warningId?: string;
};

const categoryLabels: AnalyzeFindingCategory[] = [
  "Goal",
  "Accommodation",
  "Service",
  "Behavior Plan",
  "General",
];

function categoryClassName(category: string) {
  return `finding-card finding-${category.toLowerCase().replace(/\s+/g, "-")}`;
}

export function PdaIepAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<PendingWarning | null>(null);
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const donationHref = getDonationHref();
  const donationExternal = isExternalDonationHref(donationHref);

  const groupedFindings = useMemo(() => {
    if (!result) {
      return [];
    }

    return categoryLabels
      .map((category) => ({
        category,
        items: result.results.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [result]);

  function handleFileSelect(nextFile: File | null, validationError?: string) {
    setError(validationError ?? null);
    setWarning(null);
    setResult(null);
    setFile(nextFile);
  }

  function clearUpload() {
    setFile(null);
    setResult(null);
    setWarning(null);
    setError(null);
    setPendingSubmission(null);
    setVerificationOpen(false);
  }

  async function analyzeDocument(warningId?: string) {
    if (!file) {
      setError("Upload an IEP or 504 PDF before analyzing.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setWarning(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (warningId) {
        formData.append("warningId", warningId);
      }

      const response = await fetch("/api/pda-iep-advice/analyze", {
        headers: getSecurityHeaders(),
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ApiResponse<AnalyzeReport>;

      if (data.ok) {
        setResult(data.data);
        trackPortalEvent("pda_iep_analyze", {
          action: "analyze",
          status: "success",
          tool: "pda_iep_advice",
        });
        return;
      }

      if (data.type === "warning") {
        setWarning({
          message: data.message,
          warningId: data.warningId,
        });
        return;
      }

      if (
        data.code === "VERIFICATION_REQUIRED" ||
        data.code === "SESSION_EXPIRED" ||
        data.code === "SESSION_MISMATCH"
      ) {
        setPendingSubmission({ warningId });
        setVerificationOpen(true);
        return;
      }

      setError(data.message);
      trackPortalEvent("pda_iep_analyze", {
        action: "analyze",
        status: "error",
        tool: "pda_iep_advice",
      });
    } catch {
      setError("The analysis service could not be reached. Please try again.");
      trackPortalEvent("pda_iep_analyze", {
        action: "analyze",
        status: "error",
        tool: "pda_iep_advice",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="analyzer-layout">
      <HumanVerificationPanel
        onClose={() => setVerificationOpen(false)}
        onVerified={() => {
          const nextSubmission = pendingSubmission;
          setVerificationOpen(false);
          setPendingSubmission(null);
          void analyzeDocument(nextSubmission?.warningId);
        }}
        open={verificationOpen}
      />
      <section className="panel analyzer-panel">
        <span className="status">Prepare for school advocacy</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          Review an IEP or 504 Plan
        </h1>
        <p className="lede">
          Upload a school support plan and get a PDA-aware review you can use
          before an IEP meeting, email, or request for changes.
        </p>

        <div className="notice">
          <FileSearch size={22} aria-hidden="true" />
          <p style={{ margin: 0 }}>
            The document is sent only when you choose to analyze it. Use the
            result as preparation for school conversations, not as legal advice.
          </p>
        </div>

        <div className="analyzer-upload-stack">
          <UploadZone
            file={file}
            isProcessing={isProcessing}
            onFileSelect={handleFileSelect}
            onRemove={clearUpload}
          />

          {error && (
            <div className="translator-error" role="alert">
              {error}
            </div>
          )}

          {warning && (
            <div className="warning-panel" role="alert">
              <AlertTriangle size={20} aria-hidden="true" />
              <div>
                <strong>This may not be a school support document.</strong>
                <p>{warning.message}</p>
                <button
                  className="button button-secondary"
                  disabled={isProcessing}
                  onClick={() => void analyzeDocument(warning.warningId)}
                  type="button"
                >
                  Analyze anyway
                </button>
              </div>
            </div>
          )}

          <div className="translator-actions">
            <button
              className="button button-primary"
              disabled={!file || isProcessing}
              onClick={() => void analyzeDocument()}
              type="button"
            >
              <Sparkles size={17} />
              {isProcessing ? "Analyzing..." : "Analyze document"}
            </button>
            <button
              className="button button-secondary"
              disabled={isProcessing || (!file && !result)}
              onClick={clearUpload}
              type="button"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>
      </section>

      <section className="sheet-preview analyzer-results" data-ph-no-capture>
        {!result ? (
          <div className="translator-empty">
            <FileSearch size={26} aria-hidden="true" />
            <p>
              Your review will appear here after upload. It will focus on
              language you can discuss with school staff, not generic PDA facts.
            </p>
          </div>
        ) : (
          <div className="analyzer-report printable-analysis">
            <div className="analyzer-report-header">
              <div>
                <span className="status">PDA-aware review</span>
                <h2>{result.score} / 100</h2>
              </div>
              <button
                className="button button-secondary no-print"
                onClick={() => {
                  trackPortalEvent("pda_iep_print", {
                    action: "print",
                    tool: "pda_iep_advice",
                  });
                  window.print();
                }}
                type="button"
              >
                <Printer size={16} /> Print or save
              </button>
            </div>

            <p className="analyzer-summary">{result.summary}</p>

            <div className="analyzer-two-column">
              <div>
                <h3>Strengths</h3>
                <ul>
                  {result.strengths.map((strength) => (
                    <li key={strength}>
                      <CheckCircle2 size={16} aria-hidden="true" /> {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Places to strengthen</h3>
                <ul>
                  {result.opportunities.map((opportunity) => (
                    <li key={opportunity}>
                      <AlertTriangle size={16} aria-hidden="true" /> {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="category-suggestions">
              <h3>Language to Ask About</h3>
              {Object.entries(result.categorySuggestions).map(([category, suggestions]) => (
                <div className="suggestion-row" key={category}>
                  <strong>{category}</strong>
                  <p>
                    Add: {suggestions.add.length > 0 ? suggestions.add.join("; ") : "No additions suggested."}
                  </p>
                  <p>
                    Rewrite or remove:{" "}
                    {suggestions.remove.length > 0
                      ? suggestions.remove.join("; ")
                      : "No removals suggested."}
                  </p>
                </div>
              ))}
            </div>

            <div className="finding-list">
              <h3>What to Bring Into the Conversation</h3>
              {groupedFindings.map((group) => (
                <div className="finding-group" key={group.category}>
                  <h4>{group.category}</h4>
                  {group.items.map((finding) => (
                    <article
                      className={categoryClassName(group.category)}
                      key={`${finding.category}-${finding.title}`}
                    >
                      <div className="finding-card-header">
                        <strong>{finding.title}</strong>
                        <span>{finding.status}</span>
                      </div>
                      <p>{finding.description}</p>
                      <p>
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                      <blockquote>
                        "{finding.quote}"
                        {finding.page ? ` (page ${finding.page})` : ""}
                      </blockquote>
                    </article>
                  ))}
                </div>
              ))}
            </div>

            <div className="donation-panel no-print">
              <div>
                <strong>
                  If this helped you prepare for a school conversation, you can
                  help keep the portal free.
                </strong>
                <p className="small-copy" style={{ margin: "4px 0 0" }}>
                  Donations support practical tools for the next parent.
                </p>
              </div>
              <a
                className="button button-coral"
                href={donationHref}
                onClick={() =>
                  trackPortalEvent("donation_click", {
                    source: "pda_iep_advice",
                    target: "donation",
                  })
                }
                rel={donationExternal ? "noreferrer" : undefined}
                target={donationExternal ? "_blank" : undefined}
              >
                Donate
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
