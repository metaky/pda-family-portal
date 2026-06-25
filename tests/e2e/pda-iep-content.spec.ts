import { expect, test } from "@playwright/test";

async function expectNoOldProductName(page: import("@playwright/test").Page) {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("PDA Your IEP");
}

test.describe("PDA IEP Advice migrated content pages", () => {
  test("overview page links to the migrated feature suite", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop overview check only");

    await page.goto("/tools/pda-iep-advice");

    await expect(page.getByRole("heading", { name: "PDA IEP Advice" })).toBeVisible();
    await expect(page.getByText("Analyze an IEP or 504")).toBeVisible();
    await expect(page.getByText("Browse Accommodations")).toBeVisible();
    await expect(page.getByText("Understand the Shift")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start here" }).nth(0)).toHaveAttribute(
      "href",
      "/tools/pda-iep-advice/analyze",
    );
    await expectNoOldProductName(page);
  });

  test("accommodations page uses source guidance under portal naming", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop content check only");

    await page.goto("/tools/pda-iep-advice/accommodations");

    await expect(
      page.getByRole("heading", { name: "PDA-Aware Accommodation Ideas" }),
    ).toBeVisible();
    await expect(page.getByText("Use of Declarative Language")).toBeVisible();
    await expect(page.getByText("Visual Menus Instead of Rigid Schedules")).toBeVisible();
    await expect(page.getByText("The Opt-Out or Safe Exit Clause")).toBeVisible();
    await expect(page.getByText("Collaboration Over Compliance")).toBeVisible();
    await expect(page.getByRole("link", { name: "Analyze your IEP" })).toHaveAttribute(
      "href",
      "/tools/pda-iep-advice/analyze",
    );
    await expectNoOldProductName(page);
  });

  test("guide page ports PDA-affirming IEP principles", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop guide check only");

    await page.goto("/tools/pda-iep-advice/guide");

    await expect(
      page.getByRole("heading", { name: "PDA IEP Support Guide" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Shift to Ask For" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Compliance to Connection and Co-regulation" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Common Plan Language to Reconsider" })).toBeVisible();
    await expect(page.getByText("PDA-affirming goal")).toBeVisible();
    await expect(page.getByRole("link", { name: "Analyze your IEP" })).toHaveAttribute(
      "href",
      "/tools/pda-iep-advice/analyze",
    );
    await expectNoOldProductName(page);
  });

  test("privacy and terms pages cover uploaded school documents", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop privacy and terms only");

    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy and Safety" })).toBeVisible();
    await expect(page.getByText("Uploaded IEP or 504 documents")).toBeVisible();
    await expect(page.getByText("processed in memory")).toBeVisible();
    await expect(page.getByText("not used to train public AI models")).toBeVisible();
    await expect(page.getByText("not captured in analytics")).toBeVisible();
    await expectNoOldProductName(page);

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible();
    await expect(page.getByText("not legal, medical, diagnostic, or therapeutic advice")).toBeVisible();
    await expect(page.getByText("You retain all rights to documents you upload")).toBeVisible();
    await expect(
      page.getByText("PDA IEP Advice can help you prepare for school conversations"),
    ).toBeVisible();
    await expectNoOldProductName(page);
  });

  test("migrated static pages have no mobile horizontal overflow", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "mobile content layout only");

    for (const route of [
      "/tools/pda-iep-advice",
      "/tools/pda-iep-advice/accommodations",
      "/tools/pda-iep-advice/guide",
      "/privacy",
      "/terms",
    ]) {
      await page.goto(route);
      const viewport = await page.evaluate(() => ({
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(viewport.width, route).toBeGreaterThanOrEqual(390);
      expect(viewport.scrollWidth, route).toBeLessThanOrEqual(viewport.width);
    }
  });
});
