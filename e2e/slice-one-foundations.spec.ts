import { expect, test } from "./fixtures";
import { acceptanceViewports, stressValues } from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";

const baselineRoutes = [
  "/",
  "/project",
  "/articles",
  "/articles/ai-browser-game-how-to",
  "/articles/elevenlabs-game-development-guide",
  "/articles/meshy-game-development-guide",
  "/tools",
  "/guides",
  "/compare",
  "/privacy",
] as const;

test.describe("Issue 137 Slice 1 foundations", () => {
  test("semantic tokens and reduced-motion contract are active", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        h1: style.getPropertyValue("--type-h1").trim(),
        gutter: style.getPropertyValue("--gutter").trim(),
        action: style.getPropertyValue("--color-action").trim(),
        focus: style.getPropertyValue("--focus-ring").trim(),
        motion: style.getPropertyValue("--motion-state").trim(),
        scrollBehavior: style.scrollBehavior,
      };
    });
    expect(tokens).toEqual({
      h1: "clamp(1.875rem,1.72rem + .65vw,2.5rem)",
      gutter: "clamp(16px,4vw,32px)",
      action: "#176b5b",
      focus: "3px solid #0b6fd3",
      motion: ".12s",
      scrollBehavior: "auto",
    });
  });

  for (const viewport of acceptanceViewports) {
    test(`all baseline routes retain their width ownership at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const route of baselineRoutes) {
        await page.goto(route);
        const diagnostics = await diagnoseWidths(page);
        if (route === "/compare" && viewport.width < 400) {
          // The generic foundation may change geometry, but Slice 6 still owns acceptance.
          expect(diagnostics.documentOverflowPx).toBeGreaterThan(0);
        } else {
          expect(diagnostics.documentOverflowPx, `${route} introduced document overflow`).toBe(0);
        }
      }
    });
  }

  test("intrinsic text, focus and owned scrollers satisfy the shared contract", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/");
    await page.evaluate(({ idea, token }) => { document.body.innerHTML = `
      <main class="ui-shell"><div class="ui-stack">
        <p class="ui-contain-text" data-user-content="true">${idea}${token}</p>
        <div class="ui-action-group"><button class="ui-action ui-action--primary">Primary action</button></div>
        <label class="ui-field">Game idea<textarea id="fixture-anchor">${idea}</textarea></label>
        <div class="ui-scroll-region" data-acceptance-scroll-owner="true" role="region" aria-label="code" tabindex="0"><div style="min-width:700px"><pre><code>${token}</code></pre></div></div>
      </div></main>`; }, { idea: stressValues.longGameIdea, token: stressValues.unbrokenToken });
    const longText = page.locator(".ui-contain-text");
    await expect(longText).toBeVisible();
    const diagnostics = await diagnoseWidths(page);
    expect(diagnostics.documentOverflowPx).toBe(0);
    expect(diagnostics.ownedLocalScrollers.length).toBe(1);
    const action = page.getByRole("button", { name: "Primary action" });
    await action.focus();
    await expect(action).toBeFocused();
    expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    const focusStyle = await action.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.outlineColor, width: style.outlineWidth, offset: style.outlineOffset };
    });
    expect(focusStyle).toEqual({ color: "rgb(11, 111, 211)", width: "3px", offset: "3px" });
    const anchorOffset = await page.locator("textarea").evaluate((element) => getComputedStyle(element).scrollMarginBlockStart);
    expect(anchorOffset).toBe("72px");
    await page.getByRole("region", { name: "code" }).focus();
    await expect(page.getByRole("region", { name: "code" })).toBeFocused();
  });
});
