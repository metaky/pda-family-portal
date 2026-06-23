import { expect, test } from "@playwright/test";

test.describe("Support Sheet Builder", () => {
  test("generates editable sheet, email, and short text without server storage", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop happy path only");

    const unexpectedApiCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/support-sheet")) {
        unexpectedApiCalls.push(request.url());
      }
    });

    await page.goto("/tools/support-sheet-builder");
    await expect(page.getByRole("heading", { name: "Support Sheet Builder" })).toBeVisible();
    await expect(page.getByText("If this saved you an hour of emotional labor")).toHaveCount(0);

    await page.getByRole("button", { name: /Provider example/i }).click();
    await expect(page.getByLabel("Child name or nickname")).toHaveValue("Morgan");
    await page.getByLabel("Child name or nickname").fill("Taylor");
    await page
      .getByLabel("Extra detail for escalation")
      .fill("If Taylor backs away, pause and explain the next step before trying again.");

    await page.getByRole("button", { name: /Generate support sheet/i }).click();

    await expect(page.getByLabel("Support sheet title")).toHaveValue("How to Support Taylor");
    await page.getByLabel("Support sheet title").fill("Taylor Support Snapshot");
    await expect(page.getByLabel("Support sheet title")).toHaveValue("Taylor Support Snapshot");
    await expect(page.getByRole("textbox", { name: "What Helps", exact: true })).toHaveValue(
      /consent checks/,
    );
    await expect(
      page.getByRole("textbox", { name: "What May Feel Like Pressure", exact: true }),
    ).toHaveValue(/procedures/);
    await expect(page.getByRole("textbox", { name: "If Things Escalate", exact: true })).toHaveValue(
      /pause and explain the next step/,
    );
    await expect(page.getByText("If this saved you an hour of emotional labor")).toBeVisible();

    await page.getByRole("tab", { name: "Email" }).click();
    await expect(page.locator(".copy-box")).toHaveValue(
      /I wanted to share a short support guide for Taylor/,
    );
    await page.getByRole("button", { name: /^Copy$/ }).click();
    await expect(page.getByRole("status")).toContainText("Copied email");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
      "I wanted to share a short support guide for Taylor",
    );

    await page.getByRole("tab", { name: "Short text" }).click();
    const shortText = await page.locator(".copy-box").inputValue();
    expect(shortText).toContain("Quick note for supporting Taylor");
    expect(shortText.length).toBeLessThan(650);

    expect(unexpectedApiCalls).toEqual([]);
  });

  test("mobile layout has no horizontal overflow after generation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "mobile layout check only");

    await page.goto("/tools/support-sheet-builder");
    await page.getByRole("button", { name: /Generate support sheet/i }).click();

    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clippedTextareas: [...document.querySelectorAll("textarea")]
        .filter((textarea) => textarea.scrollHeight > textarea.clientHeight + 2)
        .map((textarea) => textarea.getAttribute("aria-label") ?? "textarea"),
    }));

    expect(viewport.width).toBe(390);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(390);
    expect(viewport.clippedTextareas).toEqual([]);
  });
});
