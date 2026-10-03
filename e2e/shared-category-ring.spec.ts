import { test, expect, type Page } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';

const evidence = 'docs/screenshots/shared-category-ring';
const deck = (page: Page) => page.locator('.creation-deck');
const current = (page: Page) => deck(page).locator('li[data-distance="0"]');
const idle = async (page: Page) => {
  await expect(deck(page)).toHaveCount(1);
  await expect(deck(page).locator('ol')).toHaveAttribute('data-motion', 'idle');
};
test.beforeEach(async ({ context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
});

for (const entry of ['/', '/articles/#categories']) for (const width of [320, 390]) {
  test(`list category browser Back restores selected voice from ${entry} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(entry); await idle(page);
    await page.locator('[data-category="start"]').focus();
    await expect(page).toHaveURL(/hubCategory=start/);
    if (width > 340) await page.getByRole('button', { name: '一覧で見る', exact: true }).click();
    else await page.setViewportSize({ width, height: 844 });
    await expect(deck(page)).toHaveAttribute('data-mode', 'list');
    const historyBefore = await page.evaluate(() => history.length);
    // Clicking a list item does not commit the ring's selected ID first.
    await page.locator('[data-category="voice"] strong').click();
    await expect(page).toHaveURL(/#voice$/); await idle(page);
    expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
    await page.goBack(); await idle(page);
    await expect(page).toHaveURL(/hubCategory=voice.*#categories$/);
    await expect(deck(page)).toHaveAttribute('data-mode', 'list');
    await expect(page.locator('[data-category="voice"]')).toBeFocused();
    const returnedUrl = page.url();
    await page.reload(); await idle(page);
    await expect(page.locator('[data-category="voice"]')).toBeFocused();
    await expect(deck(page)).toHaveAttribute('data-mode', 'list');
    if (width > 340) {
      await page.getByRole('button', { name: '円環で見る', exact: true }).click(); await idle(page);
      await expect(current(page)).toHaveAttribute('data-deck-id', 'voice');
    }
    const dir = `${evidence}/review-fix`;
    await mkdir(dir, { recursive: true });
    const label = `${entry === '/' ? 'home' : 'articles'}-${width}`;
    await page.screenshot({ path: `${dir}/${label}.png` });
    await writeFile(`${dir}/${label}.json`, JSON.stringify({ width, entry, method: 'Chromium viewport emulation', flow: 'start → list/fallback → voice → browser Back → reload → ring when supported', returnedUrl, historyBefore, focus: await page.locator(':focus').getAttribute('data-category') }, null, 2));
  });
}

for (const width of [320,375,390,1440]) test(`Home order and complete return context at ${width}`, async ({ page }) => {
  await mkdir(evidence, { recursive:true });
  await page.setViewportSize({ width, height:width === 1440 ? 900 : 844 });
  await page.goto('/');
  await expect(deck(page)).toHaveAttribute('data-mode', width <= 340 ? 'list' : 'deck'); await idle(page);
  const positions = await page.evaluate(() => ['.home-brand-intro','.home-category-entry','.home-execution-hero'].map(selector => document.querySelector(selector)!.getBoundingClientRect().top + scrollY));
  expect(positions[0]).toBeLessThan(positions[1]); expect(positions[1]).toBeLessThan(positions[2]);
  expect((await deck(page).boundingBox())!.y).toBeLessThan(page.viewportSize()!.height);
  if (width > 340) expect((await current(page).locator('.v2-start-card-read').boundingBox())!.y).toBeLessThan(page.viewportSize()!.height);
  await page.screenshot({path:`${evidence}/home-first-${width}.png`});
  const historyBefore = await page.evaluate(() => history.length);
  await page.locator('[data-category="voice"]').focus(); await idle(page);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);
  await page.locator('[data-category="voice"]').locator("strong").click();
  await expect(page).toHaveURL(/hubEntry=home.*#voice$/); await idle(page);
  if (width > 340) { await page.getByRole('button',{name:'次の記事',exact:true}).click(); await idle(page); }
  else await page.locator('[data-deck-id="elevenlabs-v4-game-voice"] a').focus();
  await page.locator('[data-deck-id="elevenlabs-v4-game-voice"] strong').click();
  await expect(page).toHaveURL(/elevenlabs-v4-game-voice\/$/);
  await page.reload();
  await page.getByRole('navigation',{name:'パンくず'}).getByRole('link',{name:'記事',exact:true}).click();
  await expect(page).toHaveURL(/hubArticle=elevenlabs-v4-game-voice.*#voice$/); await idle(page);
  await expect(page.locator('[data-deck-id="elevenlabs-v4-game-voice"] a')).toBeFocused();
  await page.getByRole('link',{name:'← カテゴリへ戻る'}).click();
  await expect(page).toHaveURL(/\/\?hubCategory=voice#categories$/); await idle(page);
  await expect(page.locator('[data-category="voice"]')).toBeFocused();
  if (width > 340) await expect(current(page)).toHaveAttribute('data-deck-id','voice');
  await page.screenshot({path:`${evidence}/home-return-${width}.png`});
  await expect(page.locator('.hub-preparation a, .hub-preparation button')).toHaveCount(0);
  await expect(page.locator('.hub-preparation')).toContainText('準備中 · 0件');
  await writeFile(`${evidence}/home-operations-${width}.json`,JSON.stringify({width,method:'Chromium viewport emulation, not physical Safari',positions,historyBefore,returnUrl:page.url(),flow:'Home voice → v4 body → reload → article breadcrumb → original Home voice',focus:await page.locator(':focus').getAttribute('data-category')},null,2));
});

test('entry preferences and focus ownership remain separate across mounts', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/'); await idle(page);
  await page.getByRole('button',{name:'一覧で見る',exact:true}).click();
  await page.goto('/articles/#categories'); await idle(page);
  await expect(deck(page)).toHaveAttribute('data-mode','deck');
  await page.locator('[data-category="voice"]').focus(); await page.locator('[data-category="voice"]').locator("strong").click(); await idle(page);
  await expect(deck(page)).toHaveAttribute('data-mode','deck');
  await page.getByRole('button',{name:'一覧で見る',exact:true}).click();
  await page.getByRole('link',{name:'← カテゴリへ戻る'}).click(); await idle(page);
  await expect(deck(page)).toHaveAttribute('data-mode','deck');
  await page.goto('/'); await idle(page);
  await expect(deck(page)).toHaveAttribute('data-mode','list');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/articles/#categories'); await expect(deck(page)).toHaveAttribute('data-mode','list');
  await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'active'});
  await expect(deck(page)).toHaveAttribute('data-mode','list');
});

test('category tiny flick, inertia, recontact and navigation history use shared motion', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/'); await idle(page);
  const count = await page.evaluate(() => history.length);
  const drag = async (dx:number, steps:number, pause=0) => {
    const box = (await current(page).locator('strong').boundingBox())!;
    const x=box.x+box.width/2,y=box.y+box.height/2;
    await page.mouse.move(x,y); await page.mouse.down();
    await page.mouse.move(x+dx,y,{steps}); if(pause) await page.waitForTimeout(pause); await page.mouse.up();
  };
  await drag(-30,2); await idle(page);
  await expect(page).toHaveURL(/hubCategory=/);
  await drag(-180,2);
  const stage=deck(page).locator('ol');
  await expect(stage).toHaveAttribute('data-motion',/inertia|snapping|idle/);
  // Recontact during free travel, reverse, and release. No navigation may occur.
  const box=(await deck(page).boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+100); await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+90,box.y+100,{steps:3}); await page.mouse.up(); await idle(page);
  expect(new URL(page.url()).pathname).toBe('/');
  expect(await page.evaluate(() => history.length)).toBe(count);
  await page.getByRole('button',{name:'次のカテゴリ',exact:true}).click({clickCount:4,delay:20});
  await page.goto('/articles/#categories'); await idle(page);
  await page.locator('[data-category="voice"]').focus(); await page.locator('[data-category="voice"]').locator("strong").click(); await idle(page);
  await page.getByRole('button',{name:'次の記事',exact:true}).click(); await page.goBack(); await idle(page);
  await expect(page.locator('[data-category="voice"]')).toBeFocused();
});

for (const width of [320,375]) test(`category enlarged Japanese remains usable at ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900}); await page.goto('/');
  await page.evaluate(() => document.documentElement.style.fontSize='200%');
  await expect(deck(page)).toHaveAttribute('data-mode','list');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/home-root200-${width}.png`,fullPage:true});
});

test('Home no-JS category links reach actual articles, unsafe context is ignored', async ({browser,page}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});
  const nojs=await context.newPage(); await nojs.goto('/');
  await nojs.locator('[data-category="voice"]').locator('strong').click();
  await expect(nojs.locator('#voice li a')).toHaveCount(3); await context.close();
  await page.goto('/articles/?hubEntry=https://evil.example&return=https://evil.example#voice'); await idle(page);
  await expect(page.getByRole('link',{name:'← カテゴリへ戻る'})).toHaveAttribute('href','#categories');
});


test('Home example fragment remains native and Project input survives', async ({page}) => {
  await page.goto('/');
  await page.locator('.home-example-link').click();
  await expect(page).toHaveURL(/#home-example$/);
  await expect(page.locator('#home-example')).toBeInViewport();
  await page.locator('.home-execution-hero textarea').fill('ブラウザでタップして猫を育てるゲーム');
  await page.locator('.home-execution-hero button[type=submit]').click();
  await expect(page).toHaveURL(/project/);
  await expect(page.locator('body')).toContainText('猫');
});
