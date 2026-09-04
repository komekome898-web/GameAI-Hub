import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";

// This is a runner fixture, not an AI response or proof that an AI generated a game.
// Its only purpose is to exercise paste → play → save → reopen in the real UI.
const runnerFixture = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>動作確認用ゲーム</title><style>body{font:18px sans-serif;padding:16px}button{min-height:48px;padding:12px}p{overflow-wrap:anywhere}</style></head><body><main><h1>動作確認用ゲーム</h1><p id="result">開始できます</p><button onclick="document.getElementById('result').textContent='クリアしました'">ゴールへ進む</button><button onclick="document.getElementById('result').textContent='開始できます'">やり直す</button></main></body></html>`;

const scenarios = [
  {
    id: "a",
    name: "移動してゴールする2Dゲーム",
    idea: "ゲーム制作は初めてです。\nブラウザで遊べる簡単な2Dゲームを作りたいです。\nキャラクターを動かして、ゴールまで行けばクリアになるゲームにしたいです。",
    requiredPrompt: [/ゴール/, /移動/, /やり直|もう一度/],
  },
  {
    id: "b",
    name: "モンスター1対1バトル",
    idea: "モンスターと1対1で戦う2Dブラウザゲームを作りたい。\nゲーム制作は初めてです。まず画像と音声なしで、\nたたかう・勝敗・やり直しを作りたい。",
    requiredPrompt: [/モンスター/, /HP/, /勝敗/, /やり直|もう一度/],
  },
  {
    id: "c",
    name: "恋愛ノベルゲーム",
    idea: "ゲーム制作は初めてです。\nブラウザで遊べる恋愛ノベルゲームを作りたいです。\n背景、キャラクター、会話を表示して次へ進むゲームにしたいです。",
    requiredPrompt: [/背景/, /登場人物|キャラクター/, /台詞|会話/, /次へ/],
  },
] as const;

async function beginFromHome(page: Page, idea: string) {
  await page.goto("/");
  await page.getByLabel("どんなゲームを作りたいですか？").fill(idea);
  await page
    .getByRole("button", { name: "制作ロードマップを作る", exact: true })
    .click();
  const starter = page.locator(".beginner-starter");
  await expect(starter).toBeVisible();
  await expect(starter).toContainText(/初めて|初心者/);
  await starter
    .getByRole("button", {
      name: "この内容を確認して、最初のゲームを作る",
      exact: true,
    })
    .click();
  await expect(page.locator(".beginner-action")).toBeVisible();
  await expect(page.locator(".build-progress")).toContainText(/0 \/ \d+ 完了/);
  await expect(
    page.getByLabel("ゲームのコード", { exact: true }),
  ).toBeVisible();
}

async function expectCopilotPreflight(scope: Locator) {
  const preflight = scope.locator(".copilot-preflight").first();
  const summary = preflight.getByText("GitHub Copilotを開く前に確認", {
    exact: true,
  });
  await expect(summary).toBeVisible();
  await summary.click();
  const copilot = preflight.getByRole("link", {
    name: "GitHubを使ったことがある — Copilotへ",
    exact: true,
  });
  const guide = preflight.getByRole("link", {
    name: "GitHubが初めて — 登録ガイド",
    exact: true,
  });
  await expect(copilot).toBeVisible();
  await expect(copilot).toHaveAttribute("href", "https://github.com/copilot");
  await expect(guide).toBeVisible();
  const guideHref = await guide.getAttribute("href");
  expect(guideHref).toMatch(
    /^\/articles\/github-beginner-game-development\/\?returnTo=/,
  );
  const returnTo = new URL(guideHref!, "http://gameai.test").searchParams.get(
    "returnTo",
  );
  expect(returnTo).toMatch(/^\/project#quest-/);
  return { guide, returnTo };
}

async function completeCurrentTask(page: Page, expectedCount: number) {
  const previousHeading = await page
    .locator("#beginner-action-title")
    .innerText();
  await page
    .getByRole("button", {
      name: "完了条件を確認して「できた」へ",
      exact: true,
    })
    .click();
  const current = page.locator(".action-step.is-current");
  await expect(current).toHaveAttribute("open", "");
  const criteria = current.locator(".done-criteria input");
  expect(await criteria.count()).toBeGreaterThan(0);
  await expect(current.locator(".completion-control input")).toBeDisabled();
  for (const criterion of await criteria.all()) await criterion.check();
  await current.locator(".completion-control input").check();
  await expect(page.locator(".build-progress")).toContainText(
    new RegExp(`${expectedCount} \\/ \\d+ 完了`),
  );
  await expect(page.locator("#beginner-action-title")).not.toHaveText(
    previousHeading,
  );
  await expect(page.locator(".artifact-progress")).toContainText("できた");
}

async function retainScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const directory = path.resolve("docs/screenshots");
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, `beginner-acceptance-${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach(name, { path: screenshot, contentType: "image/png" });
}

