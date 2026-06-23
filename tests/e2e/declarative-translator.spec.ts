import { expect, test } from "@playwright/test";

test.describe("Declarative Language Translator", () => {
  test("translates, copies, varies, and reveals donation only after value", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop translator flow only");

    const requests: unknown[] = [];
    await page.route("**/api/declarative/translate", async (route) => {
      const body = route.request().postDataJSON();
      requests.push(body);

      if (body.mode === "variation") {
        await route.fulfill({
          contentType: "application/json",
          json: {
            translations: [
              { translation: "Walking speed inside; running can wait for outside." },
              { translation: "Fast feet have more room outside." },
            ],
          },
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        json: {
          translations: [
            { translation: "Dinner is ready. Hands first." },
            { translation: "Downstairs, hands, then dinner." },
            { translation: "The table is ready after hands are washed." },
          ],
        },
      });
    });

    await page.goto("/tools/declarative-language-translator");

    await expect(page.getByRole("heading", { name: "Declarative Language Translator" })).toBeVisible();
    await expect(page.getByText("If this helped you find usable words")).toHaveCount(0);

    await page.getByLabel("Caregiver phrase").fill("Please come down and wash your hands. It's dinner time.");
    await page.getByRole("button", { name: "Straightforward" }).click();
    await page.getByRole("button", { name: "Fewer words" }).click();
    await page.getByRole("button", { name: "Get ideas" }).click();

    await expect(page.getByText("Dinner is ready. Hands first.")).toBeVisible();
    await expect(page.getByText("If this helped you find usable words")).toBeVisible();
    expect(requests[0]).toMatchObject({
      text: "Please come down and wash your hands. It's dinner time.",
      tone: "Straightforward",
      useFewerWords: true,
    });

    await page.getByRole("button", { name: "Copy suggestion" }).first().click();
    await expect(page.getByRole("status")).toContainText("Copied suggestion");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
      "Dinner is ready. Hands first.",
    );

    await page.getByRole("button", { name: "Try a variation" }).first().click();
    await expect(page.getByRole("button", { name: "Longer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Shorter" })).toHaveCount(0);
    await page.getByRole("button", { name: "Longer" }).click();

    await expect(page.getByText("Walking speed inside; running can wait for outside.")).toBeVisible();
    expect(requests[1]).toMatchObject({
      mode: "variation",
      variationKind: "longer",
    });
  });

  test("interest based tone requires an interest before generation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop translator validation only");

    await page.goto("/tools/declarative-language-translator");
    await page.getByLabel("Caregiver phrase").fill("Put your shoes on");
    await page.getByRole("button", { name: "Interest Based" }).click();

    await expect(page.getByRole("button", { name: "Get ideas" })).toBeDisabled();
    await page.getByLabel("Child interest").fill("Pokemon");
    await expect(page.getByRole("button", { name: "Get ideas" })).toBeEnabled();
  });

  test("mobile translator layout has no horizontal overflow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "mobile translator layout only");

    await page.route("**/api/declarative/translate", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          translations: [
            { translation: "The backpack is ready by the door." },
            { translation: "Shoes are part of the next step." },
          ],
        },
      });
    });

    await page.goto("/tools/declarative-language-translator");
    await page.getByRole("button", { name: "School example" }).click();
    await page.getByRole("button", { name: "Get ideas" }).click();
    await expect(page.getByText("The backpack is ready by the door.")).toBeVisible();

    const viewport = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: window.innerWidth,
    }));

    expect(viewport.width).toBe(390);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(390);
  });
});
