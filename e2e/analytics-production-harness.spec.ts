import type { BrowserContext } from "@playwright/test";
import { expect, test } from "./fixtures";

const canonicalOrigin = "https://game-ai-hub.vercel.app";
const localOrigin = "http://127.0.0.1:3100";
const googleLoader = /https:\/\/www\.googletagmanager\.com\/gtag\/js/;

type AnalyticsWindow = Window & {
  __gameAIAnalyticsEligible?: boolean;
  __gameAIAnalyticsLoaded?: boolean;
  __gaFixtureLoads?: number;
  __gaFixtureConsumed?: unknown[][];
  __gaFixtureLive?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  dataLayer?: IArguments[];
};

async function proxyCanonicalApplication(context: BrowserContext) {
  await context.route(`${canonicalOrigin}/**`, async (route) => {
    const requestUrl = new URL(route.request().url());
    const response = await route.fetch({
      url: `${localOrigin}${requestUrl.pathname}${requestUrl.search}`,
    });
    await route.fulfill({ response });
  });
}

const localGoogleFixture = `(()=>{
  window.__gaFixtureLoads=(window.__gaFixtureLoads||0)+1;
  window.__gaFixtureConsumed=(window.dataLayer||[]).map((entry)=>Array.from(entry));
  window.__gaFixtureLive=[];
  window.gtag=function(){window.__gaFixtureLive.push(Array.from(arguments))};
})();`;

test.describe("permitted Production browser harness", () => {
  test("retains bounded early events, loads once, and does not replay excluded events", async ({
    context,
    page,
  }) => {
    // Routes are installed before the first navigation. No request in this
    // harness reaches Google; fulfilled traffic is a simulated transport, not
    // evidence of native GA4 receipt.
    let releaseLoader: () => void = () => undefined;
    const loaderGate = new Promise<void>((resolve) => { releaseLoader = resolve; });
    await context.route(googleLoader, async (route) => {
      await loaderGate;
      await route.fulfill({ contentType: "application/javascript", body: localGoogleFixture });
    });
    await proxyCanonicalApplication(context);

    await page.goto(`${canonicalOrigin}/project`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() =>
      (window as AnalyticsWindow).gtag?.("event", "project_generated", { game_type: "2d" }),
    );
    releaseLoader();
    await expect.poll(() => page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsLoaded)).toBe(true);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible)).toBe(true);
    const firstDocument = await page.evaluate(() => ({
      loads: (window as AnalyticsWindow).__gaFixtureLoads,
      consumed: (window as AnalyticsWindow).__gaFixtureConsumed,
      live: (window as AnalyticsWindow).__gaFixtureLive,
    }));
    expect(firstDocument.loads).toBe(1);
    expect(firstDocument.consumed?.map((entry) => entry[0])).toEqual(["js", "config", "event"]);
    expect(firstDocument.consumed?.[2]?.slice(0, 2)).toEqual(["event", "project_generated"]);
    expect(firstDocument.live).toEqual([]);

    const idea = "初心者向け猫タップ得点ブラウザゲーム";
    await page.evaluate(() => {
      (window as AnalyticsWindow).__gaFixtureLive = [];
      (window as AnalyticsWindow).gtag = (...args: unknown[]) => {
        (window as AnalyticsWindow).__gaFixtureLive?.push(args);
        throw new Error("simulated transport failure");
      };
    });
    await page.getByLabel("どんなゲームを作りたいですか？").fill(idea);
    await page.getByRole("button", { name: "制作ロードマップを作る", exact: true }).click();
    await page.locator(".beginner-starter").getByRole("button", {
      name: "この内容を確認して、最初のゲームを作る",
      exact: true,
    }).click();
    await expect(page.locator(".beginner-action")).toBeVisible();
    await page.getByRole("button", { name: "完了条件を確認して「できた」へ", exact: true }).click();
    const current = page.locator(".action-step.is-current");
    for (const criterion of await current.locator(".done-criteria input").all())
      await criterion.check();
    await current.locator(".completion-control input").check();
    await expect(page.locator(".build-progress")).toContainText(/1 \/ \d+ 完了/);
    const attempted = await page.evaluate(() =>
      ((window as AnalyticsWindow).__gaFixtureLive ?? []).map((args) => args[1]),
    );
    expect(attempted.filter((name) => name === "project_generated")).toHaveLength(1);
    expect(attempted.filter((name) => name === "task_completed")).toHaveLength(1);

    await page.goto(`${canonicalOrigin}/privacy?gameai_analytics=off`);
    await expect(page).toHaveURL(`${canonicalOrigin}/privacy`);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible)).toBe(false);
    expect(await page.evaluate(() => (window as AnalyticsWindow).dataLayer)).toBeUndefined();
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gaFixtureLoads)).toBeUndefined();

    await page.reload();
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible)).toBe(false);
    await page.goto(`${canonicalOrigin}/privacy?gameai_analytics=on`);
    await expect(page).toHaveURL(`${canonicalOrigin}/privacy`);
    await expect.poll(() => page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsLoaded)).toBe(true);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible)).toBe(true);

    await page.getByRole("link", { name: "目的からAIを探す", exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`^${canonicalOrigin}/tools/?$`));
    await page.goBack();
    await page.goForward();
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible)).toBe(true);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gaFixtureLoads)).toBe(1);
  });

  test("caps a delayed queue and disposes failed loading before late fixture execution", async ({
    context,
    page,
  }) => {
    await context.route(googleLoader, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10_500));
      await route.fulfill({ contentType: "application/javascript", body: localGoogleFixture }).catch(() => undefined);
    });
    await proxyCanonicalApplication(context);

    await page.goto(`${canonicalOrigin}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const analyticsWindow = window as AnalyticsWindow;
      for (let index = 0; index < 50; index += 1)
        analyticsWindow.gtag?.("event", `early-${index}`);
    });
    const pending = await page.evaluate(() =>
      ((window as AnalyticsWindow).dataLayer ?? []).map((entry) => Array.from(entry).slice(0, 2)),
    );
    expect(pending).toHaveLength(32);
    expect(pending.slice(0, 2).map((entry) => entry[0])).toEqual(["js", "config"]);
    expect(pending[2]).toEqual(["event", "early-20"]);

    await expect.poll(
      () => page.evaluate(() => (window as AnalyticsWindow).__gameAIAnalyticsEligible),
      { timeout: 12_000 },
    ).toBe(false);
    expect(await page.evaluate(() => (window as AnalyticsWindow).dataLayer)).toBeUndefined();
    expect(await page.evaluate(() => (window as AnalyticsWindow).gtag)).toBeUndefined();
    await page.waitForTimeout(750);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gaFixtureLoads)).toBe(1);
    expect(await page.evaluate(() => (window as AnalyticsWindow).__gaFixtureConsumed)).toEqual([]);
    expect(await page.evaluate(() => (window as AnalyticsWindow).gtag)).toBeUndefined();
  });
});
