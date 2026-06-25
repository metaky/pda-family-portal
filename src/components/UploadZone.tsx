"use client";

import type { ChangeEvent } from "react";
import { FileText, UploadCloud, XCircle } from "lucide-react";

export function UploadZone({
  file,
  isProcessing,
  onFileSelect,
  onRemove,
}: {
  file: File | null;
  isProcessing: boolean;
  onFileSelect: (file: File | null, error?: string) => void;
  onRemove: () => void;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      onFileSelect(null, "Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    onFileSelect(selectedFile);
  }

  return (
    <div className="upload-zone" data-ph-no-capture>
      <label className={`upload-target ${file ? "has-file" : ""}`}>
        <input
          aria-label="Upload IEP or 504 PDF"
          accept="application/pdf,.pdf"
          disabled={isProcessing}
          onChange={handleChange}
          type="file"
        />
        {!file ? (
          <span className="upload-empty">
            <span className="upload-icon" aria-hidden="true">
              <UploadCloud size={30} />
            </span>
            <span>
              <strong>Upload IEP or 504 PDF</strong>
              <small>
                Choose the school support document you want help reviewing.
              </small>
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
