import { expect, test, type Page } from '@playwright/test';
const mobile={width:375,height:812};
async function expectNoHorizontalOverflow(page:Page){const sizes=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));expect(sizes.content,`content width ${sizes.content}px exceeds ${sizes.viewport}px viewport`).toBeLessThanOrEqual(sizes.viewport)}
async function completeBuilder(page:Page){await page.locator('#main-content').getByRole('link',{name:'AI開発構成を作る'}).click();await page.getByRole('button',{name:'次へ'}).click();await page.getByRole('button',{name:'次へ'}).click();await page.getByLabel('不要',{exact:true}).first().check();await page.getByLabel('不要',{exact:true}).nth(1).check();await page.getByRole('button',{name:'次へ'}).click();await page.getByRole('button',{name:'構成を作る'}).click()}
test('375px: homeからno voice/no 3Dの制作計画を完走できる',async({page})=>{await page.setViewportSize(mobile);await page.goto('/');await expectNoHorizontalOverflow(page);const box=await page.locator('#main-content').getByRole('link',{name:'AI開発構成を作る'}).boundingBox();expect(box?.height).toBeGreaterThanOrEqual(44);await completeBuilder(page);await expect(page.getByRole('heading',{name:/あなた向け/})).toBeVisible();const map=page.locator('#production-map');await expect(map.getByText('音声',{exact:true})).toHaveCount(0);await expect(map.getByText('3D',{exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'制作工程マップ'})).toBeVisible();await expectNoHorizontalOverflow(page)});
test('375px: 2候補比較と差分のみ表示を操作できる',async({page})=>{await page.setViewportSize(mobile);await page.goto('/compare?ids=github-copilot,cursor');await expect(page.getByText('2 / 4')).toBeVisible();await page.getByLabel('差分のみ表示').check();await expect(page.getByText(/差分のみ表示中/)).toBeVisible();await expect(page.locator('.compare-mobile article')).toHaveCount(2);await expectNoHorizontalOverflow(page)});
test('375px: Stackの条件をBuilderへ引き継げる',async({page})=>{await page.setViewportSize(mobile);await page.goto('/stacks');await page.getByRole('link',{name:/2D RPG/}).first().click();await page.getByRole('link',{name:'この構成を条件に合わせる'}).click();await expect(page.getByText(/の条件を引き継ぎました/)).toBeVisible();await expect(page).toHaveURL(/\/builder\/?\?template=/);await expectNoHorizontalOverflow(page)});

test('Builderのエンジン選択が結果の回答要約と判断根拠に反映される',async({page})=>{
  await page.goto('/builder');
  await page.getByRole('button',{name:'次へ'}).click();
  const unity=page.getByLabel('Unity',{exact:true});
  await expect(unity).toBeVisible();
  await unity.check();
  await page.getByRole('button',{name:'次へ'}).click();
  await page.getByRole('button',{name:'次へ'}).click();
  await page.getByRole('button',{name:'構成を作る'}).click();
  await expect(page.getByRole('heading',{name:'回答と計画の前提'})).toBeVisible();
  await expect(page.getByText(/Unity/).first()).toBeVisible();
  await expect(page).toHaveURL(/engine=unity/);
});

test('320pxかつ200% zoomでも主要画面に横方向の文書overflowがない',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  for(const route of ['/','/builder','/compare?ids=github-copilot,cursor']){
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
    const session=await page.context().newCDPSession(page);
    await session.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
    await expectNoHorizontalOverflow(page);
    await session.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
  }
});

test('4ツール比較、差分絞り込み、キーボードfocusを維持する',async({page})=>{
  await page.goto('/compare?ids=github-copilot,cursor,elevenlabs,meshy');
  await expect(page.getByText('4 / 4')).toBeVisible();
  const differences=page.getByLabel('差分のみ表示');
  await differences.focus();
  await expect(differences).toBeFocused();
  await page.keyboard.press('Space');
  await expect(differences).toBeChecked();
  await expect(page.getByText(/差分のみ表示中/)).toBeVisible();
  const remove=page.getByRole('button',{name:'Meshyを比較から解除'});
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('3 / 4')).toBeVisible();
  await expect(page).toHaveURL(/ids=github-copilot%2Ccursor%2Celevenlabs|ids=github-copilot,cursor,elevenlabs/);
});
