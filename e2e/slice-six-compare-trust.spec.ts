import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from './fixtures';
import { acceptanceViewports, installAcceptanceNetworkGuard } from './acceptance/fixtures';
import { diagnoseWidths } from './acceptance/diagnostics';
import { evidenceManifestVersion, type EvidenceRecord } from './acceptance/manifest';

const compareStates = [
  { id: 'compare-empty', path: '/compare/', ready: '比較する候補を選ぶ' },
  { id: 'compare-one', path: '/compare/?ids=github-copilot', ready: '1件を比較' },
  { id: 'compare-two', path: '/compare/?ids=github-copilot,cursor', ready: '2件を比較' },
  { id: 'compare-four', path: '/compare/?ids=github-copilot,cursor,scenario,elevenlabs', ready: '4件を比較' },
  { id: 'compare-differences', path: '/compare/?ids=github-copilot,cursor&diff=1', ready: '2件を比較' },
  { id: 'compare-project-context', path: '/compare/?ids=github-copilot,cursor&goal=code&stage=code', ready: '2件を比較' },
] as const;
const trustRoutes = [
  { id: 'privacy', path: '/privacy/', ready: 'プライバシーポリシー' },
  { id: 'methodology', path: '/methodology/', ready: '調査・評価方法' },
  { id: 'affiliate-disclosure', path: '/affiliate-disclosure/', ready: '広告・アフィリエイト開示' },
] as const;

test('Slice 6 Compare states and trust routes have zero mobile document overflow', async ({ page, context }) => {
  test.setTimeout(600_000);
  const collectors = await installAcceptanceNetworkGuard(context);
  const evidenceDir = path.join('docs', 'screenshots', 'issue-137-slice6');
  await mkdir(evidenceDir, { recursive: true });
  const records: EvidenceRecord[] = [];
  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    for (const state of [...compareStates, ...trustRoutes]) {
      await page.goto(state.path);
      await expect(page.getByRole('heading', { name: state.ready, exact: true }).first()).toBeVisible();
      const widths = await diagnoseWidths(page);
      expect(widths.documentOverflowPx, `${state.path} at ${viewport.width}px`).toBe(0);
      expect(widths.unownedOverflowingElements, `${state.path} unowned overflow`).toEqual([]);
      const screenshot = `${state.id}-${viewport.id}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), fullPage: true });
      records.push({ id: `${state.id}-${viewport.id}`, route: state.path, viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: [state.id, 'browser-emulated', 'ga4-collector-blocked'], screenshot, diagnostics: { documentOverflowPx: widths.documentOverflowPx, ownedLocalScrollers: widths.ownedLocalScrollers.length, unownedOverflowingElements: widths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });
    }
    await page.goto('/compare/?ids=github-copilot');
    await page.locator('.compare-picker-panel').evaluate((node: HTMLDetailsElement) => { node.open = true; });
    await page.getByRole('searchbox', { name: '候補を検索' }).fill('ExtraordinarilyLongUnbrokenCandidateToken_12345678901234567890');
    await expect(page.getByText('該当する候補がありません')).toBeVisible();
    const stressWidths = await diagnoseWidths(page);
    expect(stressWidths.documentOverflowPx).toBe(0);
    const stressScreenshot = `compare-search-stress-${viewport.id}.png`;
    await page.screenshot({ path: path.join(evidenceDir, stressScreenshot), fullPage: true });
    records.push({ id: `compare-search-stress-${viewport.id}`, route: '/compare/?ids=github-copilot', viewport, zoom: { mode: 'none', factor: 1 }, emulation: { viewport: true, physicalDevice: false }, state: ['picker-open', 'long-unbroken-search', 'no-results'], screenshot: stressScreenshot, diagnostics: { documentOverflowPx: stressWidths.documentOverflowPx, ownedLocalScrollers: stressWidths.ownedLocalScrollers.length, unownedOverflowingElements: stressWidths.unownedOverflowingElements.length }, provenance: { capturedAt: new Date().toISOString(), runner: 'Playwright Chromium viewport emulation', note: 'Responsive evidence only; not physical-device evidence.' } });
  }
  expect(collectors).toEqual([]);
  await writeFile(path.join(evidenceDir, 'manifest.json'), `${JSON.stringify({ schema: evidenceManifestVersion, target: { sha: process.env.EVIDENCE_SHA ?? '0000000', environment: 'local', baseUrl: 'http://127.0.0.1:3100' }, records }, null, 2)}\n`);
});

test('picker search, limit, focus, history, evidence and mobile criteria remain usable', async ({ page, context }) => {
  const collectors = await installAcceptanceNetworkGuard(context);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/compare/?ids=github-copilot,cursor');
  const picker = page.locator('.compare-picker-panel');
  await picker.locator('summary').click();
  const search = page.getByRole('searchbox', { name: '候補を検索' });
  await search.fill('ExtraordinarilyLongUnbrokenCandidateToken_12345678901234567890');
  await expect(page.getByText('該当する候補がありません')).toBeVisible();
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  await search.fill('Meshy');
  await page.getByRole('checkbox', { name: 'Meshy' }).focus();
  await page.getByRole('checkbox', { name: 'Meshy' }).check();
  await expect(page.getByRole('checkbox', { name: 'Meshy' })).toBeFocused();
  await expect(page).toHaveURL(/meshy/);
  await expect(search).toHaveValue('Meshy');
  await page.getByRole('button', { name: 'Meshyを比較から解除' }).first().click();
  await expect(picker.locator('summary')).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '3件を比較' })).toBeVisible();
  await expect(page.getByRole('region', { name: '選択したツールの比較結果' })).toBeVisible();
  await expect(page.getByRole('region', { name: '選択したツールの比較結果' }).getByText('契約前の公式確認').first()).toBeVisible();
  expect(collectors).toEqual([]);
});

test('four-candidate limit and trust controls remain explicit', async ({ page }) => {
  await page.goto('/compare/?ids=github-copilot,cursor,scenario,elevenlabs');
  await expect(page.getByText(/選択上限です/)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Meshy' })).toBeDisabled();
  await page.goto('/privacy/');
  await expect(page.getByRole('button', { name: 'このブラウザを計測から除外' })).toBeVisible();
  expect(await page.locator('.trust-nav a').first().evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await page.goto('/affiliate-disclosure/');
  await expect(page.getByText('rel="sponsored nofollow noopener"')).toBeVisible();
});
