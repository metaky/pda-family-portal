import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import zlib from "zlib";
import { getServerConfig } from "@/lib/server/config";
import { PublicApiError } from "@/lib/server/errors";

const SCHOOL_KEYWORDS = [
  "iep",
  "504",
  "accommodation",
  "accommodations",
  "behavior",
  "incident",
  "student",
  "school",
  "education",
  "special education",
  "goal",
  "services",
  "support",
  "classroom",
  "parent",
];

export type PreflightedUpload = {
  fileName: string;
  mimeType: "application/pdf";
  buffer: Buffer;
  fileHash: string;
  pageCount: number;
  extractedText: string;
};

export type PreflightedBehaviorReportUploads = {
  behaviorReport: PreflightedUpload;
  iepDocument: PreflightedUpload;
  uploadPairHash: string;
  combinedExtractedText: string;
};

function isPdf(buffer: Buffer) {
  return buffer.subarray(0, 5).toString("utf8") === "%PDF-";
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function sniffPdfText(buffer: Buffer) {
  return normalizeText(buffer.toString("latin1").replace(/[^\x20-\x7e]+/g, " "));
}

function decodePdfLiteralString(value: string) {
  return value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8)),
    );
}

function decodePdfHexString(value: string) {
  const sanitized = value.replace(/\s+/g, "");
  if (sanitized.length === 0) {
    return "";
  }

  const padded =
    sanitized.length % 2 === 0 ? sanitized : `${sanitized}0`;
  const bytes = Buffer.from(padded, "hex");

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return Buffer.from(bytes.subarray(2)).swap16().toString("utf16le").replace(/\0/g, "");
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return Buffer.from(bytes.subarray(2)).toString("utf16le").replace(/\0/g, "");
  }

  return bytes.toString("latin1");
}

function extractPdfOperandText(content: string) {
  const matches = content.match(/\((?:\\.|[^\\)])*\)|<[\da-fA-F\s]*>/g) ?? [];
  return matches
    .map((item) => {
      if (item.startsWith("(")) {
        return decodePdfLiteralString(item.slice(1, -1));
      }

      return decodePdfHexString(item.slice(1, -1));
    })
    .filter(Boolean)
    .join(" ");
}

function extractStringsFromContent(content: string) {
  const extracted: string[] = [];
  const textBlockRegex = /BT[\s\S]*?ET/g;
  const textBlocks = content.match(textBlockRegex) ?? [content];

  for (const textBlock of textBlocks) {
    const textOperators =
      textBlock.match(
        /(\((?:\\.|[^\\)])*\)|<[\da-fA-F\s]*>)\s*(?:Tj|'|")|\[(?:[\s\S]*?)\]\s*TJ/g,
      ) ?? [];

    for (const operator of textOperators) {
      const text = extractPdfOperandText(operator);
      if (text.trim()) {
        extracted.push(text);
      }
    }
  }

  return extracted.join(" ");
}

export function extractPdfText(buffer: Buffer) {
  const raw = buffer.toString("latin1");
  const extracted: string[] = [];
  const streamRegex = /(?:<<[\s\S]*?>>)?\s*stream\r?\n([\s\S]*?)endstream/g;
  let match: RegExpExecArray | null = streamRegex.exec(raw);

  while (match) {
    const streamSource = match[1];
    const streamBuffer = Buffer.from(streamSource, "latin1");
    const candidates = [streamSource];

    try {
      candidates.push(zlib.inflateSync(streamBuffer).toString("latin1"));
    } catch {
      // Not every PDF stream is compressed.
    }

    for (const candidate of candidates) {
      const text = extractStringsFromContent(candidate);
      if (text.trim()) {
        extracted.push(text);
      }
    }

    match = streamRegex.exec(raw);
  }

  const combined = normalizeText(extracted.join(" "));
  return combined || sniffPdfText(buffer);
}

