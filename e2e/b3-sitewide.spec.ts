import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { expect, test } from './fixtures';
import { diagnoseWidths } from './acceptance/diagnostics';
import { cleanSourceIdentity } from './acceptance/source-identity';
import { publishedArticles } from '../data/articles';
import { getPublishedGames } from '../data/games';
import { guides } from '../data/guides';
import { stackTemplates } from '../data/stack-templates';
import { getServices } from '../lib/services';

const fixed=['/','/articles/','/tools/','/guides/','/stacks/','/project/','/builder/','/compare/','/methodology/','/privacy/','/affiliate-disclosure/'];
const routes=[...fixed,...publishedArticles.map(x=>`/articles/${x.slug}/`),...getPublishedGames().map(x=>`/games/${x.slug}/`),...getServices().map(x=>`/tools/${x.slug}/`),...guides.map(x=>`/guides/${x.slug}/`),...stackTemplates.map(x=>`/stacks/${x.slug}/`)];
const samples=[['home','/'],['articles','/articles/'],['article','/articles/meshy-pricing-credits-game/'],['game','/games/aramon/'],['tools','/tools/'],['tool','/tools/meshy/'],['compare','/compare/?ids=meshy,tripo-ai&goal=3d&stage=3d'],['guides','/guides/'],['guide','/guides/ai-2d-rpg-workflow/'],['stacks','/stacks/'],['stack','/stacks/2d-rpg/'],['project','/project/'],['builder','/builder/'],['privacy','/privacy/'],['404','/games/missing-b3-sample/']] as const;
const output='docs/screenshots/b3-sitewide';

for (const width of [1440,375,320]) {
 test(`B3 shell covers all 76 public UI URLs at ${width}`,async({page})=>{
  test.setTimeout(600_000); expect(new Set(routes).size).toBe(76);
  await page.setViewportSize({width,height:width===1440?900:667});
  for(const route of routes) {
   const response=await page.goto(route);expect(response?.status(),route).toBe(200);
   await expect(page.locator('main h1').first()).toBeVisible();
   await expect(page.locator('.site-header')).toHaveClass(/b3-site-header/);
   await expect(page.locator('.site-header .b3-mark-page')).toHaveCount(1);
   const actual=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().height);
   await expect.poll(()=>page.evaluate(()=>parseFloat(document.documentElement.style.getPropertyValue('--header-height')))).toBe(actual);
   const widths=await diagnoseWidths(page);
   expect(widths.documentOverflowPx,route).toBe(0);expect(widths.unownedOverflowingElements,route).toEqual([]);
   expect(await page.locator('main').evaluate(el=>getComputedStyle(el).color),route).toBe(route==='/'?'rgb(241, 240, 231)':'rgb(35, 53, 41)');
   await expect(page.locator('.site-footer a[href="/tools/"]')).toHaveCount(1);
  }
 });
}

