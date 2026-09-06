import { expect, test, type Page } from "@playwright/test";

type CapturedEvent = { name: string; properties: Record<string, unknown> };
const storageKey = "gameai:e2e-analytics";

async function installAnalyticsCapture(page: Page) {
  await page.addInitScript((key) => {
    const marker = `${key}:installed`;
    if (!sessionStorage.getItem(marker)) {
      localStorage.removeItem(key);
      sessionStorage.setItem(marker, "1");
    }
    window.addEventListener("gameai:event", (event) => {
      const detail = (event as CustomEvent).detail as CapturedEvent;
      const events = JSON.parse(
        localStorage.getItem(key) ?? "[]",
      ) as CapturedEvent[];
      events.push(detail);
      localStorage.setItem(key, JSON.stringify(events));
    });
  }, storageKey);
}
async function events(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "[]") as CapturedEvent[],
    storageKey,
  );
}

test("article → Project → first completion → next task is observable without raw input", async ({
  page,
}) => {
  await installAnalyticsCapture(page);
  await page.goto("/articles/ai-browser-game-how-to/");
  await page.locator(".article-project-cta a").click();
  await expect(page).toHaveURL(/\/project\/?\?source=ai-browser-game-how-to/);

  const secretIdea = "秘密の企画名を含む、初心者向け猫タップ得点ブラウザゲーム";
  await page.getByLabel("どんなゲームを作りたいですか？").fill(secretIdea);
  await page
    .getByRole("button", { name: "制作ロードマップを作る", exact: true })
    .click();
  await page
    .locator(".beginner-starter")
    .getByRole("button", {
      name: "この内容を確認して、最初のゲームを作る",
      exact: true,
    })
    .click();
  await expect(page.locator(".beginner-action")).toBeVisible();
  await expect(page).toHaveURL(/source=ai-browser-game-how-to/);
  expect(page.url()).not.toContain(encodeURIComponent(secretIdea));

  await page
    .getByRole("button", {
      name: "完了条件を確認して「できた」へ",
      exact: true,
    })
    .click();
  const current = page.locator(".action-step.is-current");
  for (const criterion of await current.locator(".done-criteria input").all())
    await criterion.check();
  await current.locator(".completion-control input").check();
  await expect(page.locator(".build-progress")).toContainText(/1 \/ \d+ 完了/);

  const captured = await events(page);
  const names = captured.map((event) => event.name);
  for (const expected of [
    "article_view",
    "article_to_project",
    "project_start",
    "project_generated",
    "first_task_viewed",
    "task_completed",
    "next_task_reached",
  ])
    expect(
      names.filter((name) => name === expected),
      `${expected}: ${JSON.stringify(captured)}`,
    ).toHaveLength(1);
  expect(JSON.stringify(captured)).not.toContain(secretIdea);
  expect(
    captured.find((event) => event.name === "article_to_project")?.properties,
  ).toMatchObject({
    article_slug: "ai-browser-game-how-to",
    cta_placement: "article_end",
  });
  for (const eventName of [
    "project_start",
    "project_generated",
    "first_task_viewed",
    "task_completed",
    "next_task_reached",
  ])
    expect(
      captured.find((event) => event.name === eventName)?.properties,
      `${eventName}: ${JSON.stringify(captured)}`,
    ).toMatchObject({
      article_slug: "ai-browser-game-how-to",
      source_context: "article",
      route_category: "project",
    });
  expect(
    captured.find((event) => event.name === "task_completed")?.properties,
  ).toMatchObject({ task_index: 0, route_category: "project" });
  expect(
    captured.find((event) => event.name === "next_task_reached")?.properties,
  ).toMatchObject({ task_index: 1, route_category: "project" });
});
