import crypto from "crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getServerConfig } from "@/lib/server/config";
import { PublicApiError } from "@/lib/server/errors";
import { getSecurityStore } from "@/lib/server/security-store";

export type RoutePurpose = "analyze" | "behavior-report";

type VerifiedSessionRecord = {
  id: string;
  purpose: RoutePurpose;
  ipHash: string;
  userAgentHash: string;
  browserIdHash: string;
  quotaRemaining: number;
  createdAt: number;
  expiresAt: number;
};

type WarningRecord = {
  id: string;
  sessionId: string;
  endpoint: RoutePurpose;
  fileHash: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
};

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function signToken(value: string) {
  const config = getServerConfig();
  if (!config.security.signingSecret) {
    throw new PublicApiError(
      "Security configuration missing.",
      503,
      "SECURITY_UNAVAILABLE",
      true,
    );
  }

  return crypto
    .createHmac("sha256", config.security.signingSecret)
    .update(value)
    .digest("hex");
}

function serializeToken(id: string) {
  return `${id}.${signToken(id)}`;
}

function deserializeToken(token: string) {
  const [id, signature] = token.split(".");
  if (!id || !signature || signToken(id) !== signature) {
    throw new PublicApiError(
      "Security token is invalid.",
      403,
      "INVALID_SECURITY_TOKEN",
    );
  }
  return id;
}

async function getRequiredStore() {
  const store = getSecurityStore();
  if (!store) {
    throw new PublicApiError(
      "Security services are unavailable.",
      503,
      "SECURITY_UNAVAILABLE",
      true,
    );
  }
  return store;
}

export function parseStoredJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }

  if (typeof value === "object") {
    return value as T;
  }

  throw new PublicApiError(
    "Security session data is invalid.",
    503,
    "SECURITY_UNAVAILABLE",
    true,
  );
}

async function getJson<T>(key: string): Promise<T | null> {
  const store = await getRequiredStore();
  const value = await store.get(key);
  return parseStoredJson<T>(value);
}

async function setJson(key: string, value: unknown, ttlSeconds: number) {
  const store = await getRequiredStore();
  await store.set(key, JSON.stringify(value), ttlSeconds);
}

function getSessionKey(id: string) {
  return `security:session:${id}`;
}

function getWarningKey(id: string) {
  return `security:warning:${id}`;
}

function getRateKey(scope: string, parts: string[]) {
  return `security:rate:${scope}:${parts.join(":")}`;
}

export function getBrowserId(req: NextRequest) {
  return req.headers.get(getServerConfig().security.browserIdHeader) ?? "unknown";
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }

  const realIp = req.headers.get("x-real-ip");
  return realIp?.trim() || "127.0.0.1";
}

export function getRequestFingerprint(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const browserId = getBrowserId(req);

  return {
    ip,
    ipHash: sha256(ip),
    userAgentHash: sha256(userAgent),
    browserIdHash: sha256(browserId),
  };
}

export async function enforceHumanVerifyRateLimit(req: NextRequest) {
  const config = getServerConfig();
  const fingerprint = getRequestFingerprint(req);
  const store = await getRequiredStore();

  const ipCount = await store.incr(
    getRateKey("human-verify-ip", [fingerprint.ipHash]),
    config.security.humanVerifyWindowSeconds,
  );
  const browserCount = await store.incr(
    getRateKey("human-verify-browser", [fingerprint.browserIdHash]),
    config.security.humanVerifyWindowSeconds,
  );

  if (
    ipCount > config.security.humanVerifyMaxAttempts ||
    browserCount > config.security.humanVerifyMaxAttempts
  ) {
    throw new PublicApiError(
      "Too many verification attempts. Please wait a few minutes and try again.",
      429,
      "VERIFY_RATE_LIMITED",
      true,
    );
  }
}