test('B3 representative material, typography and synthetic root200 evidence',async({page})=>{
 test.setTimeout(240_000);const source=cleanSourceIdentity();await mkdir(output,{recursive:true});const records=[];
 for(const width of [1440,375,320]) {
  await page.setViewportSize({width,height:width===1440?900:667});
  for(const [name,route] of samples) {
   await page.goto(route);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('main h1').first()).toBeVisible();
   if(name==='articles' && width===375) {
    const deck=page.locator('#categories .creation-deck');
    await expect(deck).toHaveAttribute('data-mode','deck');
    await expect(deck.locator('ol')).toHaveAttribute('data-motion','idle');
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    const read=deck.locator('li[data-distance="0"] .v2-start-card-read');
    await expect(read).toContainText('記事を見る');
    const rect=await read.boundingBox();expect(rect).not.toBeNull();
    expect(rect!.y).toBeGreaterThan(0);expect(rect!.y+rect!.height).toBeLessThanOrEqual(667);
   }
   const widths=await diagnoseWidths(page);expect(widths.documentOverflowPx,route).toBe(0);expect(widths.unownedOverflowingElements,route).toEqual([]);
   const roles=await page.evaluate(()=>['main h1','main p','.site-header .brand-copy strong','main .button','main label','main input','main textarea'].map(selector=>{const el=document.querySelector(selector);if(!el)return null;const s=getComputedStyle(el);return {selector,size:s.fontSize,line:s.lineHeight,color:s.color,background:s.backgroundColor};}).filter(Boolean));
   const screenshot=`${name}-${width}.png`;await page.screenshot({path:`${output}/${screenshot}`});records.push({route,width,method:'viewport-reflow',roles,screenshot,widths});
  }
 }
 await page.setViewportSize({width:375,height:667});
 for(const [name,route] of samples.filter(([name])=>['article','compare','project','privacy'].includes(name))) {
  await page.goto(route);const baseline=await page.locator('main p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  const achieved=await page.locator('main p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const widths=await diagnoseWidths(page);expect(widths.documentOverflowPx,route).toBe(0);expect(widths.unownedOverflowingElements,route).toEqual([]);
  const screenshot=`${name}-375-root200.png`;await page.screenshot({path:`${output}/${screenshot}`});records.push({route,width:375,method:'synthetic-root-text',baseline,achieved,factor:achieved/baseline,screenshot,widths});
 }
 await writeFile(`${output}/manifest.json`,JSON.stringify({source,base:'f9333c076c70afbb71399215336a671bb06d5289',environment:'local Chromium',physicalDevice:false,records},null,2)+'\n');
});

test('shared navigation keeps current area, destinations, focus and measured anchors',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 for(const [route,label] of [['/games/aramon/','ゲームで遊ぶ'],['/guides/','作り方を知る'],['/compare/?ids=meshy,tripo','AIを選ぶ'],['/stacks/2d-rpg/','AIを選ぶ']]) {
  await page.goto(route);const nav=page.getByRole('navigation',{name:'メインナビゲーション'});
  await expect(nav.getByRole('link',{name:label})).toHaveAttribute('aria-current','page');
  await expect(nav.getByRole('link',{name:'ゲームで遊ぶ'})).toHaveAttribute('href','/#games');
 }
 await page.goto('/builder/');await expect(page.locator('.header-cta')).toHaveAttribute('aria-current','page');
 await page.setViewportSize({width:320,height:667});await page.goto('/privacy/');await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 await page.getByRole('button',{name:'メニューを開く'}).click();await expect(page.locator('main')).toHaveAttribute('inert','');
 const games=page.getByRole('navigation',{name:'モバイルナビゲーション'}).getByRole('link',{name:'ゲームで遊ぶ'});
 await expect(page.locator('.mobile-menu-close')).toBeFocused();await page.keyboard.press('Tab');await expect(games).toBeFocused();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Shift+Tab');await expect(page.getByRole('navigation',{name:'モバイルナビゲーション'}).getByRole('link',{name:'プライバシー',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'メニューを開く'})).toBeFocused();await expect(page.locator('main')).not.toHaveAttribute('inert','');
 await page.locator('.trust-nav a').first().click();
 const target=await page.locator('.trust-nav a').first().getAttribute('href');const bottom=await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom);
 await expect.poll(()=>page.locator(target!).evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(bottom);
});

