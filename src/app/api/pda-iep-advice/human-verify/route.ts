import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/server/api-types";
import { getServerConfig } from "@/lib/server/config";
import { isPublicApiError, PublicApiError } from "@/lib/server/errors";
import {
  createVerifiedSession,
  enforceHumanVerifyRateLimit,
  getClientIp,
} from "@/lib/server/security";

type HumanVerifyBody = {
  token?: string;
  purpose?: "analyze";
};

export function isValidHumanVerifyBody(
  body: unknown,
): body is Required<HumanVerifyBody> {
  if (!body || typeof body !== "object") {
    return false;
  }

  const record = body as Record<string, unknown>;
  return record.purpose === "analyze" && typeof record.token === "string";
}

async function verifyTurnstileToken(req: NextRequest, token: string) {
  const config = getServerConfig();

  if (config.turnstile.allowTestTokens && token === config.turnstile.testToken) {
    return;
  }

  if (!config.turnstile.secretKey) {
    throw new PublicApiError(
      "Human verification is not configured.",
      503,
      "VERIFY_UNAVAILABLE",
      true,
    );
  }

  const body = new URLSearchParams();
  body.set("secret", config.turnstile.secretKey);
  body.set("response", token);
  body.set("remoteip", getClientIp(req));

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body,
      cache: "no-store",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PublicApiError(
      "Human verification is temporarily unavailable.",
      503,
      "VERIFY_UNAVAILABLE",
      true,
    );
  }

  const payload = (await response.json()) as { success?: boolean };
  if (!payload.success) {
    throw new PublicApiError(
      "Human verification failed. Please try again.",
      403,
      "VERIFY_FAILED",
    );
  }
}

export function apiVerifySuccessResponse() {
  return NextResponse.json<ApiResponse<{ verified: boolean }>>({
    ok: true,
    data: { verified: true },
  });
}

export function apiVerifyErrorResponse(error: unknown) {
  if (isPublicApiError(error)) {
    return NextResponse.json<ApiResponse<{ verified: boolean }>>(
      {
        ok: false,
        type: error.retryable ? "retryable_error" : "error",
        code: error.code,
        message: error.message,
      },
      { status: error.status },
    );
  }

  console.error("Unexpected PDA IEP Advice verify error:", error);
  return NextResponse.json<ApiResponse<{ verified: boolean }>>(
    {
      ok: false,
      type: "retryable_error",
      code: "VERIFY_UNAVAILABLE",
      message: "Human verification is temporarily unavailable.",
    },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  const config = getServerConfig();
  if (!config.features.pdaIepAnalyze || config.maintenanceMode) {
    return apiVerifyErrorResponse(
      new PublicApiError(
        "PDA IEP Advice analysis is temporarily unavailable.",
        503,
        "FEATURE_DISABLED",
        true,
      ),
    );
  }

  try {
    await enforceHumanVerifyRateLimit(req);

    const body = (await req.json()) as unknown;
    if (!isValidHumanVerifyBody(body)) {
      throw new PublicApiError(
        "A verification token and analyzer purpose are required.",
        400,
        "VERIFY_INPUT_INVALID",
      );
    }

    await verifyTurnstileToken(req, body.token);
    await createVerifiedSession(req, "analyze");

    return apiVerifySuccessResponse();
  } catch (error) {
    return apiVerifyErrorResponse(error);
  }
}