test.describe("Beginner acceptance: current production journey contracts", () => {
  for (const kind of ["voice", "image"] as const) {
    test(`optional ${kind}: 素材の入力・保存・相談をコード制作から区別する`, async ({
      page,
      context,
    }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 320, height: 740 });
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await beginFromHome(
        page,
        `ゲーム制作は初めてです。ブラウザで遊べる2Dの恋愛ノベルゲームを作りたいです。${kind === "voice" ? "台詞の音声も生成したいです。" : "背景とキャラクターの画像を生成したいです。"}`,
      );
      const editor = page.getByLabel("ゲームのコード", { exact: true });
      await editor.fill(runnerFixture);
      await page
        .getByRole("button", { name: "ゲームを表示", exact: true })
        .click();
      for (let count = 1; count <= 4; count++)
        await completeCurrentTask(page, count);
      const active = page.locator(".beginner-action");
      if (kind === "image") {
        await expect(page.locator("#beginner-action-title")).toContainText(
          "背景の仮表示をゲーム内に作る",
        );
        await expect(active).toContainText("完成イラストは後で差し替え");
        await expect(active).toContainText("新しい画像ファイルは不要");
        await expect(active).not.toContainText("background.png");
        await expect(editor).toBeVisible();
        await expect(editor).toHaveValue(runnerFixture);
        await active
          .getByRole("button", { name: "この指示をコピー", exact: true })
          .click();
        expect(
          await page.evaluate(() => navigator.clipboard.readText()),
        ).toContain("画像ファイルや外部サービスを要求しない");
        await retainScreenshot(page, testInfo, "image-fallback-320");
        await completeCurrentTask(page, 5);
        await expect(page.locator("#beginner-action-title")).toContainText(
          "最初から最後まで遊んで確かめる",
        );
        await expect(editor).toHaveValue(runnerFixture);
        return;
      }
      await expect(page.locator("#beginner-action-title")).toContainText(
        "短い台詞の音声を1つ",
      );
      await expect(editor).toBeHidden();
      const steps = active.locator(".beginner-steps");
      if (kind === "voice") {
        await expect(steps).toContainText("その台詞だけ入力");
        await expect(steps).toContainText("voice.wav");
        await expect(steps).not.toContainText("PNG");
        await expect(active.locator(".action-prompt")).toHaveCount(0);
        await expect(active.locator(".beginner-action-grid")).toContainText(
          "広告リンク",
        );
        await expect(
          active.locator(".beginner-action-grid a").first(),
        ).toHaveAttribute("href", /^https:\/\/try\.elevenlabs\.io\//);
      }
      await page
        .getByText("作ったゲーム・台詞を確認する", { exact: true })
        .click();
      await expect(editor).toBeVisible();
      await expect(editor).toHaveValue(runnerFixture);
      await expect(
        page.frameLocator("iframe").getByText("開始できます", { exact: true }),
      ).toBeVisible();
      await page
        .getByText("作ったゲーム・台詞を確認する", { exact: true })
        .click();
      await active
        .getByRole("button", { name: "ここで詰まった", exact: true })
        .click();
      const help = page.locator("#beginner-stuck-panel");
      await expectCopilotPreflight(help);
      await expect(help.locator("pre")).toContainText(
        "相談先のAI: GitHub Copilot",
      );
      if (kind === "voice")
        await expect(help.locator("pre")).toContainText(
          "作業に使っているツール: ElevenLabs",
        );
      await page
        .getByLabel("困っていること・表示されたエラー", { exact: true })
        .fill("保存ボタンが見つかりません。");
      await help
        .getByRole("button", { name: "相談文をコピー", exact: true })
        .click();
      expect(
        await page.evaluate(() => navigator.clipboard.readText()),
      ).toContain("保存ボタンが見つかりません。");
      await retainScreenshot(page, testInfo, `${kind}-320-help`);
      await completeCurrentTask(page, 5);
      await expect(page.locator("#beginner-action-title")).toContainText(
        "ゲームへ入れる",
      );
      await expect(editor).toBeVisible();
      await expect(editor).toHaveValue(runnerFixture);
      await expect(
        page.getByRole("button", { name: "index.htmlを保存", exact: true }),
      ).toBeEnabled();
      await expect(
        page.frameLocator("iframe").getByText("開始できます", { exact: true }),
      ).toBeVisible();
    });
  }

  for (const scenario of scenarios) {
    test(`${scenario.id.toUpperCase()}: ${scenario.name}を新規状態から開始し3作業の進捗を保持する`, async ({
      page,
      context,
    }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 375, height: 812 });
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await beginFromHome(page, scenario.idea);

      const active = page.locator(".beginner-action");
      const prompt = active.locator(".action-prompt pre");
      for (const content of scenario.requiredPrompt)
        await expect(prompt).toContainText(content);
      await expect(prompt).toContainText("index.html");
      const { guide, returnTo } = await expectCopilotPreflight(
        active.locator(".beginner-action-grid"),
      );
      if (scenario.id === "a") {
        const originalTask = await page
          .locator("#beginner-action-title")
          .innerText();
        const guidePagePromise = context.waitForEvent("page");
        await guide.click();
        const guidePage = await guidePagePromise;
        await guidePage.waitForLoadState();
        await expect(guidePage).toHaveURL(
          /\/articles\/github-beginner-game-development\/\?returnTo=/,
        );
        await expect(
          guidePage.getByRole("heading", { name: "元のGameAI Hubタブへ戻る" }),
        ).toBeVisible();
        const returnHref = await guidePage
          .getByRole("link", { name: "元のProjectを開く" })
          .getAttribute("href");
        const normalizedReturn = new URL(returnHref!, "http://gameai.test");
        const requestedReturn = new URL(returnTo!, "http://gameai.test");
        expect(normalizedReturn.pathname).toBe("/project/");
        expect(normalizedReturn.search).toBe(requestedReturn.search);
        expect(normalizedReturn.hash).toBe(requestedReturn.hash);
        await expect(
          guidePage.getByRole("link", { name: "Project Generatorを開く" }),
        ).toHaveCount(0);
        await retainScreenshot(guidePage, testInfo, "github-guide-return-375");
        await guidePage.close();
        await page.bringToFront();
        await expect(page.locator("#beginner-action-title")).toHaveText(
          originalTask,
        );
        await expect(page.locator(".build-progress")).toContainText(
          /0 \/ \d+ 完了/,
        );
      }
      await active
        .getByRole("button", { name: "この指示をコピー", exact: true })
        .click();
      await expect(
        active.locator('.action-prompt [role="status"]'),
      ).toContainText("コピーしました");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        await prompt.innerText(),
      );

      // An accidental collapse must remain recoverable using the visible primary action.
      const current = page.locator(".action-step.is-current");
      const currentSummary = current.locator(":scope > summary");
      await currentSummary.click();
      await expect(current).not.toHaveAttribute("open", "");
      await expect(currentSummary).toBeVisible();
      await active
        .getByRole("button", {
          name: "完了条件を確認して「できた」へ",
          exact: true,
        })
        .click();
      await expect(current).toHaveAttribute("open", "");

      await active
        .getByRole("button", { name: "ここで詰まった", exact: true })
        .click();
      const problem = `「ゲームを表示」を押しましたが、${scenario.name}の画面が真っ白です。`;
      await page
        .getByLabel("困っていること・表示されたエラー", { exact: true })
        .fill(problem);
      const help = page.locator("#beginner-stuck-panel");
      await expect(help.locator("pre")).toContainText(problem);
      await expect(help.locator("pre")).toContainText("現在の作業:");
      await expect(help.locator("pre")).toContainText("相談先のAI:");
      await expect(help.locator("pre")).toContainText("完了条件:");
      await help
        .getByRole("button", { name: "相談文をコピー", exact: true })
        .click();
      expect(
        await page.evaluate(() => navigator.clipboard.readText()),
      ).toContain(problem);
      await expect(help.getByRole("status")).toContainText("コピーしました");
      await retainScreenshot(page, testInfo, `${scenario.id}-375-help`);
      await active
        .getByRole("button", { name: "ここで詰まった", exact: true })
        .click();

      // These completion actions simulate a user's acknowledgement; the fixture below
      // separately proves the code runner. They do not certify externally generated code.
      for (let count = 1; count <= 3; count++)
        await completeCurrentTask(page, count);
      const nextHeading = await page
        .locator("#beginner-action-title")
        .innerText();
      await page.reload();
      await expect(page.locator(".build-progress")).toContainText(
        /3 \/ \d+ 完了/,
      );
      await expect(page.locator("#beginner-action-title")).toHaveText(
        nextHeading,
      );
      await page
        .getByRole("button", { name: "メニューを開く", exact: true })
        .click();
      await page
        .getByRole("navigation", {
          name: "モバイルナビゲーション",
          exact: true,
        })
        .getByRole("link", { name: "目的からAIを探す", exact: true })
        .click();
      await expect(page).toHaveURL(/\/tools/);
      await page.goBack();
      await expect(page.locator(".build-progress")).toContainText(
        /3 \/ \d+ 完了/,
      );
      await expect(page.locator("#beginner-action-title")).toHaveText(
        nextHeading,
      );
      await page.goForward();
      await expect(page).toHaveURL(/\/tools/);
      await page.goBack();
      await expect(page.locator(".beginner-action")).toBeVisible();
      await retainScreenshot(page, testInfo, `${scenario.id}-375-after-three`);
    });
  }

  test("320px: HTML貼付・実行・保存・読込と隔離された操作を検証する", async ({
    page,
    context,
  }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 320, height: 740 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await beginFromHome(page, scenarios[0].idea);
    const editor = page.getByLabel("ゲームのコード", { exact: true });
    await editor.fill(runnerFixture);
    await page
      .getByRole("button", { name: "ゲームを表示", exact: true })
      .click();
    const frameElement = page.locator('iframe[title="作ったゲームの動作確認"]');
    await expect(frameElement).toHaveAttribute("sandbox", "allow-scripts");
    const game = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
    await expect(game.getByText("開始できます", { exact: true })).toBeVisible();
    await game.getByRole("button", { name: "ゴールへ進む" }).click();
    await expect(
      game.getByText("クリアしました", { exact: true }),
    ).toBeVisible();

    await completeCurrentTask(page, 1);
    const combined = page.locator(".beginner-action .action-prompt details");
    await combined
      .getByText("現在のコード＋変更指示を確認", { exact: true })
      .click();
    await expect(combined.locator("pre")).toContainText(runnerFixture);
    await combined
      .getByRole("button", { name: "現在のコード＋変更指示をコピー" })
      .click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "--- 現在動いているindex.html ---",
    );
    await retainScreenshot(page, testInfo, "combined-copy-320");
    await game.getByRole("button", { name: "やり直す" }).click();
    await expect(game.getByText("開始できます", { exact: true })).toBeVisible();

    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "index.htmlを保存", exact: true })
      .click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe("index.html");
    const downloadedPath = path.resolve(
      "test-results",
      "downloaded-index.html",
    );
    await mkdir(path.dirname(downloadedPath), { recursive: true });
    await download.saveAs(downloadedPath);
    await editor.fill("");
    await page
      .getByLabel("保存したゲームを開く", { exact: true })
      .setInputFiles(downloadedPath!);
    await expect(editor).toHaveValue(runnerFixture);
    await page
      .getByRole("button", { name: "ゲームを表示", exact: true })
      .click();
    await page.reload();
    await expect(editor).toHaveValue(runnerFixture);
    await page
      .getByRole("button", { name: "ゲームを表示", exact: true })
      .click();
    await game.getByRole("button", { name: "ゴールへ進む" }).click();
    await expect(
      game.getByText("クリアしました", { exact: true }),
    ).toBeVisible();

    const editorBox = await editor.boundingBox();
    expect(editorBox?.width).toBeGreaterThanOrEqual(200);
    for (const name of ["ゲームを表示", "index.htmlを保存"]) {
      const box = await page
        .getByRole("button", { name, exact: true })
        .boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    await retainScreenshot(page, testInfo, "runner-320");

    // Pinch scale is recorded honestly as a visual magnification check, not desktop
    // browser zoom or a substitute for human review of the rendered screenshot.
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Emulation.setPageScaleFactor", {
        pageScaleFactor: 2,
      });
      await expect
        .poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1))
        .toBeGreaterThanOrEqual(1.9);
      await retainScreenshot(page, testInfo, "runner-320-pinch-200-percent");
    } finally {
      await session.send("Emulation.setPageScaleFactor", {
        pageScaleFactor: 1,
      });
      await session.detach();
    }
  });
  test("QA_RUNTIME_0904: runtime error and rejection appear in Hub and flow into trouble help", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await beginFromHome(page, scenarios[1].idea);
    const editor = page.getByLabel("ゲームのコード", { exact: true });
    await editor.fill(
      `<!doctype html><html><body><button onclick="throw new Error('QA_RUNTIME_0904')">エラーを起こす</button><button onclick="Promise.reject(new Error('QA_REJECTION_0904'))">拒否を起こす</button></body></html>`,
    );
    await page
      .getByRole("button", { name: "ゲームを表示", exact: true })
      .click();
    const game = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
    await game.getByRole("button", { name: "エラーを起こす" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "ゲーム内でエラーが発生しました" }),
    ).toContainText("QA_RUNTIME_0904");
    await page
      .getByRole("button", { name: "ここで詰まった", exact: true })
      .click();
    await expect(page.locator("#beginner-stuck-panel pre")).toContainText(
      "QA_RUNTIME_0904",
    );
    await page
      .getByRole("button", { name: "ここで詰まった", exact: true })
      .click();
    await game.getByRole("button", { name: "拒否を起こす" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "ゲーム内でエラーが発生しました" }),
    ).toContainText("QA_REJECTION_0904");
    await expect(page.locator("iframe")).toHaveAttribute(
      "sandbox",
      "allow-scripts",
    );
    await retainScreenshot(page, testInfo, "runtime-error-375");
  });
});
