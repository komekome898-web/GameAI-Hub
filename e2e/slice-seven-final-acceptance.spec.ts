import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
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

const testedSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (process.env.EVIDENCE_SHA && process.env.EVIDENCE_SHA !== testedSha)
  throw new Error(`EVIDENCE_SHA must match tested HEAD (${testedSha})`);

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

    // Re-exercise the highest-risk non-default states instead of relying on a
    // normal-route width check as a proxy for long-content containment.
    await page.goto('/compare/?ids=github-copilot,cursor&diff=1');
    await expect(page.getByRole('checkbox', { name: '差分のみ表示' })).toBeChecked();
    const compareDiffWidths = await diagnoseWidths(page);
    expect(compareDiffWidths.documentOverflowPx).toBe(0);
    const compareDiffScreenshot = `compare-differences-${viewport.id}.png`;
    await page.screenshot({ path: path.join(evidenceDir, compareDiffScreenshot), fullPage: true });
    records.push({ id: `compare-differences-${viewport.id}`, route: '/compare/?ids=github-copilot,cursor&diff=1', viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: ['differences-only', 'selected', 'browser-emulated'], screenshot: compareDiffScreenshot, diagnostics: { documentOverflowPx: 0, ownedLocalScrollers: compareDiffWidths.ownedLocalScrollers.length, unownedOverflowingElements: compareDiffWidths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });

    await page.locator('.compare-picker-panel > summary').click();
    await page.getByRole('searchbox', { name: '候補を検索' }).fill(`LongUnbrokenCandidateToken_${'x'.repeat(96)}`);
    await expect(page.getByText('該当する候補がありません')).toBeVisible();
    const compareSearchWidths = await diagnoseWidths(page);
    expect(compareSearchWidths.documentOverflowPx).toBe(0);
    const compareSearchScreenshot = `compare-search-stress-${viewport.id}.png`;
    await page.screenshot({ path: path.join(evidenceDir, compareSearchScreenshot), fullPage: true });
    records.push({ id: `compare-search-stress-${viewport.id}`, route: '/compare/?ids=github-copilot,cursor&diff=1', viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: ['picker-open', 'long-unbroken-token', 'empty-result'], screenshot: compareSearchScreenshot, diagnostics: { documentOverflowPx: 0, ownedLocalScrollers: compareSearchWidths.ownedLocalScrollers.length, unownedOverflowingElements: compareSearchWidths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });

    await page.goto('/articles/meshy-pricing-credits-game/');
    const tableRegion = page.getByRole('region', { name: '比較表（横にスクロールできます）' }).first();
    await expect(tableRegion).toHaveAttribute('tabindex', '0');
    await expect(tableRegion.locator('th')).not.toHaveCount(0);
    await tableRegion.locator('td').first().evaluate((cell) => {
      const stress = document.createElement('code');
      stress.dataset.acceptanceStress = 'long-url';
      stress.style.whiteSpace = 'nowrap';
      stress.textContent = `https://example.invalid/${'unbroken-token-'.repeat(36)}`;
      cell.append(stress);
    });
    const articleWidths = await diagnoseWidths(page);
    expect(articleWidths.documentOverflowPx).toBe(0);
    expect(articleWidths.ownedLocalScrollers.length).toBeGreaterThan(0);
    const articleTableScreenshot = `article-table-${viewport.id}.png`;
    await page.screenshot({ path: path.join(evidenceDir, articleTableScreenshot), fullPage: true });
    records.push({ id: `article-table-${viewport.id}`, route: '/articles/meshy-pricing-credits-game/', viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: ['semantic-table', 'owned-local-scroller', 'long-content'], screenshot: articleTableScreenshot, diagnostics: { documentOverflowPx: 0, ownedLocalScrollers: articleWidths.ownedLocalScrollers.length, unownedOverflowingElements: articleWidths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });

    await page.goto('/tools/');
    await page.getByLabel('ツールを検索').fill(`長い日本語ラベル${'長'.repeat(48)}${'Token'.repeat(20)}`);
    await expect(page.getByText('条件に合う候補がありません')).toBeVisible();
    const toolsStressWidths = await diagnoseWidths(page);
    expect(toolsStressWidths.documentOverflowPx).toBe(0);
    const toolsStressScreenshot = `tools-long-label-empty-${viewport.id}.png`;
    await page.screenshot({ path: path.join(evidenceDir, toolsStressScreenshot), fullPage: true });
    records.push({ id: `tools-long-label-empty-${viewport.id}`, route: '/tools/', viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: ['long-japanese-label', 'long-unbroken-token', 'empty-result'], screenshot: toolsStressScreenshot, diagnostics: { documentOverflowPx: 0, ownedLocalScrollers: toolsStressWidths.ownedLocalScrollers.length, unownedOverflowingElements: toolsStressWidths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });
  }

  expect(collectors).toEqual([]);
  await writeFile(path.join(evidenceDir, 'manifest.json'), `${JSON.stringify({
    schema: evidenceManifestVersion,
    target: {
      sha: testedSha,
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

  for (const route of ['/project/', '/tools/', '/compare/?ids=github-copilot,cursor', '/privacy/']) {
    await page.goto(route);
    const control = page.locator('button:visible, input:visible, textarea:visible, select:visible, summary:visible, a.button:visible').first();
    await control.focus();
    await expect(control).toBeFocused();
    const focusBox = await control.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return { top: rect.top, left: rect.left, right: rect.right, outline: style.outlineStyle, width: innerWidth };
    });
    expect(focusBox.outline).not.toBe('none');
    expect(focusBox.left).toBeGreaterThanOrEqual(0);
    expect(focusBox.right).toBeLessThanOrEqual(focusBox.width);
  }

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
  await expect(page.locator('label[for="project-idea-project"]')).toBeVisible();
  const describedBy = (await idea.getAttribute('aria-describedby'))?.split(/\s+/) ?? [];
  expect(describedBy).toContain('idea-help-project');
  await expect(page.locator('#idea-help-project')).toBeVisible();
  await page.goto('/articles/ai-browser-game-how-to/');
  await expect(page.getByRole('navigation', { name: 'パンくず' })).toBeVisible();
  const toc = page.getByRole('navigation', { name: 'この記事の目次' });
  await toc.locator('summary').click();
  const tocLink = toc.locator('a').first();
  const anchorHref = await tocLink.getAttribute('href');
  expect(anchorHref).toMatch(/^#section-/);
  await tocLink.click();
  const anchored = page.locator(anchorHref!);
  await expect(anchored).toHaveCount(1);
  await anchored.scrollIntoViewIfNeeded();
  expect(await anchored.evaluate((node) => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(55);

  await page.goto('/articles/meshy-pricing-credits-game/');
  const scroller = page.getByRole('region', { name: '比較表（横にスクロールできます）' }).first();
  await expect(scroller).toHaveAttribute('tabindex', '0');
  await expect(scroller.locator('table')).toHaveCount(1);
  await expect(scroller.locator('th')).not.toHaveCount(0);
});
