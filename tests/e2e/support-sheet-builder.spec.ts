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
    await expect(page.getByLabel("Printable footer")).toHaveValue(
      "Created with the free PDA Support Sheet Builder: http://127.0.0.1:3000/tools/support-sheet-builder",
    );
    await expect(page.getByLabel("Printable footer")).not.toHaveValue(/Taylor|\?/);
    await page.getByLabel("Printable footer").fill("Custom footer parents can remove.");
    await expect(page.getByLabel("Printable footer")).toHaveValue(
      "Custom footer parents can remove.",
    );
    await expect(page.getByText("If this saved you an hour of emotional labor")).toBeVisible();
    await page.getByRole("button", { name: "Share this tool" }).click();
    await expect(page.getByRole("status")).toContainText("Copied tool link");
    const sharedText = await page.evaluate(() => navigator.clipboard.readText());
    expect(sharedText).toContain("/tools/support-sheet-builder");
    expect(sharedText).not.toContain("Taylor");
    expect(sharedText).not.toContain("?");

    await page.getByRole("tab", { name: "Email" }).click();
    await expect(page.locator(".copy-box")).toHaveValue(
      /I wanted to share a short support guide for Taylor/,
    );
    await expect(page.locator(".copy-box")).toHaveValue(
      /Created with the free PDA Support Sheet Builder: http:\/\/127\.0\.0\.1:3000\/tools\/support-sheet-builder/,
    );
    await expect(page.locator(".copy-box")).not.toHaveValue(/\?child=/);
    const emailWithoutFooter = (await page.locator(".copy-box").inputValue()).replace(
      /\n\nCreated with the free PDA Support Sheet Builder: http:\/\/127\.0\.0\.1:3000\/tools\/support-sheet-builder/,
      "",
    );
    await page.locator(".copy-box").fill(emailWithoutFooter);
    await expect(page.locator(".copy-box")).not.toHaveValue(/Support Sheet Builder: http/);
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

  test("print output fits common one-page paper sizes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop print layout check only");

    const paperSizes = [
      { name: "Letter", contentWidth: 729, contentHeight: 969 },
      { name: "A4", contentWidth: 707, contentHeight: 1035 },
    ];

    for (const paper of paperSizes) {
      await page.emulateMedia({ media: "screen" });
      await page.setViewportSize({
        width: paper.contentWidth,
        height: paper.contentHeight,
      });
      await page.goto("/tools/support-sheet-builder");
      await page.getByRole("button", { name: /Generate support sheet/i }).click();
      await page.emulateMedia({ media: "print" });

      const printLayout = await page.evaluate(() => {
        const sheet = document.querySelector(".printable-sheet");
        const sheetRect = sheet?.getBoundingClientRect();
        const visibleNoPrint = [...document.querySelectorAll(".no-print")].filter((element) => {
          const style = getComputedStyle(element);
          return style.display !== "none" && style.visibility !== "hidden";
        });
        const visibleControls = [...document.querySelectorAll("button, input, textarea, select")].filter(
          (element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          },
        );
        const sectionColumns = getComputedStyle(
          document.querySelector(".sheet-sections") as Element,
        ).gridTemplateColumns;

        return {
          columns: sectionColumns.split(" ").filter(Boolean).length,
          printListDisplay: getComputedStyle(
            document.querySelector(".print-only-list") as Element,
          ).display,
          printTitleDisplay: getComputedStyle(
            document.querySelector(".print-only-title") as Element,
          ).display,
          sheetHeight: sheetRect?.height ?? 0,
          sheetWidth: sheetRect?.width ?? 0,
          visibleControls: visibleControls.length,
          visibleNoPrint: visibleNoPrint.length,
        };
      });

      expect(printLayout, `${paper.name} print layout`).toMatchObject({
        columns: 2,
        printListDisplay: "block",
        printTitleDisplay: "block",
        visibleControls: 0,
        visibleNoPrint: 0,
      });
      expect(printLayout.sheetWidth, `${paper.name} print width`).toBeLessThanOrEqual(
        paper.contentWidth,
      );
      expect(printLayout.sheetHeight, `${paper.name} print height`).toBeLessThanOrEqual(
        paper.contentHeight,
      );
    }
  });

  test("public examples make value clear before form entry", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop examples route check only");

    const examples = [
      { slug: "teacher", title: "Teacher example" },
      { slug: "family", title: "Grandparent or relative example" },
      { slug: "childcare", title: "Babysitter or childcare example" },
      { slug: "medical-provider", title: "Dentist or provider example" },
      { slug: "activity-leader", title: "Coach, camp, or activity example" },
    ];

    await page.goto("/tools/support-sheet-builder/examples");
    await expect(page.getByRole("heading", { name: "Support Sheet Examples" })).toBeVisible();
    await expect(page.getByText("Preview fictional examples before entering child details.")).toBeVisible();

    for (const example of examples) {
      await expect(page.getByRole("link", { name: new RegExp(example.title, "i") })).toBeVisible();
    }

    for (const example of examples) {
      await page.goto(`/tools/support-sheet-builder/examples/${example.slug}`);
      await expect(page.getByRole("heading", { name: example.title })).toBeVisible();
      await expect(page.getByText("Fictional example")).toBeVisible();
      await expect(page.getByText("What this shows")).toBeVisible();
      await expect(page.getByRole("link", { name: "Build your own support sheet" })).toHaveAttribute(
        "href",
        "/tools/support-sheet-builder",
      );
      await expect(page.getByRole("textbox", { name: "Child name or nickname" })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: /How to Support/i })).toBeVisible();
      await expect(page.getByText("Created with the free PDA Support Sheet Builder.")).toBeVisible();
    }
  });
});
