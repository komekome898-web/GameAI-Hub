import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

// This is a runner fixture, not an AI response or proof that an AI generated a game.
// Its only purpose is to exercise paste → play → save → reopen in the real UI.
const runnerFixture = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>動作確認用ゲーム</title><style>body{font:18px sans-serif;padding:16px}button{min-height:48px;padding:12px}p{overflow-wrap:anywhere}</style></head><body><main><h1>動作確認用ゲーム</h1><p id="result">開始できます</p><button onclick="document.getElementById('result').textContent='クリアしました'">ゴールへ進む</button><button onclick="document.getElementById('result').textContent='開始できます'">やり直す</button></main></body></html>`;

const scenarios = [
  {
    id: 'a',
    name: '移動してゴールする2Dゲーム',
    idea: 'ゲーム制作は初めてです。\nブラウザで遊べる簡単な2Dゲームを作りたいです。\nキャラクターを動かして、ゴールまで行けばクリアになるゲームにしたいです。',
    requiredPrompt: [/ゴール/, /移動/, /やり直/],
  },
  {
    id: 'b',
    name: 'モンスター1対1バトル',
    idea: 'ゲーム制作は初めてです。\nモンスターを集めて育てて戦うゲームを作りたいです。\nまずは1体対1体で戦えるところまで作りたいです。',
    requiredPrompt: [/モンスター/, /HP/, /勝敗/, /やり直/],
  },
  {
    id: 'c',
    name: '恋愛ノベルゲーム',
    idea: 'ゲーム制作は初めてです。\nブラウザで遊べる恋愛ノベルゲームを作りたいです。\n背景、キャラクター、会話を表示して次へ進むゲームにしたいです。',
    requiredPrompt: [/背景/, /登場人物|キャラクター/, /台詞|会話/, /次へ/],
  },
] as const;

async function beginFromHome(page: Page, idea: string) {
  await page.goto('/');
  await page.getByLabel('どんなゲームを作りたいですか？').fill(idea);
  await page.getByRole('button', { name: '制作ロードマップを作る', exact: true }).click();
  const starter = page.locator('.beginner-starter');
  await expect(starter).toBeVisible();
  await expect(starter).toContainText(/初めて|初心者/);
  await starter.getByRole('button', { name: 'この内容を確認して、最初のゲームを作る', exact: true }).click();
  await expect(page.locator('.beginner-action')).toBeVisible();
  await expect(page.locator('.build-progress')).toContainText(/0 \/ \d+ 完了/);
  await expect(page.getByLabel('ゲームのコード', { exact: true })).toBeVisible();
}

async function completeCurrentTask(page: Page, expectedCount: number) {
  const previousHeading = await page.locator('#beginner-action-title').innerText();
  await page.getByRole('button', { name: '完了条件を確認して「できた」へ', exact: true }).click();
  const current = page.locator('.action-step.is-current');
  await expect(current).toHaveAttribute('open', '');
  const criteria = current.locator('.done-criteria input');
  expect(await criteria.count()).toBeGreaterThan(0);
  await expect(current.locator('.completion-control input')).toBeDisabled();
  for (const criterion of await criteria.all()) await criterion.check();
  await current.locator('.completion-control input').check();
  await expect(page.locator('.build-progress')).toContainText(new RegExp(`${expectedCount} \\/ \\d+ 完了`));
  await expect(page.locator('#beginner-action-title')).not.toHaveText(previousHeading);
  await expect(page.locator('.artifact-progress')).toContainText('できた');
}

async function retainScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const directory = path.resolve('docs/screenshots');
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, `beginner-acceptance-${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach(name, { path: screenshot, contentType: 'image/png' });
}

