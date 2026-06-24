import type {
  AnalyzeFindingCategory,
  AnalyzeFindingStatus,
} from "@/lib/server/api-types";

const ANALYZE_FINDING_CATEGORIES = new Set<AnalyzeFindingCategory>([
  "Goal",
  "Accommodation",
  "Service",
  "Behavior Plan",
  "General",
]);

const ANALYZE_FINDING_STATUSES = new Set<AnalyzeFindingStatus>([
  "Good",
  "Needs Review",
]);

export function isAnalyzeFindingCategory(
  value: unknown,
): value is AnalyzeFindingCategory {
  return (
    typeof value === "string" &&
    ANALYZE_FINDING_CATEGORIES.has(value as AnalyzeFindingCategory)
  );
}

export function isAnalyzeFindingStatus(
  value: unknown,
): value is AnalyzeFindingStatus {
  return (
    typeof value === "string" &&
    ANALYZE_FINDING_STATUSES.has(value as AnalyzeFindingStatus)
  );
}

export function normalizeAnalyzeFindingCategory(
  value: unknown,
): AnalyzeFindingCategory {
  return isAnalyzeFindingCategory(value) ? value : "General";
}

export function normalizeAnalyzeFindingStatus(
  value: unknown,
): AnalyzeFindingStatus {
  return isAnalyzeFindingStatus(value) ? value : "Needs Review";
}

export function normalizeAnalyzeScore(score: number) {
  return Math.min(100, Math.max(0, score));
}
