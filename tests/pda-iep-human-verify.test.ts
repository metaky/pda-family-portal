import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDefaultMockMode,
  getDefaultPdaIepAnalyzeEnabled,
  getDefaultSecurityMemoryStore,
  getDefaultTestTokenAllowance,
  getServerConfig,
  resetServerConfigForTests,
} from "../src/lib/server/config";
import {
  apiVerifyErrorResponse,
  apiVerifySuccessResponse,
  isValidHumanVerifyBody,
} from "../src/app/api/pda-iep-advice/human-verify/route";
import { PublicApiError } from "../src/lib/server/errors";

const DEFAULT_ENV = {
  FEATURE_PDA_IEP_ANALYZE_ENABLED: process.env.FEATURE_PDA_IEP_ANALYZE_ENABLED,
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
  RAG_MOCK_MODE: process.env.RAG_MOCK_MODE,
  SECURITY_ALLOW_TEST_TOKENS: process.env.SECURITY_ALLOW_TEST_TOKENS,
  SECURITY_USE_MEMORY_STORE: process.env.SECURITY_USE_MEMORY_STORE,
  SESSION_SIGNING_SECRET: process.env.SESSION_SIGNING_SECRET,
};

function restoreEnv() {
  vi.unstubAllEnvs();
  for (const [key, value] of Object.entries(DEFAULT_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  resetServerConfigForTests();
}

describe("PDA IEP Advice human verification config", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("defaults to local mock analyzer settings only in development", () => {
    expect(getDefaultPdaIepAnalyzeEnabled("development")).toBe(true);
    expect(getDefaultMockMode("development")).toBe(true);
    expect(getDefaultSecurityMemoryStore("development")).toBe(true);
    expect(getDefaultTestTokenAllowance("development")).toBe(true);

    expect(getDefaultPdaIepAnalyzeEnabled("production")).toBe(false);
    expect(getDefaultMockMode("production")).toBe(false);
    expect(getDefaultSecurityMemoryStore("production")).toBe(false);
    expect(getDefaultTestTokenAllowance("production")).toBe(false);
  });

  it("uses the local development defaults when explicitly requested", () => {
    vi.stubEnv("NODE_ENV", "development");
    resetServerConfigForTests();

    const config = getServerConfig();

    expect(config.features.pdaIepAnalyze).toBe(true);
    expect(config.maintenanceMode).toBe(false);
    expect(config.mockMode).toBe(true);
    expect(config.security.useMemoryStore).toBe(true);
    expect(config.security.signingSecret).toBeTruthy();
    expect(config.turnstile.allowTestTokens).toBe(true);
    vi.unstubAllEnvs();
  });

  it("rejects test-token verification when the analyzer is enabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FEATURE_PDA_IEP_ANALYZE_ENABLED", "true");
    vi.stubEnv("MAINTENANCE_MODE", "false");
    vi.stubEnv("RAG_MOCK_MODE", "true");
    vi.stubEnv("SECURITY_ALLOW_TEST_TOKENS", "true");
    vi.stubEnv("SECURITY_USE_MEMORY_STORE", "true");
    vi.stubEnv("SESSION_SIGNING_SECRET", "production-signing-secret");
    resetServerConfigForTests();

    expect(() => getServerConfig()).toThrow(
      "SECURITY_ALLOW_TEST_TOKENS=true in production",
    );
  });

  it("validates human verification request bodies", () => {
    expect(
      isValidHumanVerifyBody({
        purpose: "analyze",
        token: "codex-turnstile-test-token",
      }),
    ).toBe(true);
    expect(isValidHumanVerifyBody({ purpose: "behavior-report", token: "x" })).toBe(
      false,
    );
    expect(isValidHumanVerifyBody({ purpose: "analyze" })).toBe(false);
  });

  it("returns verification success in the shared API response shape", async () => {
    const response = apiVerifySuccessResponse();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { verified: true },
    });
  });

  it("returns verification errors in the shared API response shape", async () => {
    const response = apiVerifyErrorResponse(
      new PublicApiError("Human verification failed.", 403, "VERIFY_FAILED"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      type: "error",
      code: "VERIFY_FAILED",
      message: "Human verification failed.",
    });
  });
});
