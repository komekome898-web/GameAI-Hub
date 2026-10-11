import { test, expect } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { gameIntroductions } from '../data/game-introductions';
const evidence='docs/screenshots/game-owner-corrections';
test.beforeEach(async ({context}) => {
  await mkdir(evidence,{recursive:true});
  await context.route('**/*', r => new URL(r.request().url()).hostname==='127.0.0.1' ? r.continue() : r.abort());
});
for (const width of [1280,375,320]) test(`seven introductions and original screenshots at ${width}`,async ({page}) => {
  await page.setViewportSize({width,height:900});
  const results=[];
  for (const game of gameIntroductions) {
    const response=await page.goto(`/games/${game.slug}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(game.title);
    await expect(page.locator('article header')).toContainText('プレイ無料、インストールなし');
    await expect(page.locator('article')).toContainText('無料・課金なし');
    await expect(page.getByRole('heading',{name:'スマホだけで開発',exact:true})).toBeVisible();
    await expect(page.locator('article')).toContainText('スマートフォン実機で動作確認済み');
    await expect(page.locator('article')).not.toContainText('スマートフォン実機の操作と全編プレイは未確認');
    const img=page.locator('.game-hero img');
    await expect(img).toBeVisible();
    const metrics=await img.evaluate((img: HTMLImageElement)=>({width:img.naturalWidth,height:img.naturalHeight,fit:getComputedStyle(img).objectFit}));
    expect(metrics).toEqual({width:game.image.width,height:game.image.height,fit:'contain'});
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://game-ai-hub.vercel.app/games/${game.slug}/`);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content',String(game.image.width));
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content',String(game.image.height));
    await expect(page.getByRole('link',{name:/遊ぶ/})).toHaveCount(2);
    const viewport=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(viewport.scroll).toBeLessThanOrEqual(viewport.client);
    results.push({slug:game.slug,...metrics,...viewport});
    await page.screenshot({path:`${evidence}/${game.slug}-${width}.png`,fullPage:true});
  }
  await writeFile(`${evidence}/checks-${width}.json`,JSON.stringify(results,null,2));
});
test('all eight cards preserve original assets, introduction links and sitemap',async ({page})=>{
  await page.setViewportSize({width:375,height:900});await page.goto('/articles/#games');
  await page.locator('#games').scrollIntoViewIfNeeded();
  const list=page.locator('#games');
  await expect(list.locator('[data-deck-id]')).toHaveCount(8);
  for (const game of gameIntroductions) {
    const card=list.locator(`[data-deck-id="${game.slug}"]`);
    await expect(card.locator('.v2-start-card-face')).toHaveAttribute('href',`/games/${game.slug}/`);
    await expect(card.locator('img')).toHaveAttribute('src',game.image.src);
    expect(await card.locator('img').evaluate(el=>getComputedStyle(el).objectFit)).toBe('contain');
    await expect(card.locator('.game-card-actions a')).toHaveAttribute('href',game.playUrl);
    await expect(card.locator('.game-card-actions p')).toHaveText('開発環境：iPhone\n動作環境：Webブラウザ');
  }
  await page.screenshot({path:`${evidence}/cards-375.png`,fullPage:true});
  for (const game of gameIntroductions) {
    await list.getByRole('button',{name:'次の作品',exact:true}).click();
    await expect(list.locator('[data-distance="0"]')).toHaveAttribute('data-deck-id',game.slug);
    await expect(list.locator('ol')).toHaveAttribute('data-motion','idle');
    await list.screenshot({path:`${evidence}/card-${game.slug}-375.png`});
  }
  await list.getByRole('button',{name:'一覧で見る',exact:true}).click();
  await list.screenshot({path:`${evidence}/cards-list-375.png`});
  const response=await page.request.get('/sitemap.xml');expect(response.status()).toBe(200);const xml=await response.text();
  for (const game of gameIntroductions) expect(xml).toContain(`/games/${game.slug}/`);
});
test('all seven at 320px with 200% CSS zoom',async ({page})=>{
  await page.setViewportSize({width:320,height:900});
  for (const game of gameIntroductions) {
    await page.goto(`/games/${game.slug}/`);
    await page.locator('html').evaluate(el=>{el.style.zoom='2';});
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({path:`${evidence}/${game.slug}-320-zoom200.png`,fullPage:true});
  }
});

test('Aramon keeps its environment and receives the free no-install statement', async ({page}) => {
  await page.setViewportSize({width:375,height:900});
  await page.goto('/games/aramon/');
  await expect(page.locator('article header')).toContainText('プレイ無料、インストールなし');
  await expect(page.locator('article')).toContainText('無料・課金なし');
  await expect(page.getByRole('heading',{name:'スマホだけで開発',exact:true})).toHaveCount(0);
  await expect(page.locator('article')).toContainText('作者のプレイ環境：iPhone SE（第3世代）・Safari');
  await page.screenshot({path:`${evidence}/aramon-375.png`,fullPage:true});
});