test('rendered shared loading/error component and 404 families retain recovery surfaces',async({page})=>{
 await mkdir(output,{recursive:true});
 await page.setViewportSize({width:320,height:667});await page.goto('/tools/?goal=models3d');
 for(const kind of ['loading','error'] as const) {
  // Render the real component with tsx, outside Playwright's JSX transformer.
  // This is disposable visual/focus evidence, not a fired error boundary/reset.
  const html=execFileSync(process.execPath,['--import','tsx','--eval',`
   const {renderToStaticMarkup}=require('react-dom/server');const{createElement}=require('react');
   const{DirectoryState}=require('./components/DirectoryState.tsx');const kind=process.argv[1];
   process.stdout.write(renderToStaticMarkup(createElement(DirectoryState,{kind,title:kind==='loading'?'ツールを読み込んでいます':'ツール情報を読み込めませんでした',message:'入力した条件はURLに残っています。'+'長い日本語の回復説明。'.repeat(12),retry:kind==='error'?()=>{}:undefined})));
  `,kind],{encoding:'utf8'});
  await page.locator('main').evaluate((el,markup)=>el.innerHTML=markup,html);
  await expect(page.locator('main').getByRole(kind==='error'?'alert':'status')).toBeVisible();expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  if(kind==='error') {const retry=page.getByRole('button',{name:'もう一度読み込む'});await retry.focus();await expect(retry).toBeFocused();expect((await retry.boundingBox())!.height).toBeGreaterThanOrEqual(48);}
  await page.screenshot({path:`${output}/directory-${kind}-fixture-320.png`});
 }
 for(const route of ['/missing-b3-page/','/tools/missing-b3-tool/','/guides/missing-b3-guide/','/stacks/missing-b3-stack/','/games/missing-b3-game/']) {
  expect((await page.goto(route))?.status()).toBe(404);await expect(page.locator('main h1')).toBeVisible();expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
 }
});

test('paper fields retain visible keyboard focus and a distinct actual invalid boundary',async({page})=>{
 test.setTimeout(90_000);
 await mkdir(output,{recursive:true});
 await page.setViewportSize({width:320,height:667});await page.goto('/project/');
 const field=page.locator('.project-idea-card textarea');
 const contrast=await field.evaluate(el=>{
  const s=getComputedStyle(el);const luminance=(color:string)=>{const values=(color.match(/[\d.]+/g)??[]).slice(0,3).map(x=>Number(x)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return values.reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);};
  const a=luminance(s.borderTopColor),b=luminance(s.backgroundColor);return {border:s.borderTopColor,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
 });expect(contrast.ratio).toBeGreaterThanOrEqual(3);
 await page.getByRole('button',{name:'メニューを開く'}).focus();await page.keyboard.press('Tab');await expect(field).toBeFocused();
 expect(await field.evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(3);
 await page.route('**/api/project/interpret',route=>route.abort('blockedbyclient'));
 for(const route of ['/project/','/builder/']) {
  // Both entry points intentionally resume the same draft; isolate this
  // validation scenario rather than treating that persistence as a failure.
  await page.evaluate(()=>{sessionStorage.clear();localStorage.clear();});
  await page.goto(route);await page.getByLabel('どんなゲームを作りたいですか？').fill('Steam向け3Dホラー。Unity。中級。一人開発。低予算。商用。廃駅を舞台に、音を立てると盲目の怪物が追跡する。');
  await page.getByRole('button',{name:'制作ロードマップを作る',exact:true}).click();
  await page.getByRole('button',{name:'すべて計画に含める',exact:true}).click();
  const invalid=page.getByLabel('抽出した固有情報').first();await invalid.fill(' ');
  await page.getByRole('button',{name:'Project Planを作る',exact:true}).click();
  await expect(invalid).toHaveAttribute('aria-invalid','true');await expect(invalid).toBeFocused();await expect(page.locator('#clarify-error')).toContainText('1文字以上');
  expect(await invalid.evaluate(el=>getComputedStyle(el).borderTopColor)).not.toBe(contrast.border);
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  await page.screenshot({path:`${output}/${route==='/project/'?'project':'builder'}-actual-invalid-focus-320.png`});
 }
});

test('JS-off shared shell keeps actual reading and game destinations',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:375,height:667}});const page=await context.newPage();
 await page.goto('/articles/meshy-pricing-credits-game/?gameai_analytics=off');
 await expect(page.locator('main h1')).toBeVisible();await expect(page.locator('.site-footer a[href="/tools/"]')).toBeVisible();
 expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
 await page.goto('/');await expect(page.locator('.b3-art-link')).toHaveCount(getPublishedGames().length);await context.close();
});
