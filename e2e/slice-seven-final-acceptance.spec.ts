import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from './fixtures';
import { acceptanceViewports, installAcceptanceNetworkGuard } from './acceptance/fixtures';
import { diagnoseWidths } from './acceptance/diagnostics';
import { evidenceManifestVersion, type EvidenceRecord } from './acceptance/manifest';

const routes = [
  { id: 'home', path: '/' },
  { id: 'project', path: '/project/' },
  { id: 'articles', path: '/articles/' },
  { id: 'article-long', path: '/articles/ai-browser-game-how-to/' },
  { id: 'article-affiliate', path: '/articles/elevenlabs-game-development-guide/' },
  { id: 'tools', path: '/tools/' },
  { id: 'guides', path: '/guides/' },
  { id: 'tool-detail', path: '/tools/github-copilot/' },
  { id: 'guide-detail', path: '/guides/codex-game-development-brief/' },
  { id: 'compare-four', path: '/compare/?ids=github-copilot,cursor,scenario,elevenlabs' },
  { id: 'privacy', path: '/privacy/' },
  { id: 'methodology', path: '/methodology/' },
  { id: 'affiliate-disclosure', path: '/affiliate-disclosure/' },
] as const;

test('Slice 7 cross-route matrix has contained, structured, durable rendered evidence', async ({ page, context }) => {
  test.setTimeout(900_000);
  const collectors = await installAcceptanceNetworkGuard(context);
  const evidenceDir = path.join('docs', 'screenshots', 'issue-137-slice7');
  await mkdir(evidenceDir, { recursive: true });
  const records: EvidenceRecord[] = [];

  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.locator('main')).toHaveAttribute('id', 'main-content');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toHaveText('');
      const widths = await diagnoseWidths(page);
      expect(widths.documentScrollWidth, `${route.path} document width at ${viewport.width}px`).toBeLessThanOrEqual(widths.viewportWidth);
      expect(widths.unownedOverflowingElements, `${route.path} unowned overflow at ${viewport.width}px`).toEqual([]);

      const screenshot = `${route.id}-${viewport.id}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), fullPage: true });
      records.push({
        id: `${route.id}-${viewport.id}`,
        route: route.path,
        viewport,
        zoom: { mode: 'none', factor: 1 },
        emulation: { viewport: true, physicalDevice: false },
        state: ['cross-route-final', 'browser-emulated', 'ga4-collector-blocked'],
        screenshot,
        diagnostics: {
          documentOverflowPx: widths.documentOverflowPx,
          ownedLocalScrollers: widths.ownedLocalScrollers.length,
          unownedOverflowingElements: widths.unownedOverflowingElements.length,
        },
        provenance: {
          capturedAt: new Date().toISOString(),
          runner: 'Playwright Chromium viewport emulation',
          note: 'Responsive evidence only; not physical-device evidence.',
        },
      });
    }
  }

  expect(collectors).toEqual([]);
  await writeFile(path.join(evidenceDir, 'manifest.json'), `${JSON.stringify({
    schema: evidenceManifestVersion,
    target: {
      sha: process.env.EVIDENCE_SHA ?? '0000000',
      environment: 'local',
      baseUrl: 'http://127.0.0.1:3100',
    },
    records,
  }, null, 2)}\n`);
});

test('shared chrome keyboard, focus return, targets and reduced motion remain consistent', async ({ page, context }) => {
  const collectors = await installAcceptanceNetworkGuard(context);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: 'メニューを開く' });
  await menuButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'サイトメニュー' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menuButton).toBeFocused();

  const undersized = await page.locator('button:visible, input:visible, textarea:visible, select:visible, summary:visible, a.button:visible').evaluateAll((nodes) => nodes
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return { tag: node.tagName, text: node.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
    })
    .filter(({ width, height }) => width < 44 || height < 44));
  expect(undersized).toEqual([]);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = await page.locator('body').evaluate(() => {
    const probe = document.createElement('button');
    probe.textContent = 'motion probe';
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const value = { transition: style.transitionDuration, animation: style.animationDuration };
    probe.remove();
    return value;
  });
  expect(['0.01ms', '1e-05s']).toContain(motion.transition);
  expect(['0.01ms', '1e-05s']).toContain(motion.animation);
  expect(collectors).toEqual([]);
});

test('Compare destructive changes restore focus and preserve mobile meaning', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/compare/?ids=github-copilot,cursor,scenario,elevenlabs');
  await expect(page.getByText(/選択上限です/)).toBeVisible();
  await page.locator('.compare-picker-panel > summary').click();
  await page.getByRole('button', { name: 'すべて解除' }).click();
  await expect(page.locator('.compare-picker-panel > summary')).toBeFocused();
  await expect(page.getByRole('heading', { name: '比較する候補を選ぶ' })).toBeVisible();
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
});

test('forms, breadcrumbs, owned scrollers and anchor offsets keep their semantics', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/project/');
  const idea = page.locator('#project-idea-project');
  await expect(idea).toBeVisible();
  expect(await idea.getAttribute('placeholder')).not.toBe(await idea.getAttribute('aria-label'));
  await page.goto('/articles/ai-browser-game-how-to/#step-3');
  await expect(page.getByRole('navigation', { name: 'パンくず' })).toBeVisible();
  const anchored = page.locator('#step-3');
  if (await anchored.count()) {
    await anchored.scrollIntoViewIfNeeded();
    expect(await anchored.evaluate((node) => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(55);
  }
  const scrollers = page.locator('[data-acceptance-scroll-owner="true"]');
  for (let index = 0; index < await scrollers.count(); index += 1) {
    const scroller = scrollers.nth(index);
    await expect(scroller).toHaveAttribute('tabindex', '0');
    await expect(scroller).toHaveAttribute('aria-label', /.+/);
  }
});
