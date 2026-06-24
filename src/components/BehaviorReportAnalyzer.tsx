"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DualUploadZone } from "@/components/DualUploadZone";
import { HumanVerificationPanel } from "@/components/HumanVerificationPanel";
import { trackPortalEvent } from "@/lib/client/analytics";
import { getDonationHref, isExternalDonationHref } from "@/lib/client/donation";
import { getSecurityHeaders } from "@/lib/client/security";
import type {
  ApiResponse,
  BehaviorReportAnalysis,
} from "@/lib/server/api-types";

type PendingWarning = {
  message: string;
  warningId: string;
};

type PendingSubmission = {
  warningId?: string;
};

type UploadSlot = "behaviorReport" | "iepDocument";

function listItems(items: string[], Icon: typeof CheckCircle2) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <Icon size={16} aria-hidden="true" /> {item}
        </li>
      ))}
    </ul>
  );
}

export function BehaviorReportAnalyzer({
  featureEnabled,
  maintenanceMode,
}: {
  featureEnabled: boolean;
  maintenanceMode: boolean;
}) {
  const [behaviorReport, setBehaviorReport] = useState<File | null>(null);
  const [iepDocument, setIepDocument] = useState<File | null>(null);
  const [result, setResult] = useState<BehaviorReportAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<PendingWarning | null>(null);
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const donationHref = getDonationHref();
  const donationExternal = isExternalDonationHref(donationHref);

  const bothFilesReady = Boolean(behaviorReport && iepDocument);
  const featureUnavailable = maintenanceMode || !featureEnabled;

  function handleFileSelect(slot: UploadSlot, file: File | null, validationError?: string) {
    setError(validationError ?? null);
    setWarning(null);
    setResult(null);

    if (slot === "behaviorReport") {
      setBehaviorReport(file);
    } else {
      setIepDocument(file);
    }
  }

  function removeFile(slot: UploadSlot) {
    if (slot === "behaviorReport") {
      setBehaviorReport(null);
    } else {
      setIepDocument(null);
    }
    setWarning(null);
    setError(null);
  }

  function clearAll() {
    setBehaviorReport(null);
    setIepDocument(null);
    setResult(null);
    setWarning(null);
    setError(null);
    setPendingSubmission(null);
    setVerificationOpen(false);
  }

  async function analyzeDocuments(warningId?: string) {
    if (!behaviorReport || !iepDocument) {
      setError("Upload both PDFs before analyzing.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setWarning(null);

    try {
      const formData = new FormData();
      formData.append("behaviorReport", behaviorReport);
      formData.append("iepDocument", iepDocument);
      if (warningId) {
        formData.append("warningId", warningId);
      }

      const response = await fetch("/api/pda-behavior-report-help/analyze", {
        headers: getSecurityHeaders(),
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ApiResponse<BehaviorReportAnalysis>;

      if (data.ok) {
        setResult(data.data);
        trackPortalEvent("behavior_report_analyze", {
          action: "analyze",
          status: "success",
          tool: "pda_behavior_report_help",
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
      trackPortalEvent("behavior_report_analyze", {
        action: "analyze",
        status: "error",
        tool: "pda_behavior_report_help",
      });
    } catch {
      setError("The behavior report service could not be reached. Please try again.");
      trackPortalEvent("behavior_report_analyze", {
        action: "analyze",
        status: "error",
        tool: "pda_behavior_report_help",
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
          void analyzeDocuments(nextSubmission?.warningId);
        }}
        open={verificationOpen}
        purpose="behavior-report"
      />

      <section className="panel analyzer-panel">
        <span className="status">Native migration in progress</span>
        <h1 className="page-title" style={{ marginTop: 16 }}>
          PDA Behavior Report Help
        </h1>
        <p className="lede">
          Compare a behavior incident report with an IEP or 504 plan to spot
          missed supports, PDA-aware context, and practical next steps.
        </p>

        <div className="notice">
          <FileSearch size={22} aria-hidden="true" />
          <p style={{ margin: 0 }}>
            Uploads are processed only when you choose to analyze. Use this as a
            preparation tool for school conversations, not as legal or clinical advice.
          </p>
        </div>

        {featureUnavailable ? (
          <div className="translator-error" role="alert">
            PDA Behavior Report Help is temporarily unavailable.
          </div>
        ) : (
          <div className="analyzer-upload-stack">
            <DualUploadZone
              behaviorReport={behaviorReport}
              iepDocument={iepDocument}
              isProcessing={isProcessing}
              onFileSelect={handleFileSelect}
              onRemove={removeFile}
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
                  <strong>These uploads may not match the expected documents.</strong>
                  <p>{warning.message}</p>
                  <button
                    className="button button-secondary"
                    disabled={isProcessing}
                    onClick={() => void analyzeDocuments(warning.warningId)}
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
                disabled={!bothFilesReady || isProcessing}
                onClick={() => void analyzeDocuments()}
                type="button"
              >
                <Sparkles size={17} />
                {isProcessing
                  ? "Analyzing..."
                  : bothFilesReady
                    ? "Analyze behavior report"
                    : "Upload both PDFs to continue"}
              </button>
              <button
                className="button button-secondary"
                disabled={isProcessing || (!behaviorReport && !iepDocument && !result)}
                onClick={clearAll}
                type="button"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="sheet-preview analyzer-results" data-ph-no-capture>
        {!result ? (
          <div className="translator-empty">
            <FileSearch size={26} aria-hidden="true" />
            <p>
              Behavior Incident Analysis will appear here after both PDFs are
              uploaded and reviewed.
            </p>
          </div>
        ) : (
          <div className="analyzer-report printable-analysis">
            <div className="analyzer-report-header">
              <div>
                <span className="status">Behavior Incident Analysis</span>
                <h2>Behavior Incident Analysis</h2>
              </div>
              <button
                className="button button-secondary no-print"
                onClick={() => {
                  trackPortalEvent("behavior_report_print", {
                    action: "print",
                    tool: "pda_behavior_report_help",
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
                <h3>What went well</h3>
                {listItems(result.whatWentWell, CheckCircle2)}
              </div>
              <div>
                <h3>What could be better</h3>
                {listItems(result.whatCouldBeBetter, AlertTriangle)}
              </div>
            </div>

            <div className="finding-list">
              <h3>IEP guidance that should shape the response</h3>
              {result.iepGuidance.map((item) => (
                <article
                  className="finding-card finding-behavior-plan"
                  key={`${item.title}-${item.page ?? "na"}`}
                >
                  <div className="finding-card-header">
                    <strong>{item.title}</strong>
                    <span>{item.source ?? "IEP"}</span>
                  </div>
                  <p>{item.description}</p>
                  {item.quote ? (
                    <blockquote>
                      "{item.quote}"
                      {item.page ? ` (page ${item.page})` : ""}
                    </blockquote>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="analyzer-two-column">
              <div>
                <h3>Future recommendations</h3>
                {listItems(result.futureRecommendations, Sparkles)}
              </div>
              <div>
                <h3>PDA considerations</h3>
                <ul>
                  {result.pdaConsiderations.map((item) => (
                    <li key={item.strategy}>
                      <Sparkles size={16} aria-hidden="true" />
                      <span>
                        <strong>{item.strategy}:</strong> {item.explanation}{" "}
                        {item.howToImplement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="donation-panel no-print">
              <div>
                <strong>
                  If this helped you prepare for a school conversation, you can
                  help keep the portal free.
                </strong>
                <p className="small-copy" style={{ margin: "4px 0 0" }}>
                  Donations support practical PDA tools for the next parent.
                </p>
              </div>
              <a
                className="button button-coral"
                href={donationHref}
                onClick={() =>
                  trackPortalEvent("donation_click", {
                    source: "pda_behavior_report_help",
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
