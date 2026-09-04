import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

for(const viewport of [{name:'mobile-375',width:375,height:812},{name:'zoom-320',width:320,height:640},{name:'desktop',width:1280,height:900}]){
 test(`article discovery and Project handoff — ${viewport.name}`,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/articles/');
  if(viewport.name==='zoom-320')await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  await expect(page.getByRole('heading',{name:/読んだ後に/})).toBeVisible();
  await page.getByRole('link',{name:/AIでブラウザゲームを作る方法/}).click();
  await expect(page.getByRole('navigation',{name:'パンくず'})).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.getByRole('heading',{name:'次の判断に必要なページ'})).toBeVisible();
  const body=page.locator('body');
  expect(await body.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.getByRole('link',{name:'自分のブラウザゲームを「最初の1プレイ」に分ける'}).last().click();
  await expect(page).toHaveURL(/\/project\/?\?source=ai-browser-game-how-to$/);
  await page.goBack();
  await expect(page.getByRole('heading',{name:/AIでブラウザゲームを作る方法/,level:1})).toBeVisible();
  await page.screenshot({path:`docs/screenshots/issue-45/article-${viewport.name}.png`,fullPage:viewport.name!=='zoom-320'});
 });
}

for(const viewport of [{name:'mobile-320',width:320,height:640,zoom:true},{name:'desktop',width:1280,height:900,zoom:false}]){
 test(`GitHub beginner guide keeps only safe Project return — ${viewport.name}`,async({page})=>{
  await mkdir('docs/screenshots/issue-49',{recursive:true});
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/articles/github-beginner-game-development/?returnTo=https%3A%2F%2Fevil.example%2Fproject');
  const session=viewport.zoom?await page.context().newCDPSession(page):null;
  if(session){await session.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});await expect.poll(()=>page.evaluate(()=>window.visualViewport?.scale??1)).toBeGreaterThanOrEqual(1.9)}
  await expect(page.getByRole('heading',{name:'元のGameAI Hubタブへ戻る'})).toBeVisible();
  await expect(page.getByRole('link',{name:'元のProjectを開く'})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Project Generatorを開く'})).toHaveAttribute('href','/project/');
  expect(await page.locator('body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:`docs/screenshots/issue-49/github-guide-${viewport.name}${viewport.zoom?'-zoom-200-percent':''}.png`,fullPage:!viewport.zoom});
  if(session){await session.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await session.detach()}
 });
}
