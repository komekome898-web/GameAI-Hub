import { expect, test } from '@playwright/test';

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