export async function createVerifiedSession(
  req: NextRequest,
  purpose: RoutePurpose,
) {
  const config = getServerConfig();
  const fingerprint = getRequestFingerprint(req);
  const id = crypto.randomUUID();
  const ttlSeconds = config.security.sessionTtlSeconds;
  const now = Date.now();

  const record: VerifiedSessionRecord = {
    id,
    purpose,
    ipHash: fingerprint.ipHash,
    userAgentHash: fingerprint.userAgentHash,
    browserIdHash: fingerprint.browserIdHash,
    quotaRemaining: config.security.analyzeQuota,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
  };

  await setJson(getSessionKey(id), record, ttlSeconds);
  const cookieStore = await cookies();
  cookieStore.set(config.security.sessionCookieName, id, getCookieOptions(ttlSeconds));

  return record;
}

export async function requireVerifiedSession(
  req: NextRequest,
  purpose: RoutePurpose,
) {
  const config = getServerConfig();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(config.security.sessionCookieName)?.value;
  if (!sessionId) {
    throw new PublicApiError(
      "Complete the security check before uploading files.",
      403,
      "VERIFICATION_REQUIRED",
    );
  }

  const session = await getJson<VerifiedSessionRecord>(getSessionKey(sessionId));
  if (!session) {
    throw new PublicApiError(
      "Your verification session expired. Please verify again.",
      403,
      "SESSION_EXPIRED",
      true,
    );
  }

  const fingerprint = getRequestFingerprint(req);
  if (
    session.purpose !== purpose ||
    session.ipHash !== fingerprint.ipHash ||
    session.userAgentHash !== fingerprint.userAgentHash ||
    session.browserIdHash !== fingerprint.browserIdHash
  ) {
    throw new PublicApiError(
      "Your verification session is no longer valid for this request.",
      403,
      "SESSION_MISMATCH",
    );
  }

  return session;
}

export async function consumeSessionQuota(
  req: NextRequest,
  purpose: RoutePurpose,
) {
  const session = await requireVerifiedSession(req, purpose);
  const config = getServerConfig();
  const store = await getRequiredStore();

  const ipCount = await store.incr(
    getRateKey("analyze-ip", [session.ipHash]),
    config.security.analyzeIpWindowSeconds,
  );

  if (ipCount > config.security.analyzeIpMaxAttempts) {
    throw new PublicApiError(
      "Too many uploads from this network. Please try again later.",
      429,
      "UPLOAD_RATE_LIMITED",
      true,
    );
  }

  if (session.quotaRemaining <= 0) {
    throw new PublicApiError(
      "This verified session has reached its upload limit. Please verify again.",
      429,
      "SESSION_QUOTA_EXHAUSTED",
      true,
    );
  }

  const nextSession: VerifiedSessionRecord = {
    ...session,
    quotaRemaining: session.quotaRemaining - 1,
  };

  await setJson(
    getSessionKey(session.id),
    nextSession,
    config.security.sessionTtlSeconds,
  );

  return nextSession;
}

export async function createWarningId(
  sessionId: string,
  endpoint: RoutePurpose,
  fileHash: string,
) {
  const config = getServerConfig();
  const warning: WarningRecord = {
    id: crypto.randomUUID(),
    sessionId,
    endpoint,
    fileHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + config.security.warningTtlSeconds * 1000,
    used: false,
  };

  await setJson(
    getWarningKey(warning.id),
    warning,
    config.security.warningTtlSeconds,
  );

  return serializeToken(warning.id);
}

export async function consumeWarningId(
  warningId: string,
  sessionId: string,
  endpoint: RoutePurpose,
  fileHash: string,
) {
  const id = deserializeToken(warningId);
  const warning = await getJson<WarningRecord>(getWarningKey(id));

  if (!warning) {
    throw new PublicApiError(
      "That warning override expired. Please upload the file again.",
      409,
      "WARNING_EXPIRED",
      true,
    );
  }

  if (
    warning.used ||
    warning.sessionId !== sessionId ||
    warning.endpoint !== endpoint ||
    warning.fileHash !== fileHash ||
    warning.expiresAt <= Date.now()
  ) {
    throw new PublicApiError(
      "That warning override is not valid for this upload.",
      409,
      "WARNING_INVALID",
    );
  }

  warning.used = true;
  await setJson(
    getWarningKey(id),
    warning,
    Math.max(1, Math.floor((warning.expiresAt - Date.now()) / 1000)),
  );

  return warning;
}