test.describe('Beginner acceptance: current production journey contracts', () => {
  for (const scenario of scenarios) {
    test(`${scenario.id.toUpperCase()}: ${scenario.name}を新規状態から開始し3作業の進捗を保持する`, async ({ page, context }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 375, height: 812 });
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await beginFromHome(page, scenario.idea);

      const active = page.locator('.beginner-action');
      const prompt = active.locator('.action-prompt pre');
      for (const content of scenario.requiredPrompt) await expect(prompt).toContainText(content);
      await expect(prompt).toContainText('index.html');
      const launch = active.locator('.beginner-action-grid a[target="_blank"]').first();
      await expect(launch).toBeVisible();
      await expect(launch).toHaveAttribute('href', /^https:\/\//);
      await active.getByRole('button', { name: 'この指示をコピー', exact: true }).click();
      await expect(active.locator('.action-prompt [role="status"]')).toContainText('コピーしました');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await prompt.innerText());

      // An accidental collapse must remain recoverable using the visible primary action.
      const current = page.locator('.action-step.is-current');
      const currentSummary = current.locator(':scope > summary');
      await currentSummary.click();
      await expect(current).not.toHaveAttribute('open', '');
      await expect(currentSummary).toBeVisible();
      await active.getByRole('button', { name: '完了条件を確認して「できた」へ', exact: true }).click();
      await expect(current).toHaveAttribute('open', '');

      await active.getByRole('button', { name: 'ここで詰まった', exact: true }).click();
      const problem = `「ゲームを表示」を押しましたが、${scenario.name}の画面が真っ白です。`;
      await page.getByLabel('困っていること・表示されたエラー', { exact: true }).fill(problem);
      const help = page.locator('#beginner-stuck-panel');
      await expect(help.locator('pre')).toContainText(problem);
      await expect(help.locator('pre')).toContainText('現在の作業:');
      await expect(help.locator('pre')).toContainText('相談先のAI:');
      await expect(help.locator('pre')).toContainText('完了条件:');
      await help.getByRole('button', { name: '相談文をコピー', exact: true }).click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(problem);
      await expect(help.getByRole('status')).toContainText('コピーしました');
      await retainScreenshot(page, testInfo, `${scenario.id}-375-help`);
      await active.getByRole('button', { name: 'ここで詰まった', exact: true }).click();

      // These completion actions simulate a user's acknowledgement; the fixture below
      // separately proves the code runner. They do not certify externally generated code.
      for (let count = 1; count <= 3; count++) await completeCurrentTask(page, count);
      const nextHeading = await page.locator('#beginner-action-title').innerText();
      await page.reload();
      await expect(page.locator('.build-progress')).toContainText(/3 \/ \d+ 完了/);
      await expect(page.locator('#beginner-action-title')).toHaveText(nextHeading);
      await page.getByRole('button', { name: 'メニューを開く', exact: true }).click();
      await page.getByRole('navigation', { name: 'モバイルナビゲーション', exact: true }).getByRole('link', { name: '目的からAIを探す', exact: true }).click();
      await expect(page).toHaveURL(/\/tools/);
      await page.goBack();
      await expect(page.locator('.build-progress')).toContainText(/3 \/ \d+ 完了/);
      await expect(page.locator('#beginner-action-title')).toHaveText(nextHeading);
      await page.goForward();
      await expect(page).toHaveURL(/\/tools/);
      await page.goBack();
      await expect(page.locator('.beginner-action')).toBeVisible();
      await retainScreenshot(page, testInfo, `${scenario.id}-375-after-three`);
    });
  }

  test('320px: HTML貼付・実行・保存・読込と隔離された操作を検証する', async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 320, height: 740 });
    await beginFromHome(page, scenarios[0].idea);
    const editor = page.getByLabel('ゲームのコード', { exact: true });
    await editor.fill(runnerFixture);
    await page.getByRole('button', { name: 'ゲームを表示', exact: true }).click();
    const frameElement = page.locator('iframe[title="作ったゲームの動作確認"]');
    await expect(frameElement).toHaveAttribute('sandbox', 'allow-scripts');
    const game = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
    await expect(game.getByText('開始できます', { exact: true })).toBeVisible();
    await game.getByRole('button', { name: 'ゴールへ進む' }).click();
    await expect(game.getByText('クリアしました', { exact: true })).toBeVisible();
    await game.getByRole('button', { name: 'やり直す' }).click();
    await expect(game.getByText('開始できます', { exact: true })).toBeVisible();

    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'index.htmlを保存', exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe('index.html');
    const downloadedPath = path.resolve('test-results', 'downloaded-index.html');
    await mkdir(path.dirname(downloadedPath), { recursive: true });
    await download.saveAs(downloadedPath);
    await editor.fill('');
    await page.getByLabel('保存したゲームを開く', { exact: true }).setInputFiles(downloadedPath!);
    await expect(editor).toHaveValue(runnerFixture);
    await page.getByRole('button', { name: 'ゲームを表示', exact: true }).click();
    await page.reload();
    await expect(editor).toHaveValue(runnerFixture);
    await page.getByRole('button', { name: 'ゲームを表示', exact: true }).click();
    await game.getByRole('button', { name: 'ゴールへ進む' }).click();
    await expect(game.getByText('クリアしました', { exact: true })).toBeVisible();

    const editorBox = await editor.boundingBox();
    expect(editorBox?.width).toBeGreaterThanOrEqual(200);
    for (const name of ['ゲームを表示', 'index.htmlを保存']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await retainScreenshot(page, testInfo, 'runner-320');

    // Pinch scale is recorded honestly as a visual magnification check, not desktop
    // browser zoom or a substitute for human review of the rendered screenshot.
    const session = await page.context().newCDPSession(page);
    try {
      await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
      await expect.poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThanOrEqual(1.9);
      await retainScreenshot(page, testInfo, 'runner-320-pinch-200-percent');
    } finally {
      await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
      await session.detach();
    }
  });
});
