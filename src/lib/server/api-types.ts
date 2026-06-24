export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiWarning = {
  ok: false;
  type: "warning";
  code: string;
  message: string;
  warningId: string;
};

export type ApiError = {
  ok: false;
  type: "error" | "retryable_error";
  code: string;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiWarning | ApiError;

export type AnalyzeFindingCategory =
  | "Goal"
  | "Accommodation"
  | "Service"
  | "Behavior Plan"
  | "General";

export type AnalyzeFindingStatus = "Good" | "Needs Review";

export interface AnalyzeFinding {
  category: AnalyzeFindingCategory;
  title: string;
  status: AnalyzeFindingStatus;
  description: string;
  recommendation: string;
  quote: string;
  page: number | null;
}

export interface AnalyzeReport {
  score: number;
  summary: string;
  strengths: string[];
  opportunities: string[];
  categorySuggestions: Record<
    Exclude<AnalyzeFindingCategory, "General">,
    {
      add: string[];
      remove: string[];
    }
  >;
  results: AnalyzeFinding[];
}

export interface StoredAnalyzeHistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  summary: string;
  score: number;
  fullReport?: AnalyzeReport;
}

export interface BehaviorGuidanceItem {
  title: string;
  description: string;
  quote?: string;
  page?: number;
  source?: "IEP" | "BIR";
}

export interface PdaConsideration {
  strategy: string;
  explanation: string;
  howToImplement: string;
}

export interface BehaviorReportAnalysis {
  summary: string;
  whatWentWell: string[];
  whatCouldBeBetter: string[];
  iepGuidance: BehaviorGuidanceItem[];
  futureRecommendations: string[];
  pdaConsiderations: PdaConsideration[];
}

export interface StoredBehaviorHistoryEntry {
  id: string;
  timestamp: number;
  behaviorFileName: string;
  iepFileName: string;
  summary: string;
  fullReport?: BehaviorReportAnalysis;
}
