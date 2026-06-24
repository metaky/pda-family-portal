import { describe, expect, it, vi } from "vitest";
import {
  buildAnalyticsEvent,
  safeAnalyticsEventNames,
  trackPortalEvent,
} from "@/lib/client/analytics";

describe("privacy-safe client analytics", () => {
  it("keeps the Phase 7 event names coarse and explicit", () => {
    expect(safeAnalyticsEventNames).toEqual(
      expect.arrayContaining([
        "support_sheet_generate",
        "support_sheet_print",
        "support_sheet_copy_email",
        "support_sheet_copy_short_text",
        "support_sheet_share",
        "declarative_generate",
        "donation_click",
      ]),
    );
  });

  it("drops sensitive payload fields before an event can be emitted", () => {
    const event = buildAnalyticsEvent("support_sheet_generate", {
      action: "generate",
      audience: "teacher",
      childName: "Real Child",
      documentText: "Sensitive IEP text",
      formAnswers: { child: "Real Child" },
      generatedOutput: "Generated support sheet",
      schoolName: "Real School",
      tool: "support_sheet_builder",
      typedPhrase: "Please come downstairs",
    });

    expect(event).toEqual({
      name: "support_sheet_generate",
      properties: {
        action: "generate",
        audience: "teacher",
        tool: "support_sheet_builder",
      },
    });
    expect(JSON.stringify(event)).not.toContain("Real Child");
    expect(JSON.stringify(event)).not.toContain("Sensitive IEP text");
    expect(JSON.stringify(event)).not.toContain("Real School");
    expect(JSON.stringify(event)).not.toContain("Please come downstairs");
  });

  it("dispatches only the sanitized browser event", () => {
    const dispatch = vi.fn();
    vi.stubGlobal("window", {
      CustomEvent,
      dispatchEvent: dispatch,
    });

    trackPortalEvent("donation_click", {
      generatedOutput: "Do not send this",
      source: "support_sheet_builder",
      target: "donation",
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    const event = dispatch.mock.calls[0]?.[0] as CustomEvent;
    expect(event.type).toBe("pda-portal-analytics");
    expect(event.detail).toEqual({
      name: "donation_click",
      properties: {
        source: "support_sheet_builder",
        target: "donation",
      },
    });

    vi.unstubAllGlobals();
  });
});
