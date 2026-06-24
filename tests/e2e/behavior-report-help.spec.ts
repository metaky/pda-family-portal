import { expect, test } from "@playwright/test";
import path from "node:path";

const behaviorFixturePdf = path.join(
  "/Users/kyle.wegner/Antigravity",
  "tests/fixtures/test_behavior_report.pdf",
);
const iepFixturePdf = path.join(
  "/Users/kyle.wegner/Antigravity",
  "tests/fixtures/test_iep.pdf",
);

test.describe("PDA Behavior Report Help", () => {
  test("runs the local mock dual-upload analysis after security verification", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop behavior report flow only");

    await page.goto("/tools/pda-behavior-report-help");
    await expect(
      page.getByRole("heading", { name: "PDA Behavior Report Help" }),
    ).toBeVisible();
    await expect(page.getByText("standalone portal feature")).toHaveCount(0);

    await page
      .getByLabel("Upload behavior incident report PDF")
      .setInputFiles(behaviorFixturePdf);
    await page
      .getByLabel("Upload IEP or 504 PDF for comparison")
      .setInputFiles(iepFixturePdf);
    await page.getByRole("button", { name: "Analyze behavior report" }).click();

    await expect(page.getByRole("heading", { name: "Complete security check" })).toBeVisible();
    await page.getByRole("button", { name: "Complete security check" }).click();

    await expect(page.getByText("Behavior Incident Analysis")).toBeVisible();
    await expect(page.getByText("What went well")).toBeVisible();
    await expect(page.getByText("What could be better")).toBeVisible();
    await expect(page.getByText("PDA considerations")).toBeVisible();
    await expect(page.getByRole("button", { name: "Print or save" })).toBeVisible();
  });

  test("rejects invalid behavior report files before upload", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop invalid-file check only");

    await page.goto("/tools/pda-behavior-report-help");

    await page.getByLabel("Upload behavior incident report PDF").setInputFiles({
      name: "incident.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a pdf"),
    });

    await expect(page.getByText("Please upload a PDF file.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upload both PDFs to continue" }),
    ).toBeDisabled();
  });

  test("mobile behavior report route has no horizontal overflow", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "mobile layout only");

    await page.goto("/tools/pda-behavior-report-help");

    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.width).toBeGreaterThanOrEqual(390);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width);
  });
});
