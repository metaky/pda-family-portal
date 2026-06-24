import { afterEach, describe, expect, it } from "vitest";
import {
  isAnalyzeFindingCategory,
  isAnalyzeFindingStatus,
  normalizeAnalyzeFindingCategory,
  normalizeAnalyzeFindingStatus,
  normalizeAnalyzeScore,
} from "../src/lib/analyze-report-normalization";
import { RagEngine, parseAnalyzeReportResponse } from "../src/lib/rag-engine";
import { resetServerConfigForTests } from "../src/lib/server/config";
import { MOCK_ANALYZE_REPORT } from "../src/lib/server/mock-analysis";

const DEFAULT_ENV = {
  RAG_MOCK_MODE: process.env.RAG_MOCK_MODE,
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

describe("PDA IEP Advice RAG engine", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("normalizes finding categories, statuses, and scores", () => {
    expect(isAnalyzeFindingCategory("Goal")).toBe(true);
    expect(isAnalyzeFindingCategory("Compliance")).toBe(false);
    expect(normalizeAnalyzeFindingCategory("Compliance")).toBe("General");

    expect(isAnalyzeFindingStatus("Good")).toBe(true);
    expect(isAnalyzeFindingStatus("Concerning")).toBe(false);
    expect(normalizeAnalyzeFindingStatus("Concerning")).toBe("Needs Review");

    expect(normalizeAnalyzeScore(120)).toBe(100);
    expect(normalizeAnalyzeScore(-5)).toBe(0);
    expect(normalizeAnalyzeScore(72)).toBe(72);
  });

  it("parses and normalizes imperfect model JSON into the analyzer schema", () => {
    const parsed = parseAnalyzeReportResponse(`
      \`\`\`json
      {
        "score": 112,
        "summary": "This plan has useful supports but needs stronger PDA-aware language.",
        "strengths": ["Includes sensory support."],
        "opportunities": ["Rewrite compliance-heavy goals."],
        "categorySuggestions": {
          "Goal": { "add": ["Add autonomy language."], "remove": ["Remove compliance targets."] },
          "Accommodation": { "add": ["Add declarative language."], "remove": [] },
          "Service": { "add": ["Add staff coaching."], "remove": [] },
          "Behavior Plan": { "add": ["Add low-demand recovery steps."], "remove": [] }
        },
        "results": [
          {
            "category": "Compliance",
            "title": "Demand-heavy goal",
            "status": "Concerning",
            "description": "The wording centers adult compliance.",
            "recommendation": "Rewrite around regulation and student agency.",
            "quote": "Student will comply with adult requests.",
            "page": "unknown"
          }
        ]
      }
      \`\`\`
    `);

    expect(parsed.score).toBe(100);
    expect(parsed.results[0]).toMatchObject({
      category: "General",
      status: "Needs Review",
      page: null,
    });
  });

  it("rejects model responses that are missing required category suggestions", () => {
    expect(() =>
      parseAnalyzeReportResponse(
        JSON.stringify({
          score: 80,
          summary: "Missing category suggestions.",
          strengths: [],
          opportunities: [],
          results: [],
        }),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "INVALID_MODEL_RESPONSE",
      }),
    );
  });

  it("returns deterministic mock analysis when mock mode is enabled", async () => {
    process.env.RAG_MOCK_MODE = "true";
    resetServerConfigForTests();

    const report = await new RagEngine().analyzeIEP(
      Buffer.from("not used in mock mode"),
      "application/pdf",
    );

    expect(report).toEqual(MOCK_ANALYZE_REPORT);
  });

  it("loads source PDA guidance chunks for retrieval", async () => {
    const results = await new RagEngine().retrieve(
      "autonomy accommodations measurable regulation",
      5,
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((chunk) => chunk.source.includes("PDA"))).toBe(true);
  });
});
