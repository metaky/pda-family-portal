import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  preflightBehaviorReportUploads,
  preflightPdfUpload,
} from "../src/lib/server/uploads";
import { resetServerConfigForTests } from "../src/lib/server/config";

const BEHAVIOR_FIXTURE_PDF = join(
  "/Users/kyle.wegner/Antigravity",
  "tests/fixtures/test_behavior_report.pdf",
);
const IEP_FIXTURE_PDF = join(
  "/Users/kyle.wegner/Antigravity",
  "tests/fixtures/test_iep.pdf",
);

const DEFAULT_ENV = {
  UPLOAD_MAX_FILE_BYTES: process.env.UPLOAD_MAX_FILE_BYTES,
  UPLOAD_MAX_PDF_PAGES: process.env.UPLOAD_MAX_PDF_PAGES,
  UPLOAD_MAX_PAGE_WIDTH: process.env.UPLOAD_MAX_PAGE_WIDTH,
  UPLOAD_MAX_PAGE_HEIGHT: process.env.UPLOAD_MAX_PAGE_HEIGHT,
  UPLOAD_MIN_TEXT_LENGTH: process.env.UPLOAD_MIN_TEXT_LENGTH,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(DEFAULT_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  resetServerConfigForTests();
}

function createFile(buffer: Buffer, name: string, type = "application/pdf") {
  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(buffer);
  return new File([bytes.buffer], name, { type });
}

function createFormData({
  behaviorReport,
  iepDocument,
}: {
  behaviorReport?: File;
  iepDocument?: File;
}) {
  const formData = new FormData();
  if (behaviorReport) {
    formData.append("behaviorReport", behaviorReport);
  }
  if (iepDocument) {
    formData.append("iepDocument", iepDocument);
  }
  return formData;
}

describe("PDA Behavior Report Help dual-upload preflight", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("accepts a behavior report PDF and IEP or 504 PDF as one validation pair", async () => {
    const result = await preflightBehaviorReportUploads(
      createFormData({
        behaviorReport: createFile(
          readFileSync(BEHAVIOR_FIXTURE_PDF),
          "incident-report.pdf",
        ),
        iepDocument: createFile(readFileSync(IEP_FIXTURE_PDF), "iep.pdf"),
      }),
    );

    expect(result.behaviorReport.fileName).toBe("incident-report.pdf");
    expect(result.iepDocument.fileName).toBe("iep.pdf");
    expect(result.uploadPairHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.combinedExtractedText.toLowerCase()).toContain("incident");
    expect(result.combinedExtractedText.toLowerCase()).toContain("iep");
  });

  it("rejects when the behavior report PDF is missing", async () => {
    await expect(
      preflightBehaviorReportUploads(
        createFormData({
          iepDocument: createFile(readFileSync(IEP_FIXTURE_PDF), "iep.pdf"),
        }),
      ),
    ).rejects.toMatchObject({
      code: "BEHAVIOR_REPORT_REQUIRED",
    });
  });

  it("rejects when the IEP or 504 PDF is missing", async () => {
    await expect(
      preflightBehaviorReportUploads(
        createFormData({
          behaviorReport: createFile(
            readFileSync(BEHAVIOR_FIXTURE_PDF),
            "incident-report.pdf",
          ),
        }),
      ),
    ).rejects.toMatchObject({
      code: "IEP_DOCUMENT_REQUIRED",
    });
  });

  it("continues to reject invalid bytes inside either upload slot", async () => {
    await expect(
      preflightBehaviorReportUploads(
        createFormData({
          behaviorReport: createFile(Buffer.from("not a pdf"), "fake.pdf"),
          iepDocument: createFile(readFileSync(IEP_FIXTURE_PDF), "iep.pdf"),
        }),
      ),
    ).rejects.toMatchObject({
      code: "INVALID_FILE_TYPE",
    });
  });

  it("keeps the single-upload preflight reusable for PDA IEP Advice", async () => {
    const upload = await preflightPdfUpload(
      createFile(readFileSync(IEP_FIXTURE_PDF), "iep.pdf"),
    );

    expect(upload.fileName).toBe("iep.pdf");
    expect(upload.mimeType).toBe("application/pdf");
  });
});
