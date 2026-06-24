import { NextRequest, NextResponse } from "next/server";
import { RagEngine } from "@/lib/rag-engine";
import type { AnalyzeReport, ApiResponse } from "@/lib/server/api-types";
import { getServerConfig } from "@/lib/server/config";
import { isPublicApiError } from "@/lib/server/errors";
import {
  consumeSessionQuota,
  consumeWarningId,
  createWarningId,
  requireVerifiedSession,
} from "@/lib/server/security";
import { preflightPdfUpload } from "@/lib/server/uploads";

export function apiSuccessResponse(data: AnalyzeReport) {
  return NextResponse.json<ApiResponse<AnalyzeReport>>({
    ok: true,
    data,
  });
}

export function apiErrorResponse(error: unknown) {
  if (isPublicApiError(error)) {
    return NextResponse.json<ApiResponse<AnalyzeReport>>(
      {
        ok: false,
        type: error.retryable ? "retryable_error" : "error",
        code: error.code,
        message: error.message,
      },
      { status: error.status },
    );
  }

  console.error("Unexpected PDA IEP Advice route error:", error);
  return NextResponse.json<ApiResponse<AnalyzeReport>>(
    {
      ok: false,
      type: "retryable_error",
      code: "UNEXPECTED_ERROR",
      message: "The analysis service is temporarily unavailable.",
    },
    { status: 503 },
  );
}

export function apiWarningResponse(
  code: string,
  message: string,
  warningId: string,
) {
  return NextResponse.json<ApiResponse<AnalyzeReport>>(
    {
      ok: false,
      type: "warning",
      code,
      message,
      warningId,
    },
    { status: 422 },
  );
}

export async function POST(req: NextRequest) {
  const config = getServerConfig();
  if (!config.features.pdaIepAnalyze || config.maintenanceMode) {
    return NextResponse.json<ApiResponse<AnalyzeReport>>(
      {
        ok: false,
        type: "retryable_error",
        code: "FEATURE_DISABLED",
        message: "PDA IEP Advice analysis is temporarily unavailable.",
      },
      { status: 503 },
    );
  }

  try {
    await requireVerifiedSession(req, "analyze");
    const formData = await req.formData();
    const upload = await preflightPdfUpload(formData.get("file") as File | null);
    const session = await consumeSessionQuota(req, "analyze");
    const warningId = formData.get("warningId");
    const rag = new RagEngine();

    if (typeof warningId === "string" && warningId.length > 0) {
      await consumeWarningId(warningId, session.id, "analyze", upload.fileHash);
    } else {
      const validation = await rag.validateDocument(upload.buffer, upload.mimeType);
      if (!validation.isRelevant) {
        const issuedWarningId = await createWarningId(
          session.id,
          "analyze",
          upload.fileHash,
        );

        return apiWarningResponse(
          "LIKELY_IRRELEVANT",
          validation.reason,
          issuedWarningId,
        );
      }
    }

    const analysis = await rag.analyzeIEP(upload.buffer, upload.mimeType);
    return apiSuccessResponse(analysis);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
