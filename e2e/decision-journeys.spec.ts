import { expect, test, type Page } from "@playwright/test";
const mobile = { width: 375, height: 812 };
async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(
    sizes.content,
    `content width ${sizes.content}px exceeds ${sizes.viewport}px viewport`,
  ).toBeLessThanOrEqual(sizes.viewport);
}
async function generateProject(page: Page, idea: string) {
  await page.getByLabel("どんなゲームを作りたいですか？").fill(idea);
  await page.getByRole("button", { name: "条件を確認する" }).click();
  const defaults = [
    "other",
    "2d",
    "web",
    "undecided",
    "low",
    "beginner",
    "solo",
    "undecided",
    "ja",
  ];
  const selects = await page.locator(".clarify-form select").all();
  for (const [index, select] of selects.entries()) {
    if ((await select.inputValue()) === "unknown")
      await select.selectOption(defaults[index]);
    await expect(select).not.toHaveValue("unknown");
  }
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Project Planを作る" }).click();
}
test("375px: homeからno voice/no 3DのProject Planを完走できる", async ({
  page,
}) => {
  await page.setViewportSize(mobile);
  await page.goto("/");
  await expectNoHorizontalOverflow(page);
  const button = page.getByRole("button", { name: "条件を確認する" });
  const box = await button.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await generateProject(
    page,
    "2Dパズル。ブラウザゲーム。一人開発。初心者。無料で作る。個人利用。Godot。音声なし。3Dなし。",
  );
  await expect(
    page.getByRole("heading", { name: /最初に作るものが/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "最初のプレイ可能範囲" }),
  ).toBeVisible();
  await expect(page.locator(".project-result")).not.toContainText(
    "権利記録付き音声ファイル",
  );
  await expect(page.locator(".project-result")).not.toContainText(
    "エンジン取込済み3Dアセット",
  );
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: "test-results/project-generator-375.png",
    fullPage: true,
  });
});
test("375px: 2候補比較と差分のみ表示を操作できる", async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto("/compare?ids=github-copilot,cursor");
  await expect(page.getByText("2 / 4")).toBeVisible();
  await page.getByLabel("差分のみ表示").check();
  await expect(page.getByText(/差分のみ表示中/)).toBeVisible();
  await expect(page.locator(".compare-mobile article")).toHaveCount(2);
  await expectNoHorizontalOverflow(page);
});
test("375px: Stacksを補助ルートとして閲覧できる", async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto("/stacks/2d-rpg");
  await expect(page.getByRole("heading", { name: /2D RPG/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Project Generatorのエンジン条件が計画と共有stateへ反映される", async ({
  page,
}) => {
  await page.goto("/project");
  await generateProject(
    page,
    "Steam向け3Dホラー。Unity。プログラミング中級。一人開発。低予算。商用。",
  );
  await expect(
    page.getByRole("heading", { name: /最初に作るものが/ }),
  ).toBeVisible();
  await expect(page.locator(".project-result")).toContainText("Unity");
  await expect(page).toHaveURL(/\?v=1&p=/);
});

test("320pxかつ200% zoomでも主要画面に横方向の文書overflowがない", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const route of ["/", "/builder", "/compare?ids=github-copilot,cursor"]) {
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
    await expectNoHorizontalOverflow(page);
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  }
});

test("4ツール比較、差分絞り込み、キーボードfocusを維持する", async ({
  page,
}) => {
  await page.goto("/compare?ids=github-copilot,cursor,elevenlabs,meshy");
  await expect(page.getByText("4 / 4")).toBeVisible();
  const differences = page.getByLabel("差分のみ表示");
  await differences.focus();
  await expect(differences).toBeFocused();
  await page.keyboard.press("Space");
  await expect(differences).toBeChecked();
  await expect(page.getByText(/差分のみ表示中/)).toBeVisible();
  const remove = page.getByRole("button", { name: "Meshyを比較から解除" });
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("3 / 4")).toBeVisible();
  await expect(page).toHaveURL(
    /ids=github-copilot%2Ccursor%2Celevenlabs|ids=github-copilot,cursor,elevenlabs/,
  );
});
