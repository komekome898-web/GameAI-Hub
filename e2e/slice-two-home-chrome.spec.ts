import { expect, test } from "./fixtures";
import { acceptanceViewports, installAcceptanceNetworkGuard } from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";

const baselineRoutes = ["/", "/project", "/articles", "/tools", "/guides", "/compare", "/privacy"] as const;

test.describe("Issue 137 Slice 2 Home composition", () => {
  for (const viewport of acceptanceViewports) {
    test(`primary idea action and bounded title at ${viewport.width}x${viewport.height}`, async ({ page, context }) => {
      const collectorAttempts = await installAcceptanceNetworkGuard(context);
      await page.setViewportSize(viewport);
      await page.goto("/");
      const h1 = page.getByRole("heading", { level: 1 });
      const action = page.getByRole("button", { name: "最初の作業を作る" });
      await expect(h1).toHaveText(/作りたいゲームから、次の1作業を決める。/);
      await expect(action).toBeVisible();
      const [headingBox, actionBox] = await Promise.all([h1.boundingBox(), action.boundingBox()]);
      if (viewport.width < 400) {
        expect(headingBox?.height).toBeLessThan(150);
        expect(actionBox?.y).toBeLessThan(viewport.width === 390 ? 700 : 760);
        expect((actionBox?.y ?? 0) + (actionBox?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
      }
      expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
      expect(collectorAttempts).toEqual([]);
    });
  }

  test("preserves the exact idea and Home attribution while navigating to Project", async ({ page, context }) => {
    const collectorAttempts = await installAcceptanceNetworkGuard(context);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const idea = "猫をタップすると得点が増えるブラウザゲーム";
    await page.getByLabel("どんなゲームを作りたいですか？").fill(idea);
    await page.getByRole("button", { name: "最初の作業を作る" }).click();
    await expect(page).toHaveURL(/\/project\/?$/);
    await expect(page.getByText(idea, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("gameai:project-idea"))).toBe(idea);
    expect(collectorAttempts).toEqual([]);
  });

  test("mobile menu traps focus, closes with Escape, and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "メニューを開く" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "サイトメニュー" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "メニューを閉じる" }).last()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: /プライバシー/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("link", { name: /記事/ }).click();
    await expect(page).toHaveURL(/\/articles\/?$/);
    await expect(page.getByRole("dialog", { name: "サイトメニュー" })).toHaveCount(0);
  });

  for (const viewport of acceptanceViewports) {
    test(`shared chrome adds no new baseline-route overflow at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const route of baselineRoutes) {
        await page.goto(route);
        const diagnostics = await diagnoseWidths(page);
        if (route === "/compare" && viewport.width < 400) expect(diagnostics.documentOverflowPx).toBeGreaterThan(0);
        else expect(diagnostics.documentOverflowPx, `${route} overflowed`).toBe(0);
      }
    });
  }
});
