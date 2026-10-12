import { test, expect, type Page } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { getPublishedGames } from '../data/games';

const dir='docs/screenshots/b3-home';
const idle=async(page:Page)=>{await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','deck');await expect(page.locator('.b3-game-stage')).toHaveAttribute('data-motion','idle');};
test.beforeEach(async({context})=>{await mkdir(dir,{recursive:true});await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());});
for(const width of [1440,375,320]) test(`B3 game-first frame, actions and header at ${width}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:width===1440?900:667});
 await page.goto('/privacy/?gameai_analytics=off');
 expect(await page.evaluate(()=>localStorage.getItem('gameai:analytics-excluded'))).toBe('1');
 await page.goto('/');await idle(page);
 expect(await page.evaluate(()=>document.activeElement?.closest('#categories') !== null)).toBe(false);
 await expect(page.locator('.b3-game-selection h2')).toHaveText('モンスターコンストラクション');
 await expect(page.locator('.b3-game-selection')).toContainText('スマホのみで制作');
 const metrics=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,play:document.querySelector('.b3-game-selection [data-game-play]')!.getBoundingClientRect().toJSON(),headerTargets:Array.from(document.querySelectorAll('.site-header .brand,.site-header .header-cta,.site-header .menu-button,.site-header .main-nav a')).filter(e=>e.getBoundingClientRect().width>0).map(e=>({label:e.textContent,height:e.getBoundingClientRect().height})),image:Array.from(document.querySelectorAll('.b3-game-stage img')).map(img=>({src:img.getAttribute('src'),fit:getComputedStyle(img).objectFit,filter:getComputedStyle(img).filter,opacity:getComputedStyle(img).opacity}))}));
 expect(metrics.document).toBe(metrics.viewport);expect(metrics.play.bottom).toBeLessThanOrEqual(width===1440?900:667);expect(metrics.headerTargets.every(t=>t.height>=44)).toBe(true);
 expect(metrics.image.every(i=>i.fit==='contain'&&i.filter==='none'&&i.opacity==='1')).toBe(true);
 await page.screenshot({path:`${dir}/home-${width}.png`});await page.screenshot({path:`${dir}/home-${width}-full.png`,fullPage:true});
 await page.locator('.b3-game-stage').focus();await page.keyboard.press('ArrowRight');await idle(page);
 const selected=await page.locator('.b3-game-stage [data-distance="0"]').getAttribute('data-deck-id');
 await expect(page).toHaveURL(new RegExp(`homeGame=${selected}`));
 await page.locator('.b3-game-selection .b3-game-detail').click();await expect(page).toHaveURL(new RegExp(`/games/${selected}/$`));
 await page.getByRole('navigation',{name:'パンくず'}).getByRole('link',{name:'作品一覧へ戻る'}).click();await idle(page);
 await expect(page).toHaveURL(new RegExp(`homeGame=${selected}(?:&[^#]*)?#games$`));await expect(page.locator('.b3-game-selection h2 a')).toBeFocused();
 await page.locator('.b3-game-selection .b3-game-detail').click();await expect(page).toHaveURL(new RegExp(`/games/${selected}/$`));await page.goBack();await idle(page);await expect(page.locator('.b3-game-selection h2 a')).toBeFocused();
 await page.getByRole('button',{name:'作品一覧',exact:true}).click();await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','list');
 await expect(page.locator('.b3-static-copy:visible')).toHaveCount(8);await page.locator('.b3-showcase').screenshot({path:`${dir}/list-${width}.png`});
 await page.locator('.b3-game-stage [data-deck-id="tomoshibi"] .b3-game-detail').click();await expect(page).toHaveURL(/\/games\/tomoshibi\/$/);
 await page.getByRole('navigation',{name:'パンくず'}).getByRole('link',{name:'作品一覧へ戻る'}).click();await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','list');
 await expect(page.locator('.b3-game-stage [data-deck-id="tomoshibi"] .b3-game-detail')).toBeFocused();
 await page.locator('.b3-game-stage [data-deck-id="tomoshibi"] .b3-game-detail').click();await expect(page).toHaveURL(/\/games\/tomoshibi\/$/);await page.goBack();await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','list');
 await expect(page.locator('.b3-game-stage [data-deck-id="tomoshibi"] .b3-game-detail')).toBeFocused();
 expect(errors).toEqual([]);await writeFile(`${dir}/checks-${width}.json`,JSON.stringify({method:'Chromium viewport reflow; not physical device',metrics,selected,errors},null,2));
});
test('all artwork, rapid input, touch, reduced motion and article/learning links',async({page})=>{
 await page.setViewportSize({width:375,height:667});await page.goto('/?homeGame=aramon#games');await idle(page);
 await expect(page.locator('.b3-game-selection h2')).toHaveText('荒野モン動');
 await expect(page.locator('.b3-production-link')).toHaveAttribute('href','/articles/aramon-production-story/');
 const records=[];
 for(const game of getPublishedGames()){
  await page.goto(`/?homeGame=${game.slug}#games`);await idle(page);
  await expect(page.locator('.b3-game-selection h2')).toHaveText(game.title);
  const card=page.locator(`.b3-game-stage [data-deck-id="${game.slug}"]`);
  await expect(card.locator('img')).toHaveAttribute('src',game.image.src);await expect(card.locator('.b3-art-credit')).toContainText(game.image.credit);
  await expect(page.locator('.b3-game-selection [data-game-play]')).toHaveAttribute('href',game.playUrl);
  await expect(page.locator('.b3-game-selection')).toContainText(game.description);
  const dimensions=await card.locator('img').evaluate((img:HTMLImageElement)=>({width:img.naturalWidth,height:img.naturalHeight}));expect(dimensions).toEqual({width:game.image.width,height:game.image.height});records.push({slug:game.slug,...dimensions});
  await page.screenshot({path:`${dir}/work-${game.slug}-375.png`});
 }
 await page.locator('.b3-game-stage').focus();await page.keyboard.press('Home');await idle(page);
 await page.locator('.b3-game-stage [data-selected=true] .b3-art-link').focus();await page.keyboard.press('ArrowRight');await idle(page);
 await expect(page.locator('.b3-game-stage')).toBeFocused();
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/games\/aramon\/$/);await page.goBack();await idle(page);
 await page.locator('.b3-game-stage').focus();await page.keyboard.press('Home');await idle(page);
 for(let i=0;i<12;i++)await page.getByRole('button',{name:'次の掲載作品'}).dispatchEvent('click');await idle(page);
 await expect(page.locator('.b3-game-stage')).toHaveAttribute('data-motion-raf','0');
 const before=await page.locator('.b3-game-selection h2').textContent();
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 for(const [type,x,y] of [['touchStart',260,340],['touchMove',210,340],['touchMove',150,340],['touchEnd',150,340]] as const){await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});await page.waitForTimeout(35);}await idle(page);
 expect(await page.locator('.b3-game-selection h2').textContent()).not.toBe(before);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.b3-game-stage').focus();await page.keyboard.press('Home');await idle(page);await page.keyboard.press('End');await idle(page);
 await expect(page.locator('.b3-game-stage')).toHaveAttribute('data-motion-raf','0');
 await page.locator('.b3-showcase').screenshot({path:`${dir}/reduced-375.png`});
 await expect(page.getByRole('link',{name:'初めてのゲーム制作 →'})).toHaveAttribute('href','/articles/ai-browser-game-how-to/');
 await writeFile(`${dir}/works.json`,JSON.stringify({method:'Chromium; CDP touch is emulation',records},null,2));
});
test('320 text 150/200, spacing and long text retain natural list/focus',async({page})=>{
 await page.setViewportSize({width:320,height:667});await page.goto('/');await idle(page);
 for(const scale of [1.5,2]){
  await page.evaluate(s=>document.documentElement.style.fontSize=`${s*100}%`,scale);await page.waitForTimeout(150);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${dir}/root${scale*100}-320.png`,fullPage:true});
 }
 await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','list');
 const play=page.locator('.b3-static-copy [data-game-play]').first();
 const playLines=await play.evaluate(el=>{
  const text=Array.from(el.childNodes).find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent?.includes('遊ぶ'))!;
  const range=document.createRange();range.selectNodeContents(text);return range.getClientRects().length;
 });
 expect(playLines).toBe(1);
 const actions=await page.locator('.b3-static-copy .b3-game-actions').first().evaluate(el=>Array.from(el.children).map(link=>({width:link.getBoundingClientRect().width,height:link.getBoundingClientRect().height,text:link.textContent})));
 expect(actions.every(action=>action.width>=100&&action.height>=44)).toBe(true);
 await page.locator('.b3-static-copy .b3-game-detail').first().focus();await expect(page.locator('.b3-static-copy .b3-game-detail').first()).toBeFocused();
 await page.locator('.b3-showcase').screenshot({path:`${dir}/root200-focus-320.png`});
 await page.evaluate(()=>{document.documentElement.style.fontSize='100%';const title=document.querySelector('.b3-game-selection h2');if(title)title.textContent='初心者がスマホから最初のプレイ可能なゲームを作るために、AIと確認を繰り返した作品';});
 await page.addStyleTag({content:'.home-b3 p {line-height:1.5!important;margin-bottom:2em!important}.home-b3 {letter-spacing:.12em!important;word-spacing:.16em!important}'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${dir}/spacing-long-320.png`,fullPage:true});
});
test('no-JS complete game links and current category entry remain usable',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:667}});const page=await context.newPage();await page.goto('/');
 await expect(page.locator('.b3-static-copy')).toHaveCount(8);await expect(page.locator('[data-category="games"]')).toBeVisible();
 await page.locator('.b3-static-copy .b3-game-detail').first().click();await expect(page).toHaveURL(/\/games\/monster-construction\/$/);await context.close();
});
test('fresh category deep-link restores a visible focused target',async({page})=>{
 await page.setViewportSize({width:375,height:667});await page.goto('/?hubCategory=voice#categories');
 const category=page.locator('[data-category="voice"]');await expect(category).toBeFocused();
 const box=(await category.boundingBox())!;
 const header=(await page.locator('.site-header').boundingBox())!;
 expect(box.y).toBeGreaterThanOrEqual(header.y+header.height);expect(box.y+box.height).toBeLessThanOrEqual(667);
 await page.screenshot({path:`${dir}/fresh-category-return-375.png`});
});
test('explicit category activation after playable anchor retains Back context',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await idle(page);
 await page.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('link',{name:'ゲームで遊ぶ'}).click();
 const voice=page.locator('[data-category="voice"]');await voice.focus();await voice.locator('strong').click();
 await expect(page).toHaveURL(/\/articles\/.*#voice$/);
 await page.goBack();await expect(page).toHaveURL(/hubCategory=voice.*#categories$/);await expect(voice).toBeFocused();
 const box=(await voice.boundingBox())!;const header=(await page.locator('.site-header').boundingBox())!;
 expect(box.y).toBeGreaterThanOrEqual(header.y+header.height);expect(box.y+box.height).toBeLessThanOrEqual(900);
 await page.screenshot({path:`${dir}/game-anchor-category-back-1440.png`});
});
test('enlarged Home anchors clear the measured header and clean up on route change',async({page})=>{
 await page.setViewportSize({width:320,height:667});await page.goto('/');await idle(page);
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode','list');
 await page.getByRole('link',{name:'アイデアから始める ↓'}).click();
 const headerBottom=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom);
 await expect.poll(()=>page.locator('#home-idea-title').evaluate(el=>el.getBoundingClientRect().top),{timeout:5000}).toBeGreaterThanOrEqual(headerBottom);
 await page.getByRole('button',{name:'メニューを開く'}).click();await page.getByRole('navigation',{name:'モバイルナビゲーション'}).getByRole('link',{name:'ゲームで遊ぶ'}).click();
 await expect(page).toHaveURL(/#games$/);
 await expect.poll(()=>page.locator('#home-title').evaluate(el=>el.getBoundingClientRect().top),{timeout:5000}).toBeGreaterThanOrEqual(headerBottom);
 expect(await page.locator('#home-title').evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(667);
 await page.screenshot({path:`${dir}/anchor-root200-320.png`});
 await page.getByRole('link',{name:'制作課題から探す →'}).click();await expect(page).toHaveURL(/\/tools\/$/);
 expect(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--header-height'))).toBe('');
});
