import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  apiErrorResponse,
  apiSuccessResponse,
  apiWarningResponse,
} from "../src/app/api/pda-iep-advice/analyze/route";
import { PublicApiError } from "../src/lib/server/errors";
import { parseStoredJson } from "../src/lib/server/security";
import { MOCK_ANALYZE_REPORT } from "../src/lib/server/mock-analysis";

const projectRoot = process.cwd();

describe("PDA IEP Advice API response shape", () => {
  it("returns successful analyzer data in the shared safe response shape", async () => {
    const response = apiSuccessResponse(MOCK_ANALYZE_REPORT);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: MOCK_ANALYZE_REPORT,
    });
  });

  it("returns public API errors in the shared safe response shape", async () => {
    const response = apiErrorResponse(
      new PublicApiError(
        "Complete the security check before uploading files.",
        403,
        "VERIFICATION_REQUIRED",
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      type: "error",
      code: "VERIFICATION_REQUIRED",
      message: "Complete the security check before uploading files.",
    });
  });

  it("returns likely-irrelevant warnings with a one-use warning id", async () => {
    const response = apiWarningResponse(
      "LIKELY_IRRELEVANT",
      "This PDF does not appear to be a school support document.",
      "signed-token",
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      type: "warning",
      code: "LIKELY_IRRELEVANT",
      message: "This PDF does not appear to be a school support document.",
      warningId: "signed-token",
    });
  });

  it("parses serialized JSON strings from the security store", () => {
    expect(parseStoredJson<{ ok: boolean }>('{"ok":true}')).toEqual({
      ok: true,
    });
  });

  it("accepts already-parsed security store objects", () => {
    expect(parseStoredJson<{ ok: boolean }>({ ok: true })).toEqual({
      ok: true,
    });
  });

  it("rejects unsupported security store primitive values", () => {
    expect(() => parseStoredJson(42)).toThrow(PublicApiError);
  });

  it("does not introduce a PDA IEP Advice analytics route for uploaded documents", () => {
    expect(existsSync(join(projectRoot, "src/app/api/pda-iep-advice/analytics"))).toBe(
      false,
    );
    expect(existsSync(join(projectRoot, "src/app/api/analytics"))).toBe(false);
  });
});
