import { expect, test } from "@playwright/test";
import path from "node:path";

const fixturePdf = path.join(
  "/Users/kyle.wegner/Antigravity",
  "tests/fixtures/test_iep.pdf",
);

const mockReport = {
  score: 82,
  summary:
    "This IEP has a supportive foundation, but several goals still need clearer PDA-aware language around autonomy, regulation, and flexible participation.",
  strengths: [
    "The document names sensory breaks as an available support.",
    "Several services are specific enough for a team discussion.",
  ],
  opportunities: [
    "Rewrite compliance-heavy goals into regulation and self-advocacy goals.",
    "Add clearer low-demand recovery steps for overwhelmed moments.",
  ],
  categorySuggestions: {
    Goal: {
      add: ["Add collaborative self-advocacy language."],
      remove: ["Remove refusal-free compliance targets."],
    },
    Accommodation: {
      add: ["Allow self-initiated breaks without waiting for escalation."],
      remove: [],
    },
    Service: {
      add: ["Add staff coaching on PDA-informed support."],
      remove: [],
    },
    "Behavior Plan": {
      add: ["Add co-regulation and repair steps."],
      remove: ["Remove planned ignoring language."],
    },
  },
  results: [
    {
      category: "Goal",
      title: "Reading goal needs reframing",
      status: "Needs Review",
      description:
        "The goal is measurable, but it frames success as adult-directed compliance.",
      recommendation:
        "Rewrite the goal around flexible participation, student agency, and regulation support.",
      quote: "Student will comply with reading tasks for 15 minutes with no refusals.",
      page: 7,
    },
    {
      category: "Accommodation",
      title: "Break access is a useful start",
      status: "Good",
      description:
        "The plan includes a sensory break accommodation that could reduce escalation.",
      recommendation:
        "Clarify that breaks can be self-initiated and available before distress peaks.",
      quote: "Student may access a quiet sensory break area as needed.",
      page: 5,
    },
  ],
};

test.describe("PDA IEP Advice analyzer", () => {
  test("runs the real local mock analyzer after security verification", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop real local analyzer flow only");

    await page.goto("/tools/pda-iep-advice/analyze");
    await page.getByLabel("Upload IEP or 504 PDF").setInputFiles(fixturePdf);
    await page.getByRole("button", { name: "Analyze document" }).click();

    await expect(page.getByRole("heading", { name: "Complete security check" })).toBeVisible();
    await page.getByRole("button", { name: "Complete security check" }).click();

    await expect(page.getByText("PDA-aware score")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("82 / 100")).toBeVisible();
    await expect(page.getByText("Reading Fluency")).toBeVisible();
  });

  test("rejects invalid files and renders mocked analysis after upload", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop analyzer flow only");

    await page.route("**/api/pda-iep-advice/analyze", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          ok: true,
          data: mockReport,
        },
      });
    });

    await page.goto("/tools/pda-iep-advice/analyze");

    await expect(
      page.getByRole("heading", { name: "PDA IEP Advice: Analyze" }),
    ).toBeVisible();
    await expect(
      page.getByText("If this helped you prepare for a school conversation"),
    ).toHaveCount(0);

    const fileInput = page.getByLabel("Upload IEP or 504 PDF");
    await fileInput.setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a pdf"),
    });
    await expect(page.getByText("Please upload a PDF file.")).toBeVisible();

    await fileInput.setInputFiles(fixturePdf);
    await expect(page.getByText("test_iep.pdf")).toBeVisible();
    await page.getByRole("button", { name: "Analyze document" }).click();

    await expect(page.getByText("PDA-aware score")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("82 / 100")).toBeVisible();
    await expect(page.getByText(mockReport.summary)).toBeVisible();
    await expect(page.getByText("Reading goal needs reframing")).toBeVisible();
    await expect(page.getByText("Break access is a useful start")).toBeVisible();
    await expect(page.getByRole("button", { name: "Print or save" })).toBeVisible();
    await expect(
      page.getByText("If this helped you prepare for a school conversation"),
    ).toBeVisible();
  });

  test("mobile analyzer result has no horizontal overflow", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "mobile analyzer layout only");

    await page.route("**/api/pda-iep-advice/analyze", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          ok: true,
          data: mockReport,
        },
      });
    });

    await page.goto("/tools/pda-iep-advice/analyze");
    await page.getByLabel("Upload IEP or 504 PDF").setInputFiles(fixturePdf);
    await page.getByRole("button", { name: "Analyze document" }).click();
    await expect(page.getByText("82 / 100")).toBeVisible();

    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.width).toBeGreaterThanOrEqual(390);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width);
  });
});
