import type { HumanVerificationMode } from "@/lib/human-verification";

type ServerConfig = {
  features: {
    pdaIepAnalyze: boolean;
  };
  maintenanceMode: boolean;
  mockMode: boolean;
  security: {
    sessionCookieName: string;
    sessionTtlSeconds: number;
    warningTtlSeconds: number;
    analyzeQuota: number;
    humanVerifyWindowSeconds: number;
    humanVerifyMaxAttempts: number;
    analyzeIpWindowSeconds: number;
    analyzeIpMaxAttempts: number;
    signingSecret: string | null;
    browserIdHeader: string;
    useMemoryStore: boolean;
  };
  turnstile: {
    siteKey: string | null;
    secretKey: string | null;
    allowTestTokens: boolean;
    testToken: string;
  };
  uploads: {
    maxFileBytes: number;
    maxPdfPages: number;
    maxPageWidth: number;
    maxPageHeight: number;
    minExtractedTextLength: number;
  };
  models: {
    geminiApiKey: string | null;
    geminiModel: string;
  };
};

let cachedConfig: ServerConfig | null = null;

export function getDefaultPdaIepAnalyzeEnabled(
  nodeEnv = process.env.NODE_ENV,
) {
  return nodeEnv === "development";
}


export function getDefaultMaintenanceMode(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv !== "development";
}

export function getDefaultMockMode(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "development";
}

export function getDefaultSecurityMemoryStore(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "development";
}

export function getDefaultTestTokenAllowance(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "development";
}

function getDefaultSigningSecret(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "development"
    ? "pda-portal-local-development-signing-secret"
    : null;
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function parseNumber(value: string | undefined, fallback: number) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateConfig(config: ServerConfig) {
  if (!config.features.pdaIepAnalyze) {
    return config;
  }

  if (process.env.NODE_ENV === "production" && config.turnstile.allowTestTokens) {
    throw new Error(
      "FEATURE_PDA_IEP_ANALYZE_ENABLED cannot use SECURITY_ALLOW_TEST_TOKENS=true in production.",
    );
  }

  if (!config.security.useMemoryStore) {
    throw new Error(
      "FEATURE_PDA_IEP_ANALYZE_ENABLED requires SECURITY_USE_MEMORY_STORE=true until production session storage is configured.",
    );
  }

  if (!config.turnstile.allowTestTokens && !config.turnstile.secretKey) {
    throw new Error(
      "FEATURE_PDA_IEP_ANALYZE_ENABLED requires TURNSTILE_SECRET_KEY or SECURITY_ALLOW_TEST_TOKENS=true.",
    );
  }

  if (!config.security.signingSecret) {
    throw new Error(
      "FEATURE_PDA_IEP_ANALYZE_ENABLED requires SESSION_SIGNING_SECRET for warning/session protection.",
    );
  }

  if (!config.mockMode && !config.models.geminiApiKey) {
    throw new Error(
      "FEATURE_PDA_IEP_ANALYZE_ENABLED requires GEMINI_API_KEY unless RAG_MOCK_MODE=true.",
    );
  }

  return config;
}

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = validateConfig({
    features: {
      pdaIepAnalyze: parseBoolean(
        process.env.FEATURE_PDA_IEP_ANALYZE_ENABLED,
        getDefaultPdaIepAnalyzeEnabled(),
      ),
    },
    maintenanceMode: parseBoolean(
      process.env.MAINTENANCE_MODE,
      getDefaultMaintenanceMode(),
    ),
    mockMode: parseBoolean(process.env.RAG_MOCK_MODE, getDefaultMockMode()),
    security: {
      sessionCookieName:
        process.env.SESSION_COOKIE_NAME ?? "pda_verified_session",
      sessionTtlSeconds: parseNumber(process.env.SESSION_TTL_SECONDS, 600),
      warningTtlSeconds: parseNumber(process.env.WARNING_TTL_SECONDS, 300),
      analyzeQuota: parseNumber(process.env.ANALYZE_SESSION_QUOTA, 3),
      humanVerifyWindowSeconds: parseNumber(
        process.env.HUMAN_VERIFY_WINDOW_SECONDS,
        300,
      ),
      humanVerifyMaxAttempts: parseNumber(
        process.env.HUMAN_VERIFY_MAX_ATTEMPTS,
        5,
      ),
      analyzeIpWindowSeconds: parseNumber(
        process.env.ANALYZE_IP_WINDOW_SECONDS,
        600,
      ),
      analyzeIpMaxAttempts: parseNumber(
        process.env.ANALYZE_IP_MAX_ATTEMPTS,
        6,
      ),
      signingSecret:
        process.env.SESSION_SIGNING_SECRET ?? getDefaultSigningSecret(),
      browserIdHeader: "x-browser-id",
      useMemoryStore: parseBoolean(
        process.env.SECURITY_USE_MEMORY_STORE,
        getDefaultSecurityMemoryStore(),
      ),
    },
    turnstile: {
      siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
      secretKey: process.env.TURNSTILE_SECRET_KEY ?? null,
      allowTestTokens: parseBoolean(
        process.env.SECURITY_ALLOW_TEST_TOKENS,
        getDefaultTestTokenAllowance(),
      ),
      testToken:
        process.env.SECURITY_TEST_TOKEN ?? "codex-turnstile-test-token",
    },
    uploads: {
      maxFileBytes: parseNumber(
        process.env.UPLOAD_MAX_FILE_BYTES,
        20 * 1024 * 1024,
      ),
      maxPdfPages: parseNumber(process.env.UPLOAD_MAX_PDF_PAGES, 200),
      maxPageWidth: parseNumber(process.env.UPLOAD_MAX_PAGE_WIDTH, 2000),
      maxPageHeight: parseNumber(process.env.UPLOAD_MAX_PAGE_HEIGHT, 2000),
      minExtractedTextLength: parseNumber(
        process.env.UPLOAD_MIN_TEXT_LENGTH,
        40,
      ),
    },
    models: {
      geminiApiKey: process.env.GEMINI_API_KEY ?? null,
      geminiModel: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
    },
  });

  return cachedConfig;
}

export function getHumanVerificationMode(
  config: ServerConfig = getServerConfig(),
): HumanVerificationMode {
  if (config.turnstile.siteKey && config.turnstile.secretKey) {
    return "turnstile";
  }

  if (config.turnstile.allowTestTokens) {
    return "test";
  }

  return "unconfigured";
}

export function resetServerConfigForTests() {
  cachedConfig = null;
}
