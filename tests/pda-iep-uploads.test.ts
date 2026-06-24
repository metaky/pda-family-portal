import { describe, expect, it, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertLocalRelevance,
  preflightPdfUpload,
} from "../src/lib/server/uploads";
import {
  getServerConfig,
  resetServerConfigForTests,
} from "../src/lib/server/config";

const FIXTURE_PDF = join(
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

describe("PDA IEP Advice upload preflight", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("accepts valid PDF bytes even when the browser MIME type is wrong", async () => {
    const upload = await preflightPdfUpload(
      createFile(readFileSync(FIXTURE_PDF), "iep.bin", "text/plain"),
    );

    expect(upload.mimeType).toBe("application/pdf");
    expect(upload.fileName).toBe("iep.bin");
    expect(upload.pageCount).toBeGreaterThan(0);
    expect(upload.fileHash).toMatch(/^[a-f0-9]{64}$/);
    expect(upload.extractedText.toLowerCase()).toContain("iep");
  });

  it("rejects invalid bytes even if the browser claims the upload is a PDF", async () => {
    await expect(
      preflightPdfUpload(createFile(Buffer.from("not a pdf"), "fake.pdf")),
    ).rejects.toMatchObject({
      code: "INVALID_FILE_TYPE",
    });
  });

  it("rejects PDFs that exceed the page limit", async () => {
    process.env.UPLOAD_MAX_PDF_PAGES = "0";
    resetServerConfigForTests();

    await expect(
      preflightPdfUpload(createFile(readFileSync(FIXTURE_PDF), "iep.pdf")),
    ).rejects.toMatchObject({
      code: "PAGE_LIMIT_EXCEEDED",
    });
  });

  it("rejects PDFs that exceed the byte limit", async () => {
    process.env.UPLOAD_MAX_FILE_BYTES = "10";
    resetServerConfigForTests();

    await expect(
      preflightPdfUpload(createFile(readFileSync(FIXTURE_PDF), "iep.pdf")),
    ).rejects.toMatchObject({
      code: "FILE_TOO_LARGE",
    });
  });

  it("rejects PDFs with oversized page dimensions", async () => {
    process.env.UPLOAD_MAX_PAGE_WIDTH = "1";
    process.env.UPLOAD_MAX_PAGE_HEIGHT = "1";
    resetServerConfigForTests();

    await expect(
      preflightPdfUpload(createFile(readFileSync(FIXTURE_PDF), "iep.pdf")),
    ).rejects.toMatchObject({
      code: "PAGE_DIMENSIONS_UNSUPPORTED",
    });
  });

  it("local relevance check rejects obvious non-school content", () => {
    expect(() =>
      assertLocalRelevance(
        "grocery receipt shopping list apples milk bread total due",
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "LIKELY_IRRELEVANT",
      }),
    );
  });

  it("config exposes nonzero upload defaults", () => {
    const config = getServerConfig();

    expect(config.uploads.maxFileBytes).toBeGreaterThan(1024 * 1024);
    expect(config.uploads.maxPdfPages).toBeGreaterThan(0);
    expect(config.uploads.maxPageWidth).toBeGreaterThan(0);
    expect(config.uploads.maxPageHeight).toBeGreaterThan(0);
    expect(config.uploads.minExtractedTextLength).toBeGreaterThan(0);
  });
});
