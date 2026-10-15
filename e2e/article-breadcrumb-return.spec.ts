import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect } from './fixtures';

for (const width of [1165, 375, 320]) {
  test(`article breadcrumb preserves selection and visible return at ${width}px`, async ({ page, context }) => {
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/privacy/?gameai_analytics=off');
    await page.goto('/articles/?hubCategory=start&hubArticle=ai-browser-game-how-to#start');
    const selected = page.locator('[data-deck-id="ai-browser-game-how-to"] .v2-start-card-face');
    await expect(selected).toBeFocused();
    if (width > 340) await expect(page.locator('.creation-deck ol')).toHaveAttribute('data-motion', 'idle');
    await selected.locator('strong').click();
    await page.getByRole('navigation', { name: 'パンくず' }).getByRole('link', { name: '記事', exact: true }).click();
    await expect(page).toHaveURL(/hubArticle=ai-browser-game-how-to.*#start$/);
    await expect(selected).toBeFocused();
    const geometry = () => page.evaluate(() => ({
      headingTop: document.getElementById('start-title')!.getBoundingClientRect().top,
      headerBottom: document.querySelector('.site-header')!.getBoundingClientRect().bottom,
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    if (width > 340) await expect.poll(async () => {
      const bounds = await geometry();
      return bounds.headingTop >= bounds.headerBottom;
    }).toBe(true);
    await expect(selected.locator('strong')).toBeInViewport();
    const bounds = await geometry();
    expect(bounds.scroll).toBe(bounds.client);
    const output = 'docs/screenshots/tool-article-project-entry';
    await mkdir(output, { recursive: true });
    await page.screenshot({ path: `${output}/breadcrumb-return-${width}.png` });
    await writeFile(`${output}/breadcrumb-return-${width}.json`, JSON.stringify({ width, physicalDevice: false, route: page.url(), ...bounds }, null, 2) + '\n');
  });
}
