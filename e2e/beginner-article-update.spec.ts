import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getArticle } from '../data/articles';

const evidence = process.env.BEGINNER_ARTICLE_EVIDENCE || 'test-results/beginner-article-update';
const slugs = ['ai-browser-game-how-to', 'github-beginner-game-development'] as const;

for (const slug of slugs) {
  test(`${slug}: metadata, reading surfaces and responsive text`, async ({ page }) => {
    test.setTimeout(90_000);
    await mkdir(evidence, { recursive: true });
    const article = getArticle(slug)!;
    for (const view of [
      { name: 'desktop', width: 1440, height: 1000, textScale: 1 },
      { name: '375', width: 375, height: 812, textScale: 1 },
      { name: '320', width: 320, height: 740, textScale: 1 },
      { name: '320-root-font-200', width: 320, height: 740, textScale: 2 },
    ]) {
      await page.setViewportSize(view);
      await page.goto(`/articles/${slug}/`);
      if (view.textScale === 2) await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      await expect(page.locator('h1')).toHaveText(article.title);
      await expect(page).toHaveTitle(`${article.title} | GameBuildiary`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', article.description);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', `${article.title} | GameBuildiary`);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', article.description);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://game-ai-hub.vercel.app/articles/${slug}/`);
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(jsonLd.join('\n')).toContain(article.title);
      expect(jsonLd.join('\n')).toContain(article.description);
      await expect(page.locator('.breadcrumbs')).toContainText(article.title);
      await expect(page.locator('body')).not.toContainText('Application error');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.screenshot({ path: path.join(evidence, `${slug}-${view.name}-header.png`) });
      const headings = slug === 'ai-browser-game-how-to'
        ? ['3. 最初のゲームをAIへ生成してもらう']
        : ['5. 最初のrepositoryを作る', '7. index.htmlをWeb画面から追加する'];
      for (const [index, heading] of headings.entries()) {
        const section = page.getByRole('heading', { name: heading, exact: true }).locator('..');
        for (const [part, target] of [['start', section.locator('h2').first()], ['end', section.locator('p').last()]] as const) {
          await target.scrollIntoViewIfNeeded();
          await page.evaluate(() => window.scrollBy(0, -80));
          await page.screenshot({ path: path.join(evidence, `${slug}-${view.name}-section-${index}-${part}.png`) });
        }
      }
    }
    await page.goto('/articles/#start');
    await expect(page.getByRole('link', { name: article.title, exact: true })).toBeVisible();
  });
}

test('article workspace: download last displayed A then redisplayed B and explicitly run loaded file', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/articles/ai-browser-game-how-to/');
  const editor = page.getByLabel('ゲームのコード', { exact: true });
  const show = page.getByRole('button', { name: 'ゲームを表示', exact: true });
  const save = page.getByRole('button', { name: 'index.htmlを保存', exact: true });
  const initial = await editor.inputValue();
  const a = '<!doctype html><html><body><h1>保存A</h1></body></html>';
  const b = '<!doctype html><html><body><h1>保存B</h1></body></html>';
  await editor.fill(a);
  await show.click();
  await page.getByRole('button', { name: 'この版は動いたと記録', exact: true }).click();
  await editor.fill(b);
  const downloadA = page.waitForEvent('download');
  await save.click();
  const aDownload = await downloadA;
  expect(await readFile((await aDownload.path())!, 'utf8')).toBe(a);
  await show.click();
  const downloadB = page.waitForEvent('download');
  await save.click();
  const bDownload = await downloadB;
  expect(await readFile((await bDownload.path())!, 'utf8')).toBe(b);
  await page.getByRole('button', { name: '動いた版へ戻す', exact: true }).click();
  await expect(editor).toHaveValue(a);
  await page.getByRole('button', { name: '掲載完成例へ戻す', exact: true }).click();
  await expect(editor).toHaveValue(initial);
  await page.getByLabel('保存したゲームを開く', { exact: true }).setInputFiles({ name: 'index.html', mimeType: 'text/html', buffer: await readFile((await bDownload.path())!) });
  await expect(editor).toHaveValue(b);
  await expect(page.frameLocator('iframe[title="作ったゲームの動作確認"]').getByRole('heading')).toHaveText('保存A');
  await show.click();
  await expect(page.frameLocator('iframe[title="作ったゲームの動作確認"]').getByRole('heading')).toHaveText('保存B');
});
