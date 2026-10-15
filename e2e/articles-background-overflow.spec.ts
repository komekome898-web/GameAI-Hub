import { getPublishedGames } from '../data/games';
import { test, expect } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
const evidence = 'docs/screenshots/articles-background-overflow';
test.beforeEach(async ({context}) => {
  await mkdir(evidence,{recursive:true});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
});
for (const width of [1180,1165,375,320]) test(`background fits layout and scrollbar gutter at ${width}`,async ({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/articles/');
  // Reserve the same 15px gutter as classic Chromium scrollbars, including headless runs.
  await page.addStyleTag({content:'html{scrollbar-gutter:stable}'});
  const metrics=await page.evaluate(()=>{
    const body=document.body.getBoundingClientRect(), art=document.querySelector('.v2-atrium-art')!.getBoundingClientRect();
    return {viewport:innerWidth,layout:body.width,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,artLeft:art.left,artRight:art.right,bodyOverflow:getComputedStyle(document.body).overflowX};
  });
  expect(metrics.document).toBeLessThanOrEqual(Math.ceil(metrics.layout));
  expect(metrics.body).toBeLessThanOrEqual(Math.ceil(metrics.layout));
  expect(metrics.bodyOverflow).not.toMatch(/hidden|clip/);
  if(width>340){expect(metrics.artLeft).toBeGreaterThanOrEqual(0);expect(metrics.artRight).toBeLessThanOrEqual(metrics.layout);}
  await page.screenshot({path:`${evidence}/articles-${width}-gutter.png`,fullPage:true});
  await writeFile(`${evidence}/articles-${width}-gutter.json`,JSON.stringify(metrics,null,2));
});
test('game deck still swipes, focuses and reflows at zoom',async ({page})=>{
  await page.setViewportSize({width:375,height:900});
  await page.goto('/articles/#games');
  const deck=page.locator('#games .creation-deck'), stage=deck.locator('ol');
  const idle=()=>expect(stage).toHaveAttribute('data-motion','idle');
  await idle();
  const initial=await stage.locator('[data-distance="0"]').getAttribute('data-deck-id');
  const current=stage.locator('[data-distance="0"] strong');
  await current.scrollIntoViewIfNeeded();const box=(await current.boundingBox())!;
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-145,y,{steps:8});await page.mouse.up();await idle();
  expect(await stage.locator('[data-distance="0"]').getAttribute('data-deck-id')).not.toBe(initial);
  const next=deck.getByRole('button',{name:'次の作品',exact:true});await next.focus();await expect(next).toBeFocused();await page.keyboard.press('ArrowRight');await idle();await expect(next).toBeFocused();
  await page.screenshot({path:`${evidence}/games-375-swipe-focus.png`,fullPage:true});
  await page.setViewportSize({width:320,height:900});await page.addStyleTag({content:'html{zoom:2}'});
  await expect(deck).toHaveAttribute('data-mode','list');
  await expect(deck.locator('[data-deck-id]')).toHaveCount(getPublishedGames().length);
  const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,layout:document.documentElement.clientWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.layout);
  await page.screenshot({path:`${evidence}/games-320-zoom200.png`,fullPage:true});
});
