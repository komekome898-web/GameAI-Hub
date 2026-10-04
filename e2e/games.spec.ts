import { test, expect } from './fixtures';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
const evidence = 'docs/screenshots/play-games';
test.beforeEach(async ({context}) => { await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()); });
for (const width of [320,375,1440]) test(`game category, title image, detail and context return at ${width}`, async ({page}) => {
  await mkdir(evidence,{recursive:true}); await page.setViewportSize({width,height:900});
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  if (width > 340) await page.getByRole('button',{name:'一覧で見る',exact:true}).click();
  await page.locator('[data-category="games"] strong').click();
  await expect(page).toHaveURL(/hubEntry=home.*#games$/);
  await expect(page.locator('#games [data-deck-id]')).toHaveCount(1);
  await expect(page.locator('#games .creation-deck')).toHaveAttribute('data-mode','list');
  await expect(page.locator('#games')).toContainText('1作品');
  await expect(page.locator('#games')).not.toContainText('本の記事');
  const image = page.locator('#games img');
  await expect(image).toHaveAttribute('src','/images/games/aramon/title-screen.png');
  const imageMetrics = await image.evaluate((image: HTMLImageElement) => ({naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,width:image.getBoundingClientRect().width,height:image.getBoundingClientRect().height}));
  expect(imageMetrics.naturalWidth).toBe(667); expect(imageMetrics.naturalHeight).toBe(375);
  expect(imageMetrics.width/imageMetrics.height).toBeCloseTo(667/375,2);
  await expect(page.locator('.game-card-actions a')).toHaveAttribute('href','https://komekome898-web.github.io/aramon/index.html');
  await expect(page.locator('.game-card-actions a')).toHaveAttribute('target','_blank');
  await page.evaluate(() => { (window as Window & {playEvents?: unknown[]}).playEvents=[]; window.addEventListener('gameai:event',event => (window as Window & {playEvents?: unknown[]}).playEvents!.push((event as CustomEvent).detail)); });
  await page.locator('.game-card-actions a').click();
  expect(await page.evaluate(() => (window as Window & {playEvents?: unknown[]}).playEvents)).toEqual([{name:'outbound_click',properties:{page:'/games/aramon/',placement:'card'}}]);
  await page.locator('#games').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${evidence}/card-${width}.png`,fullPage:true});
  await page.locator('[data-deck-id="aramon"] strong').click();
  await expect(page).toHaveURL(/\/games\/aramon\/$/);
  await expect(page.locator('h1')).toHaveText('荒野モン動');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://game-ai-hub.vercel.app/games/aramon/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/\/images\/games\/aramon\/title-screen.png$/);
  await expect(page.getByRole('link',{name:/遊ぶ/})).toHaveCount(2);
  await expect(page.getByRole('link',{name:'荒野モン動の制作体験を読む →'})).toHaveAttribute('href','/articles/aramon-production-story/');
  await expect(page.locator('article')).toContainText('未確認');
  await page.screenshot({path:`${evidence}/detail-${width}.png`,fullPage:true});
  await page.screenshot({path:`${evidence}/detail-first-${width}.png`});
  await page.goBack();
  await expect(page.locator('[data-deck-id="aramon"] .v2-start-card-face')).toBeFocused();
  await page.goForward(); await page.reload();
  await page.getByRole('navigation',{name:'パンくず'}).getByRole('link',{name:'作品一覧へ戻る'}).click();
  await expect(page).toHaveURL(/hubArticle=aramon.*#games$/);
  await expect(page.locator('[data-deck-id="aramon"] .v2-start-card-face')).toBeFocused();
  await page.getByRole('link',{name:'← カテゴリへ戻る'}).click();
  await expect(page).toHaveURL(/\/\?hubCategory=games#categories$/);
  await expect(page.locator('[data-category="games"]')).toBeFocused();
  await page.goto('/articles/#all');
  await expect(page.locator('#all [data-deck-id]')).toHaveCount(17);
  await expect(page.locator('#all [data-deck-id="aramon"]')).toHaveCount(0);
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/operations-${width}.json`,JSON.stringify({method:'Chromium viewport reflow, not physical device',width,imageMetrics,errors,flow:'Home → games → detail → browser Back/Forward → reload → list return → Home category; article counts'},null,2));
});
test('320 synthetic root text 200% and direct entry retain readable details and return', async ({page}) => {
  await page.setViewportSize({width:320,height:900}); await page.goto('/games/aramon/');
  await page.evaluate(() => document.documentElement.style.fontSize='200%');
  await expect(page.getByRole('link',{name:/遊ぶ/}).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/detail-root200-320.png`,fullPage:true});
  await page.getByRole('navigation',{name:'パンくず'}).getByRole('link',{name:'作品一覧へ戻る'}).click();
  await expect(page).toHaveURL(/#games$/);
});
test('no-JS Home category and game detail links remain usable; unknown slug is 404', async ({browser,page}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const nojs = await context.newPage(); await nojs.goto('/'); await nojs.locator('[data-category="games"] strong').click();
  await nojs.locator('#games [data-deck-id="aramon"] strong').click();
  await expect(nojs.locator('h1')).toHaveText('荒野モン動');
  await expect(nojs.getByRole('link',{name:/遊ぶ/})).toHaveCount(2); await context.close();
  expect((await page.goto('/games/unpublished-game/'))?.status()).toBe(404);
});
test('disposable zero, two and future three-work cards reuse fallback, ring, list and keyboard', async ({page}) => {
  const result = await build({entryPoints:['e2e/fixtures/game-deck.tsx'],bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'fixture-link',setup(builder){
    builder.onResolve({filter:/^next\/link$/},()=>({path:'next/link',namespace:'fixture'}));
    builder.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'import React from "react";export default function Link(props){return React.createElement("a",props)}',loader:'js',resolveDir:process.cwd()}));
  }}]});
  const css = (await Promise.all(['app/globals.css','app/visual-layer-v2.css'].map(path=>readFile(path,'utf8')))).join('\n');
  await page.route('**/__games_fixture?*',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body class="visual-layer-v2"><main class="articles-v2-route"><section id="games" class="article-cluster"></section></main><script>${result.outputFiles[0].text}</script></body></html>`}));
  await page.setViewportSize({width:375,height:900});
  for (const count of [0,2,3]) {
    await page.goto(`/__games_fixture?count=${count}`);
    await expect(page.locator('[data-deck-id]')).toHaveCount(count);
    await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode',count < 3 ? 'list':'deck');
    if (!count) await expect(page.locator('#games')).toContainText('表示できる作品はありません');
    if (count===3) {
      await page.getByRole('button',{name:'次の作品',exact:true}).press('ArrowRight');
      await expect(page.locator('ol')).toHaveAttribute('data-motion','idle');
      await expect(page.locator('[data-distance="0"]')).toHaveAttribute('data-deck-id','test-game-1');
      await page.screenshot({path:`${evidence}/fixture-3-ring-375.png`});
      await page.getByRole('button',{name:'次の作品',exact:true}).focus();
      await page.setViewportSize({width:320,height:900});
      await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode','list');
      await expect(page.locator('[data-deck-id="test-game-1"] .v2-start-card-face')).toBeFocused();
      await page.setViewportSize({width:375,height:900});
      await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode','deck');
      await page.getByRole('button',{name:'次の作品',exact:true}).focus();
      await page.emulateMedia({reducedMotion:'reduce'});
      await expect(page.locator('[data-deck-id="test-game-1"] .v2-start-card-face')).toBeFocused();
      await page.emulateMedia({reducedMotion:'no-preference'});
      await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode','deck');
      await page.getByRole('button',{name:'一覧で見る',exact:true}).click();
      await expect(page.locator('.game-card-actions a')).toHaveCount(3);
      await page.reload(); await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode','list');
    }
    await page.screenshot({path:`${evidence}/fixture-${count}-375.png`,fullPage:true});
  }
});

test('Home and article hub retain one shared deck chunk within the existing JS budget', async ({page}) => {
  const records = [];
  for (const route of ['/', '/articles/']) {
    await page.goto(route); await expect(page.locator('.creation-deck')).toHaveCount(1);
    const measured = await page.evaluate(async () => {
      const urls = performance.getEntriesByType('resource').map(entry => entry.name).filter(url => /\.js$/.test(url));
      const chunks = await Promise.all(urls.map(async url => {
        const text = await fetch(url).then(response => response.text());
        const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
        return {path:new URL(url).pathname, isDeck:text.includes('creation-deck-count'), gzipBytes:(await new Response(stream).arrayBuffer()).byteLength};
      }));
      return chunks.filter(chunk => chunk.isDeck);
    });
    expect(measured).toHaveLength(1); expect(measured[0].gzipBytes).toBeLessThanOrEqual(8192);
    records.push({route, ...measured[0]});
  }
  expect(records[0].path).toBe(records[1].path);
  await writeFile(`${evidence}/shared-chunk-budget.json`,JSON.stringify(records,null,2));
});
