import { NextRequest, NextResponse } from "next/server";
import { RagEngine } from "@/lib/rag-engine";
import type {
  ApiResponse,
  BehaviorReportAnalysis,
} from "@/lib/server/api-types";
import { getServerConfig } from "@/lib/server/config";
import { isPublicApiError } from "@/lib/server/errors";
import {
  consumeSessionQuota,
  consumeWarningId,
  createWarningId,
  requireVerifiedSession,
} from "@/lib/server/security";
import {
  looksLikeRelevantSchoolDocument,
  preflightBehaviorReportUploads,
} from "@/lib/server/uploads";

export function apiBehaviorSuccessResponse(data: BehaviorReportAnalysis) {
  return NextResponse.json<ApiResponse<BehaviorReportAnalysis>>({
    ok: true,
    data,
  });
}

export function apiBehaviorErrorResponse(error: unknown) {
  if (isPublicApiError(error)) {
    return NextResponse.json<ApiResponse<BehaviorReportAnalysis>>(
      {
        ok: false,
        type: error.retryable ? "retryable_error" : "error",
        code: error.code,
        message: error.message,
      },
      { status: error.status },
    );
  }

  console.error("Unexpected behavior report route error:", error);
  return NextResponse.json<ApiResponse<BehaviorReportAnalysis>>(
    {
      ok: false,
      type: "retryable_error",
      code: "UNEXPECTED_ERROR",
      message: "The behavior report service is temporarily unavailable.",
    },
    { status: 503 },
  );
}

export function apiBehaviorWarningResponse(
  code: string,
  message: string,
  warningId: string,
) {
  return NextResponse.json<ApiResponse<BehaviorReportAnalysis>>(
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
  if (!config.features.behaviorReport || config.maintenanceMode) {
    return NextResponse.json<ApiResponse<BehaviorReportAnalysis>>(
      {
        ok: false,
        type: "retryable_error",
        code: "FEATURE_DISABLED",
        message: "PDA Behavior Report Help is temporarily unavailable.",
      },
      { status: 503 },
    );
  }

  try {
    const session = await requireVerifiedSession(req, "behavior-report");
    const formData = await req.formData();
    const uploads = await preflightBehaviorReportUploads(formData);
    const warningId = formData.get("warningId");
    const rag = new RagEngine();

    if (typeof warningId === "string" && warningId.length > 0) {
      await consumeWarningId(
        warningId,
        session.id,
        "behavior-report",
        uploads.uploadPairHash,
      );
      await consumeSessionQuota(req, "behavior-report");
    } else {
      const nextSession = await consumeSessionQuota(req, "behavior-report");

      if (!looksLikeRelevantSchoolDocument(uploads.combinedExtractedText)) {
        const issuedWarningId = await createWarningId(
          nextSession.id,
          "behavior-report",
          uploads.uploadPairHash,
        );

        return apiBehaviorWarningResponse(
          "LIKELY_IRRELEVANT",
          "These uploads may not be a behavior report and school support document.",
          issuedWarningId,
        );
      }

      const behaviorValidation = await rag.validateDocument(
        uploads.behaviorReport.buffer,
        uploads.behaviorReport.mimeType,
      );
      const iepValidation = await rag.validateDocument(
        uploads.iepDocument.buffer,
        uploads.iepDocument.mimeType,
      );

      if (!behaviorValidation.isRelevant || !iepValidation.isRelevant) {
        const issuedWarningId = await createWarningId(
          nextSession.id,
          "behavior-report",
          uploads.uploadPairHash,
        );

        return apiBehaviorWarningResponse(
          "LIKELY_IRRELEVANT",
          !behaviorValidation.isRelevant
            ? behaviorValidation.reason
            : iepValidation.reason,
          issuedWarningId,
        );
      }
    }

    const analysis = await rag.analyzeBehaviorReport(
      uploads.behaviorReport.buffer,
      uploads.iepDocument.buffer,
      uploads.behaviorReport.mimeType,
    );

    return apiBehaviorSuccessResponse(analysis);
  } catch (error) {
    return apiBehaviorErrorResponse(error);
  }
}
