import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  apiBehaviorErrorResponse,
  apiBehaviorSuccessResponse,
  apiBehaviorWarningResponse,
} from "../src/app/api/pda-behavior-report-help/analyze/route";
import { MOCK_BEHAVIOR_REPORT } from "../src/lib/server/mock-analysis";
import { PublicApiError } from "../src/lib/server/errors";
import { isValidHumanVerifyBody } from "../src/app/api/pda-iep-advice/human-verify/route";

const projectRoot = process.cwd();

describe("PDA Behavior Report Help API response shape", () => {
  it("returns successful behavior report analysis in the shared safe response shape", async () => {
    const response = apiBehaviorSuccessResponse(MOCK_BEHAVIOR_REPORT);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: MOCK_BEHAVIOR_REPORT,
    });
  });

  it("returns public API errors in the shared safe response shape", async () => {
    const response = apiBehaviorErrorResponse(
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
    const response = apiBehaviorWarningResponse(
      "LIKELY_IRRELEVANT",
      "These uploads may not be a behavior report and school support document.",
      "signed-token",
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      type: "warning",
      code: "LIKELY_IRRELEVANT",
      message: "These uploads may not be a behavior report and school support document.",
      warningId: "signed-token",
    });
  });

  it("allows human verification sessions for behavior report analysis separately from IEP analysis", () => {
    expect(
      isValidHumanVerifyBody({
        purpose: "behavior-report",
        token: "codex-turnstile-test-token",
      }),
    ).toBe(true);
  });

  it("does not introduce a behavior-report analytics route for uploaded documents", () => {
    expect(
      existsSync(join(projectRoot, "src/app/api/pda-behavior-report-help/analytics")),
    ).toBe(false);
    expect(existsSync(join(projectRoot, "src/app/api/analytics"))).toBe(false);
  });
});