export function looksLikeRelevantSchoolDocument(text: string) {
  const normalized = text.toLowerCase();
  return SCHOOL_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export async function preflightPdfUpload(
  file: File | null,
): Promise<PreflightedUpload> {
  const config = getServerConfig();

  if (!file) {
    throw new PublicApiError("A PDF upload is required.", 400, "FILE_REQUIRED");
  }

  if (file.size === 0) {
    throw new PublicApiError("The uploaded PDF is empty.", 400, "EMPTY_FILE");
  }

  if (file.size > config.uploads.maxFileBytes) {
    throw new PublicApiError(
      `The uploaded PDF exceeds the ${(config.uploads.maxFileBytes / 1024 / 1024).toFixed(0)}MB limit.`,
      413,
      "FILE_TOO_LARGE",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdf(buffer)) {
    throw new PublicApiError(
      "Only valid PDF files are supported.",
      400,
      "INVALID_FILE_TYPE",
    );
  }

  let pdfDocument: PDFDocument;
  try {
    pdfDocument = await PDFDocument.load(buffer, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
    });
  } catch {
    throw new PublicApiError(
      "The PDF could not be read. Please upload an unencrypted, valid PDF.",
      400,
      "UNREADABLE_PDF",
    );
  }

  const pageCount = pdfDocument.getPageCount();
  if (pageCount === 0) {
    throw new PublicApiError(
      "The PDF does not contain any readable pages.",
      400,
      "EMPTY_PDF",
    );
  }

  if (pageCount > config.uploads.maxPdfPages) {
    throw new PublicApiError(
      `PDFs are limited to ${config.uploads.maxPdfPages} pages.`,
      413,
      "PAGE_LIMIT_EXCEEDED",
    );
  }

  for (const page of pdfDocument.getPages()) {
    const { width, height } = page.getSize();
    if (
      width > config.uploads.maxPageWidth ||
      height > config.uploads.maxPageHeight
    ) {
      throw new PublicApiError(
        "The PDF uses page dimensions that are too large to process safely.",
        400,
        "PAGE_DIMENSIONS_UNSUPPORTED",
      );
    }
  }

  const extractedText = extractPdfText(buffer);

  return {
    fileName: file.name,
    mimeType: "application/pdf",
    buffer,
    fileHash: crypto.createHash("sha256").update(buffer).digest("hex"),
    pageCount,
    extractedText,
  };
}

function getRequiredPdfUpload(
  formData: FormData,
  fieldName: "behaviorReport" | "iepDocument",
) {
  const value = formData.get(fieldName);
  if (value instanceof File) {
    return value;
  }

  if (fieldName === "behaviorReport") {
    throw new PublicApiError(
      "A behavior incident report PDF is required.",
      400,
      "BEHAVIOR_REPORT_REQUIRED",
    );
  }

  throw new PublicApiError(
    "An IEP or 504 PDF is required.",
    400,
    "IEP_DOCUMENT_REQUIRED",
  );
}

export async function preflightBehaviorReportUploads(
  formData: FormData,
): Promise<PreflightedBehaviorReportUploads> {
  const behaviorReport = await preflightPdfUpload(
    getRequiredPdfUpload(formData, "behaviorReport"),
  );
  const iepDocument = await preflightPdfUpload(
    getRequiredPdfUpload(formData, "iepDocument"),
  );
  const uploadPairHash = crypto
    .createHash("sha256")
    .update(`${behaviorReport.fileHash}:${iepDocument.fileHash}`)
    .digest("hex");

  return {
    behaviorReport,
    iepDocument,
    uploadPairHash,
    combinedExtractedText: `${behaviorReport.extractedText} ${iepDocument.extractedText}`,
  };
}

export function assertLocalRelevance(extractedText: string) {
  const config = getServerConfig();
  if (extractedText.length < config.uploads.minExtractedTextLength) {
    return;
  }

  if (!looksLikeRelevantSchoolDocument(extractedText)) {
    throw new PublicApiError(
      "This PDF does not appear to be a school support document.",
      422,
      "LIKELY_IRRELEVANT",
    );
  }
}
