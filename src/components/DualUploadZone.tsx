"use client";

import type { ChangeEvent } from "react";
import { FileText, UploadCloud, XCircle } from "lucide-react";

type UploadSlot = "behaviorReport" | "iepDocument";

type DualUploadZoneProps = {
  behaviorReport: File | null;
  iepDocument: File | null;
  isProcessing: boolean;
  onFileSelect: (slot: UploadSlot, file: File | null, error?: string) => void;
  onRemove: (slot: UploadSlot) => void;
};

function UploadBox({
  description,
  file,
  inputLabel,
  isProcessing,
  onChange,
  onRemove,
  title,
}: {
  description: string;
  file: File | null;
  inputLabel: string;
  isProcessing: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  title: string;
}) {
  return (
    <div className="upload-zone" data-ph-no-capture>
      <label className={`upload-target ${file ? "has-file" : ""}`}>
        <input
          aria-label={inputLabel}
          accept="application/pdf,.pdf"
          disabled={isProcessing}
          onChange={onChange}
          type="file"
        />
        {!file ? (
          <span className="upload-empty">
            <span className="upload-icon" aria-hidden="true">
              <UploadCloud size={30} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </span>
        ) : (
          <span className="upload-file">
            <span className="upload-file-icon" aria-hidden="true">
              <FileText size={24} />
            </span>
            <span className="upload-file-copy">
              <strong>{file.name}</strong>
              <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </span>
          </span>
        )}
      </label>

      {file && !isProcessing && (
        <button className="button button-secondary" onClick={onRemove} type="button">
          <XCircle size={16} /> Remove file
        </button>
      )}
    </div>
  );
}

export function DualUploadZone({
  behaviorReport,
  iepDocument,
  isProcessing,
  onFileSelect,
  onRemove,
}: DualUploadZoneProps) {
  function handleChange(slot: UploadSlot, event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      onFileSelect(slot, null, "Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    onFileSelect(slot, selectedFile);
  }

  return (
    <div className="analyzer-two-column">
      <UploadBox
        description="Choose the school incident report you want to understand."
        file={behaviorReport}
        inputLabel="Upload behavior incident report PDF"
        isProcessing={isProcessing}
        onChange={(event) => handleChange("behaviorReport", event)}
        onRemove={() => onRemove("behaviorReport")}
        title="Behavior incident report"
      />
      <UploadBox
        description="Choose the plan that describes the supports school should use."
        file={iepDocument}
        inputLabel="Upload IEP or 504 PDF for comparison"
        isProcessing={isProcessing}
        onChange={(event) => handleChange("iepDocument", event)}
        onRemove={() => onRemove("iepDocument")}
        title="IEP or 504 plan"
      />
    </div>
  );
}
