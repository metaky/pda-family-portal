type SafeAnalyticsEventName = (typeof safeAnalyticsEventNames)[number];

type AnalyticsProperties = Record<string, unknown>;

const safePropertyKeys = new Set([
  "action",
  "audience",
  "mode",
  "route",
  "source",
  "status",
  "target",
  "tone",
  "tool",
  "variationKind",
]);

export const safeAnalyticsEventNames = [
  "support_sheet_generate",
  "support_sheet_print",
  "support_sheet_copy_email",
  "support_sheet_copy_short_text",
  "support_sheet_share",
  "declarative_generate",
  "declarative_copy_suggestion",
  "declarative_copy_variation",
  "declarative_variation",
  "pda_iep_analyze",
  "pda_iep_print",
  "behavior_report_analyze",
  "behavior_report_print",
  "donation_click",
] as const;

function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      return safePropertyKeys.has(key) && ["boolean", "number", "string"].includes(typeof value);
    }),
  );
}

export function buildAnalyticsEvent(
  name: SafeAnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  return {
    name,
    properties: sanitizeAnalyticsProperties(properties),
  };
}

export function trackPortalEvent(
  name: SafeAnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("pda-portal-analytics", {
      detail: buildAnalyticsEvent(name, properties),
    }),
  );
}
