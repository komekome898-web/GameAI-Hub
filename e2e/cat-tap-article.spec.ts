import { test, expect } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';

for (const width of [375, 320]) {
  test(`cat-tap complete beginner journey at ${width}px`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/articles/');
    await page.locator('[data-category="start"] strong').click();
    const list = page.getByRole('button', { name: '一覧で見る', exact: true });
    if (await list.isVisible()) await list.click();
    await page.getByRole('link', { name: /ChatGPTで猫タップゲームを作る/ }).locator('strong').click();
    const editor = page.getByRole('textbox', { name: 'ゲームのコード' });
    const original = await editor.inputValue();
    const game = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
    const render = async () => {
      await page.getByRole('button', { name: 'ゲームを表示', exact: true }).click();
      await expect(game.getByText('スコア: 0', { exact: true })).toBeVisible();
      await page.locator('iframe').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      const bounds = await game.locator('main').evaluate(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, height: innerHeight, scroll: document.documentElement.scrollHeight }));
      expect(bounds.top).toBeGreaterThanOrEqual(0);
      expect(bounds.bottom).toBeLessThanOrEqual(bounds.height);
      expect(bounds.scroll).toBeLessThanOrEqual(bounds.height);
    };
    const play = async () => {
      const cat = game.getByRole('button', { name: '猫をタップしてスコアを増やす' });
      for (const score of [1, 2]) {
        await cat.click();
        await expect(game.getByText(`スコア: ${score}`, { exact: true })).toBeVisible();
      }
      await game.getByRole('button', { name: 'リセット', exact: true }).click();
      await expect(game.getByText('スコア: 0', { exact: true })).toBeVisible();
      await cat.click();
      await expect(game.getByText('スコア: 1', { exact: true })).toBeVisible();
    };
    await render();
    await play();
    await page.getByRole('button', { name: 'この版は動いたと記録' }).click();
    await editor.fill(original.replace('background: #ffd166;', 'background: #bde0fe;'));
    await render();
    await expect(game.locator('#cat')).toHaveCSS('background-color', 'rgb(189, 224, 254)');
    await play();
    await mkdir('docs/screenshots/issue-58-cat-tap', { recursive: true });
    await page.locator('.beginner-game-preview').screenshot({ path: `docs/screenshots/issue-58-cat-tap/color-${width}.png` });
    await editor.fill(original.replace('score += 1;', 'throw new Error("猫テスト復旧");'));
    await render();
    await game.getByRole('button', { name: '猫をタップしてスコアを増やす' }).click();
    await expect(page.locator('.beginner-runtime-error')).toContainText('猫テスト復旧');
    await page.getByRole('button', { name: '動いた版へ戻す', exact: true }).click();
    await expect(editor).toHaveValue(original);
    await render();
    await play();
    for (const name of ['猫タップゲームのpromptをコピー', '不具合をAIへ返す型をコピー', 'Project用の猫タップゲーム案をコピー']) {
      await page.getByRole('button', { name, exact: true }).click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain('猫');
      expect(copied).toContain('リセット');
      expect(copied).toMatch(/タップ.*クリック/);
      if (name.includes('不具合')) expect(copied).toContain('HTML全文');
    }
    const idea = await page.evaluate(() => navigator.clipboard.readText());
    const metrics = await page.evaluate(() => ({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, code: [...document.querySelectorAll('pre.article-code')].map(el => ({ client: el.clientWidth, scroll: el.scrollWidth })) }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
    const dir = 'docs/screenshots/issue-58-cat-tap';
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/final-${width}.png`, fullPage: true });
    for (const [name, region] of [['header', page.locator('.article-header')], ['game', page.locator('.beginner-game-preview')], ['recovery', page.locator('section').filter({ has: page.getByRole('heading', { name: /4. 動かないとき/ }) })], ['handoff', page.locator('.article-inline-handoff')]] as const) {
      await region.screenshot({ path: `${dir}/${name}-${width}.png` });
    }
    await writeFile(`${dir}/metrics-${width}.json`, JSON.stringify(metrics, null, 2));
    await page.getByRole('link', { name: '同じ猫タップゲームの次の制作手順を作る' }).click();
    await expect(page).toHaveURL(/\/project\/?\?source=chatgpt-cat-tap-game$/);
    await page.getByRole('textbox').first().fill(idea);
    await expect(page.getByRole('textbox').first()).toHaveValue(idea);
    await page.getByRole('button', { name: '制作ロードマップを作る', exact: true }).click();
    await expect(page.getByRole('heading', { name: '読み取った条件を確認してください' })).toBeVisible();
    await expect(page.locator('main')).toContainText('猫');
    await expect(page.locator('main')).toContainText('タップ');
    const details = await page.locator('.project-detail-card textarea').evaluateAll(elements => elements.map(el => (el as HTMLTextAreaElement).value));
    expect(details).toContain('猫');
    expect(details).toContain('猫をタップ/クリック → 得点を1増やす');
    expect(details.join(' ')).not.toMatch(/移動|ゴール|収集|戦闘/);
    await page.screenshot({ path: `${dir}/project-${width}.png`, fullPage: true });
  });
}
