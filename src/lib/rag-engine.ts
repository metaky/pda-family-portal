import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AnalyzeReport,
  BehaviorReportAnalysis,
} from "@/lib/server/api-types";
import { PublicApiError } from "@/lib/server/errors";
import { getServerConfig } from "@/lib/server/config";
import {
  MOCK_ANALYZE_REPORT,
  MOCK_BEHAVIOR_REPORT,
} from "@/lib/server/mock-analysis";
import { extractPdfText } from "@/lib/server/uploads";
import {
  isAnalyzeFindingCategory,
  isAnalyzeFindingStatus,
  normalizeAnalyzeFindingCategory,
  normalizeAnalyzeFindingStatus,
  normalizeAnalyzeScore,
} from "@/lib/analyze-report-normalization";

export interface DocumentChunk {
  id: string;
  content: string;
  source: string;
}

type ValidationResult = {
  isRelevant: boolean;
  reason: string;
};

const cachedChunks: DocumentChunk[] = [];
let isInitialized = false;

function parseJsonObject(text: string) {
  let jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = jsonStr.indexOf("{");
  const lastBrace = jsonStr.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonStr) as unknown;
  } catch {
    const fixedJson = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    return JSON.parse(fixedJson) as unknown;
  }
}

function assertString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PublicApiError(
      `Model response is missing ${field}.`,
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }
  return value.trim();
}

function assertStringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new PublicApiError(
      `Model response is missing ${field}.`,
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function assertNumber(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new PublicApiError(
      `Model response is missing ${field}.`,
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }
  return value;
}

export function parseAnalyzeReportResponse(text: string): AnalyzeReport {
  const value = parseJsonObject(text);
  if (!value || typeof value !== "object") {
    throw new PublicApiError(
      "Model response is invalid.",
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }

  const record = value as Record<string, unknown>;
  const categorySuggestions = record.categorySuggestions;
  if (!categorySuggestions || typeof categorySuggestions !== "object") {
    throw new PublicApiError(
      "Model response is missing category suggestions.",
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }

  const castCategory = (
    name: "Goal" | "Accommodation" | "Service" | "Behavior Plan",
  ) => {
    const item = (categorySuggestions as Record<string, unknown>)[name];
    if (!item || typeof item !== "object") {
      throw new PublicApiError(
        `Model response is missing ${name} suggestions.`,
        503,
        "INVALID_MODEL_RESPONSE",
        true,
      );
    }
    const typed = item as Record<string, unknown>;
    return {
      add: assertStringArray(typed.add, `${name}.add`),
      remove: assertStringArray(typed.remove, `${name}.remove`),
    };
  };

  if (!Array.isArray(record.results)) {
    throw new PublicApiError(
      "Model response is missing results.",
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }

  const score = assertNumber(record.score, "score");
  let normalizedCategoryCount = 0;
  let normalizedStatusCount = 0;
  const normalizedScore = normalizeAnalyzeScore(score);

  const report = {
    score: normalizedScore,
    summary: assertString(record.summary, "summary"),
    strengths: assertStringArray(record.strengths, "strengths"),
    opportunities: assertStringArray(record.opportunities, "opportunities"),
    categorySuggestions: {
      Goal: castCategory("Goal"),
      Accommodation: castCategory("Accommodation"),
      Service: castCategory("Service"),
      "Behavior Plan": castCategory("Behavior Plan"),
    },
    results: record.results.map((item) => {
      if (!item || typeof item !== "object") {
        throw new PublicApiError(
          "Model response contains an invalid finding.",
          503,
          "INVALID_MODEL_RESPONSE",
          true,
        );
      }
      const finding = item as Record<string, unknown>;
      const category = assertString(finding.category, "results.category");
      const status = assertString(finding.status, "results.status");
      if (!isAnalyzeFindingCategory(category)) {
        normalizedCategoryCount += 1;
      }
      if (!isAnalyzeFindingStatus(status)) {
        normalizedStatusCount += 1;
      }

      return {
        category: normalizeAnalyzeFindingCategory(category),
        title: assertString(finding.title, "results.title"),
        status: normalizeAnalyzeFindingStatus(status),
        description: assertString(finding.description, "results.description"),
        recommendation: assertString(
          finding.recommendation,
          "results.recommendation",
        ),
        quote: assertString(finding.quote, "results.quote"),
        page:
          typeof finding.page === "number" && Number.isFinite(finding.page)
            ? finding.page
            : null,
      };
    }),
  };

  if (
    normalizedCategoryCount > 0 ||
    normalizedStatusCount > 0 ||
    normalizedScore !== score
  ) {
    console.warn(
      JSON.stringify({
        event: "analyze_report_normalized",
        normalizedCategoryCount,
        normalizedStatusCount,
        scoreClamped: normalizedScore !== score,
      }),
    );
  }

  return report;
}

function assertBehaviorReportAnalysis(value: unknown): BehaviorReportAnalysis {
  if (!value || typeof value !== "object") {
    throw new PublicApiError(
      "Model response is invalid.",
      503,
      "INVALID_MODEL_RESPONSE",
      true,
    );
  }

  const record = value as Record<string, unknown>;
  const iepGuidance = Array.isArray(record.iepGuidance) ? record.iepGuidance : [];
  const pdaConsiderations = Array.isArray(record.pdaConsiderations)
    ? record.pdaConsiderations
    : [];

  return {
    summary: assertString(record.summary, "summary"),
    whatWentWell: assertStringArray(record.whatWentWell, "whatWentWell"),
    whatCouldBeBetter: assertStringArray(
      record.whatCouldBeBetter,
      "whatCouldBeBetter",
    ),
    iepGuidance: iepGuidance.map((item) => {
      if (!item || typeof item !== "object") {
        throw new PublicApiError(
          "Model response contains invalid guidance.",
          503,
          "INVALID_MODEL_RESPONSE",
          true,
        );
      }

      const typed = item as Record<string, unknown>;
      return {
        title: assertString(typed.title, "iepGuidance.title"),
        description: assertString(typed.description, "iepGuidance.description"),
        quote: typeof typed.quote === "string" ? typed.quote : undefined,
        page:
          typeof typed.page === "number" && Number.isFinite(typed.page)
            ? typed.page
            : undefined,
        source:
          typed.source === "IEP" || typed.source === "BIR"
            ? typed.source
            : undefined,
      };
    }),
    futureRecommendations: assertStringArray(
      record.futureRecommendations,
      "futureRecommendations",
    ),
    pdaConsiderations: pdaConsiderations.map((item) => {
      if (!item || typeof item !== "object") {
        throw new PublicApiError(
          "Model response contains invalid PDA guidance.",
          503,
          "INVALID_MODEL_RESPONSE",
          true,
        );
      }

      const typed = item as Record<string, unknown>;
      return {
        strategy: assertString(typed.strategy, "pdaConsiderations.strategy"),
        explanation: assertString(
          typed.explanation,
          "pdaConsiderations.explanation",
        ),
        howToImplement: assertString(
          typed.howToImplement,
          "pdaConsiderations.howToImplement",
        ),
      };
    }),
  };
}

export class RagEngine {
  private chunks: DocumentChunk[] = [];

  async init() {
    if (isInitialized) {
      this.chunks = cachedChunks;
      return;
    }

    const docsDir = path.join(process.cwd(), "src/data/rag_docs");
    if (fs.existsSync(docsDir)) {
      const files = fs
        .readdirSync(docsDir)
        .filter((file) => file.endsWith(".txt") || file.endsWith(".rtf"));

      for (const file of files) {
        let content = await fs.promises.readFile(
          path.join(docsDir, file),
          "utf-8",
        );

        if (file.endsWith(".rtf")) {
          content = content
            .replace(/\\par/g, "\n")
            .replace(/\\tab/g, "\t")
            .replace(/[{}]/g, "")
            .replace(/\\[a-z0-9-]+\s?/g, "")
            .replace(/\\\*/g, "")
            .replace(/;/g, "")
            .replace(/\\'.{2}/g, "");
        }

        const parts = content.split("\n").filter((line) => {
          const trimmed = line.trim();
          return trimmed.length > 20 && trimmed.includes(" ");
        });

        parts.forEach((part, index) => {
          cachedChunks.push({
            id: `${file}-${index}`,
            content: part.trim(),
            source: file,
          });
        });
      }
    }

    this.chunks = cachedChunks;
    isInitialized = true;
  }

  async retrieve(query: string, limit = 3): Promise<DocumentChunk[]> {
    await this.init();

    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 4);

    const scoredChunks = this.chunks.map((chunk) => {
      let score = 0;
      for (const keyword of keywords) {
        if (chunk.content.toLowerCase().includes(keyword)) {
          score += 1;
        }
      }

      if (chunk.content.toLowerCase().includes("measurable")) {
        score += 2;
      }

      return { chunk, score };
    });

    return scoredChunks
      .sort((left, right) => right.score - left.score)
      .filter((item) => item.score > 0)
      .slice(0, limit)
      .map((item) => item.chunk);
  }

  private getModel() {
    const config = getServerConfig();
    if (!config.models.geminiApiKey) {
      throw new PublicApiError(
        "Analysis is not configured.",
        503,
        "MODEL_UNAVAILABLE",
        true,
      );
    }

    const client = new GoogleGenerativeAI(config.models.geminiApiKey);
    return client.getGenerativeModel({
      model: config.models.geminiModel,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
  }

  async validateDocument(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<ValidationResult> {
    const config = getServerConfig();
    if (config.mockMode) {
      const raw = extractPdfText(fileBuffer).toLowerCase();
      return {
        isRelevant:
          !raw.includes("receipt") &&
          !raw.includes("shopping list") &&
          !raw.includes("grocery"),
        reason: raw.includes("receipt")
          ? "This looks like a receipt rather than a school support document."
          : "Mock validation accepted the document.",
      };
    }

    const model = this.getModel();
    const prompt = `
You are a document classifier for a Special Education advocacy tool.
Determine whether the attached PDF is relevant to an IEP, 504 Plan, school behavior report, diagnosis summary, accommodation list, or related school support document.

Return strict JSON with:
{
  "isRelevant": boolean,
  "reason": "short explanation"
}
`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType,
          },
        },
      ]);
      const parsed = parseJsonObject((await result.response).text()) as Record<
        string,
        unknown
      >;
      if (
        typeof parsed.isRelevant !== "boolean" ||
        typeof parsed.reason !== "string"
      ) {
        throw new PublicApiError(
          "Validation response is invalid.",
          503,
          "INVALID_VALIDATION_RESPONSE",
          true,
        );
      }
      return {
        isRelevant: parsed.isRelevant,
        reason: parsed.reason,
      };
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }

      throw new PublicApiError(
        "Document validation is temporarily unavailable.",
        503,
        "VALIDATION_UNAVAILABLE",
        true,
      );
    }
  }

  async analyzeIEP(fileBuffer: Buffer, mimeType: string): Promise<AnalyzeReport> {
    const config = getServerConfig();
    if (config.mockMode) {
      return MOCK_ANALYZE_REPORT;
    }

    const context = await this.retrieve(
      "IEP goals accommodations and neuroaffirming compliance data",
      10,
    );
    const contextSummary = context
      .map((chunk) => `- ${chunk.content} (Source: ${chunk.source})`)
      .join("\n");

    const prompt = `
You are an expert special education advocate and IEP compliance reviewer specializing in PDA-affirming, neuroaffirming practices.
You are reviewing a real parent-facing IEP analysis, so your output must be concrete, specific, and genuinely useful for advocacy.

GUIDANCE:
${contextSummary}

TASK:
1. Analyze the attached IEP or 504 PDF thoroughly.
2. Evaluate how well it aligns with neuroaffirming, low-demand, relationship-based support rather than compliance-focused practice.
3. Prioritize advice that a parent could actually use in a school meeting.
4. Quote the source document directly whenever you make a finding, and include a page number whenever it is detectable.
5. Be specific about what is strong, what is risky, and what should be rewritten.

DEPTH REQUIREMENTS:
- Write a summary that is 2-4 sentences, not generic filler.
- Return at least 3 strengths and at least 3 opportunities when the document contains enough evidence.
- Return at least 6 results when the document contains enough material; use fewer only if the document is extremely short or sparse.
- Cover multiple categories when supported by the document, especially Goals, Accommodations, Services, and Behavior Plan.
- Recommendations should be concrete and school-usable, not vague phrases like "improve support."

QUALITY BAR:
- Favor actionable, PDA-affirming guidance over generic special-education language.
- Call out compliance-based, punitive, coercive, or demand-heavy language when present.
- Surface missing supports if the document is kind in tone but too vague to be enforceable.
- Do not praise a section unless the quoted evidence clearly supports that praise.
- Avoid ABA-style or compliance-first recommendations such as token economies, planned ignoring, extinction, forced compliance, or reward/punishment framing.

CATEGORY SUGGESTIONS GUIDANCE:
- "add" should contain specific language, supports, or service ideas worth including.
- "remove" should contain harmful, vague, unenforceable, or compliance-heavy language worth rewriting or deleting.

Return strict JSON:
{
  "score": number,
  "summary": "2-4 sentence executive summary written for a parent",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "opportunities": ["Specific opportunity 1", "Specific opportunity 2", "Specific opportunity 3"],
  "categorySuggestions": {
    "Goal": { "add": ["..."], "remove": ["..."] },
    "Accommodation": { "add": ["..."], "remove": ["..."] },
    "Service": { "add": ["..."], "remove": ["..."] },
    "Behavior Plan": { "add": ["..."], "remove": ["..."] }
  },
  "results": [
    {
      "category": "Goal",
      "title": "Short title",
      "status": "Good",
      "description": "Clear analysis of what the quoted language means and why it matters",
      "recommendation": "Specific advocacy-ready rewrite or next step",
      "quote": "Exact quote from PDF",
      "page": 1
    }
  ]
}
`;

    try {
      const result = await this.getModel().generateContent([
        prompt,
        {
          inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType,
          },
        },
      ]);
      return parseAnalyzeReportResponse((await result.response).text());
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }

      throw new PublicApiError(
        "Document analysis is temporarily unavailable.",
        503,
        "ANALYSIS_UNAVAILABLE",
        true,
      );
    }
  }

  async analyzeBehaviorReport(
    behaviorBuffer: Buffer,
    iepBuffer: Buffer,
    mimeType: string,
  ): Promise<BehaviorReportAnalysis> {
    const config = getServerConfig();
    if (config.mockMode) {
      return MOCK_BEHAVIOR_REPORT;
    }

    const context = await this.retrieve(
      "PDA behavior incident de-escalation autonomy anxiety regulation",
      10,
    );
    const contextSummary = context
      .map((chunk) => `- ${chunk.content} (Source: ${chunk.source})`)
      .join("\n");

    const prompt = `
You are an expert special education advocate specializing in PDA-related school behavior incidents.
You are reviewing two PDFs:
1. A behavior incident report describing what happened at school.
2. The student's IEP or 504 document describing supports that should guide staff response.

PDA GUIDANCE:
${contextSummary}

TASK:
1. Read both documents carefully and compare the incident response to the supports the student should have received.
2. Explain what staff did well, what they missed, and which IEP/504 strategies should have been used in the moment.
3. Provide recommendations that are specific to PDA, autonomy, anxiety reduction, and collaborative support.
4. Go beyond generic autism advice; explicitly avoid compliance-first, ABA-style, punitive, or reward/punishment-based framing.
5. Quote the source document directly whenever possible and include page numbers whenever they are detectable.

DEPTH REQUIREMENTS:
- Write a summary that is 2-4 sentences and clearly distinguishes the incident from the support failure or success.
- Return at least 2 whatWentWell items when evidence exists.
- Return at least 3 whatCouldBeBetter items when evidence exists.
- Return at least 3 iepGuidance items when the IEP contains enough relevant supports.
- Return at least 3 futureRecommendations and at least 3 pdaConsiderations when the documents contain enough evidence.

QUALITY BAR:
- The most useful output is concrete, parent-usable, and school-usable.
- Explain exactly how a support should have been applied during the incident, not just that it existed.
- PDA-specific recommendations should focus on reducing threat, preserving autonomy, supporting regulation, and repairing trust.
- Do not invent facts that are not grounded in the two PDFs.
- If the school's response escalated distress, say so clearly and explain why.

Return strict JSON:
{
  "summary": "2-4 sentence executive summary written for a parent",
  "whatWentWell": ["Specific positive aspect 1", "Specific positive aspect 2"],
  "whatCouldBeBetter": ["Specific missed support 1", "Specific missed support 2", "Specific missed support 3"],
  "iepGuidance": [
    {
      "title": "Accommodation or strategy",
      "description": "How this support should have been applied during the incident and why it matters",
      "quote": "Exact quote",
      "page": 1,
      "source": "IEP"
    }
  ],
  "futureRecommendations": ["Clear future action 1", "Clear future action 2", "Clear future action 3"],
  "pdaConsiderations": [
    {
      "strategy": "Name",
      "explanation": "Why it helps PDA students specifically",
      "howToImplement": "Concrete implementation steps for school staff"
    }
  ]
}
`;

    try {
      const result = await this.getModel().generateContent([
        prompt,
        {
          inlineData: {
            data: behaviorBuffer.toString("base64"),
            mimeType,
          },
        },
        {
          inlineData: {
            data: iepBuffer.toString("base64"),
            mimeType,
          },
        },
      ]);
      return assertBehaviorReportAnalysis(
        parseJsonObject((await result.response).text()),
      );
    } catch (error) {
      if (error instanceof PublicApiError) {
        throw error;
      }

      throw new PublicApiError(
        "Behavior report analysis is temporarily unavailable.",
        503,
        "ANALYSIS_UNAVAILABLE",
        true,
      );
    }
  }
}
