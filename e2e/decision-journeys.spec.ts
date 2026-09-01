import { expect, test, type Page, type TestInfo } from '@playwright/test';

const mobile = { width: 375, height: 812 };
const defaults = {
  ジャンル: 'other',
  '2D / 3D': '2d',
  公開先: 'web',
  ゲームエンジン: 'undecided',
  予算: 'low',
  制作経験: 'beginner',
  チーム規模: 'solo',
  利用目的: 'undecided',
  対応言語: 'ja',
} as const;

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content, `content width ${sizes.content}px exceeds ${sizes.viewport}px viewport`).toBeLessThanOrEqual(sizes.viewport);
}

async function generateProject(page: Page, idea: string) {
  await page.getByLabel('どんなゲームを作りたいですか？').fill(idea);
  await page.getByRole('button', { name: '制作ロードマップを作る' }).click();
  const form = page.locator('.clarify-form');
  await expect(form).toBeVisible();
  await expect(form.locator('select')).toHaveCount(Object.keys(defaults).length);

  const detailCards = form.locator('.project-detail-card');
  if (await detailCards.count()) {
    await form.getByRole('button', { name: 'すべて計画に含める' }).click();
    await expect(detailCards.getByRole('button', { name: '計画に含める' }).first()).toHaveAttribute('aria-pressed', 'true');
  }

  for (const [label, fallback] of Object.entries(defaults)) {
    const select = form.getByLabel(new RegExp(`^${label}`));
    await expect(select).toBeVisible();
    if ((await select.inputValue()) === 'unknown') await select.selectOption(fallback);
    await expect(select).not.toHaveValue('unknown');
  }

  await page.getByRole('button', { name: 'Project Planを作る' }).click();
  await expect(page.getByRole('heading', { name: /今はこれだけ/ })).toBeVisible();
  await expect(page).toHaveURL(/\/project\?v=1&p=/);
}

const providerInterpretation=(mode:'provider'|'deterministic',fallbackReason?:'not_configured'|'provider_error'|'timeout'|'rate_limited')=>({
  interpretation:{idea:'2D RPG',fields:[
    {field:'genre',value:'rpg',provenance:'explicit_text'},{field:'dimension',value:'2d',provenance:'explicit_text'},
    {field:'platform',value:'web',provenance:'explicit_text'},{field:'engine',value:'godot',provenance:'explicit_text'},
    {field:'budget',value:'low',provenance:'explicit_text'},{field:'experience',value:'beginner',provenance:'explicit_text'},
    {field:'team',value:'solo',provenance:'explicit_text'},{field:'commercialIntent',value:'undecided',provenance:'explicit_text'},
    {field:'locale',value:'ja',provenance:'explicit_text'},{field:'capabilities',value:['coding'],provenance:'explicit_text'},
  ],detailCandidates:[],unresolved:[],conflicts:[]},
  status:{providerName:mode==='provider'?'E2E Provider':'ローカル判定',mode,...(fallbackReason?{fallbackReason}:{})},
  confirmationRequired:mode==='provider'?['genre','dimension','platform','engine','budget','experience','team','commercialIntent','locale','capabilities']:[],
});

test.describe('Project Interpreter provider states',()=>{
  test('provider successは全AI候補の確認後にのみ計画を生成する',async({page})=>{
    await page.setViewportSize(mobile);
    await page.route('**/api/project/interpret',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(providerInterpretation('provider'))}));
    await page.goto('/project');await page.getByLabel('どんなゲームを作りたいですか？').fill('2D RPG');
    await page.getByRole('button',{name:'制作ロードマップを作る'}).click();
    await expect(page.getByText('E2E Provider が条件候補を抽出しました',{exact:false})).toBeVisible();
    await page.getByRole('button',{name:'Project Planを作る'}).click();
    await expect(page.locator('#clarify-error')).toContainText('AIが抽出した候補を確認してください');
    for(const label of Object.keys(defaults))await page.getByRole('button',{name:`${label}のAI候補を確認`}).click();
    await page.getByRole('button',{name:'選択された制作工程を確認'}).click();
    await page.getByRole('button',{name:'Project Planを作る'}).click();
    await expect(page.getByRole('heading',{name:/今はこれだけ/})).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('provider未設定は実Route Handlerから決定ルールへフォールバックする',async({page})=>{
    await page.setViewportSize(mobile);await page.goto('/project');
    const responsePromise=page.waitForResponse(response=>response.url().includes('/api/project/interpret')&&response.status()===200);
    await page.getByLabel('どんなゲームを作りたいですか？').fill('2D RPG');await page.getByRole('button',{name:'制作ロードマップを作る'}).click();
    const response=await responsePromise;expect(response.status()).toBe(200);
    expect((await response.json()).status).toMatchObject({mode:'deterministic',fallbackReason:'not_configured'});
    await expect(page.getByText('外部AIは設定されていません',{exact:false})).toBeVisible();await expectNoHorizontalOverflow(page);
  });

  for(const scenario of [
    {name:'provider error',reason:'provider_error' as const,copy:'安全なフォールバックを使用しました'},
    {name:'provider timeout',reason:'timeout' as const,copy:'安全なフォールバックを使用しました'},
    {name:'rate limited',reason:'rate_limited' as const,copy:'利用集中のため外部AIを呼ばず'},
  ])test(`${scenario.name} fallbackを375pxで正直に表示する`,async({page})=>{
    await page.setViewportSize(mobile);
    await page.route('**/api/project/interpret',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(providerInterpretation('deterministic',scenario.reason))}));
    await page.goto('/project');await page.getByLabel('どんなゲームを作りたいですか？').fill('2D RPG');await page.getByRole('button',{name:'制作ロードマップを作る'}).click();
    await expect(page.getByText(scenario.copy,{exact:false})).toBeVisible();await expect(page.locator('.clarify-form')).toBeVisible();await expectNoHorizontalOverflow(page);
  });
});

test('375px: homeからno voice/no 3DのProject Planを完走できる', async ({ page }, testInfo) => {
  await page.setViewportSize(mobile);
  await page.goto('/');
  await expectNoHorizontalOverflow(page);
  const button = page.getByRole('button', { name: '制作ロードマップを作る' });
  const box = await button.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await generateProject(page, '2Dパズル。ブラウザゲーム。一人開発。初心者。無料で作る。個人利用。Godot。音声なし。3Dなし。');
  await page.getByText('工程・Prompt・リスクの詳細を見る').click();
  await expect(page.getByRole('heading', { name: '最初のプレイ可能範囲' })).toBeVisible();
  const result = page.locator('.project-result');
  await expect(result).not.toContainText('台詞ID・話者同意・音声ファイル');
  await expect(result).not.toContainText('3Dモデル');
  const currentQuest = page.locator('.action-step[open]');
  for (const criterion of await currentQuest.locator('.done-criteria input').all()) await criterion.check();
  await currentQuest.locator('.completion-control input').check();
  await expect(page.locator('.build-progress span')).toContainText(/1 \/ \d+ 完了/);
  await page.reload();
  await expect(page.locator('.build-progress span')).toContainText(/1 \/ \d+ 完了/);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('project-generator-375.png'), fullPage: true });
});

test('自由文のゲーム固有情報が主要な制作成果物すべてに反映される', async ({ page }, testInfo: TestInfo) => {
  await page.goto('/project');
  const idea = 'Steam向け2D RPG。Godot。主人公は灯台守ミナ。沈没図書館を舞台に、光る種を育成して記憶の番人と戦闘する。一人開発。初心者。低予算。商用。日本語のみ。絵はAIで作りたい。';
  await generateProject(page, idea);
  await page.getByText('工程・Prompt・リスクの詳細を見る').click();

  const checks: Array<{ name: string; locator: string; details?: string }> = [
    { name: 'Vertical Slice', locator: '#vertical-slice .slice-grid' },
    { name: 'Assets', locator: '#assets .checklist' },
    { name: 'Master Brief', locator: '#handoff', details: 'Master implementation brief' },
    { name: 'First Task', locator: '#handoff', details: 'First task prompt' },
    { name: 'Prompt Kit', locator: '#assets .prompt-grid' },
    { name: 'Risks', locator: '#risks .risk-list' },
  ];
  for (const check of checks) {
    const section = page.locator(check.locator);
    const summary = check.details ? section.locator('summary').filter({ hasText: check.details }) : null;
    if (summary) await summary.click();
    const target = summary ? summary.locator('..') : section;
    await expect(target, `${check.name}に固有情報が必要`).toContainText(/灯台守ミナ|沈没図書館|光る種|記憶の番人/);
  }
  await expect(page.locator('#vertical-slice')).toContainText('育成');
  await expect(page.locator('#assets')).toContainText(/灯台守ミナ|沈没図書館/);
  await page.screenshot({ path: testInfo.outputPath('project-specific-plan.png'), fullPage: true });
});

test('375px: 2候補比較と差分のみ表示を操作できる', async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto('/compare?ids=github-copilot,cursor');
  await expect(page.getByText('2 / 4', { exact: true })).toBeVisible();
  await page.getByLabel('差分のみ表示').check();
  await expect(page.getByText(/差分のみ表示中/)).toBeVisible();
  await expect(page.locator('.compare-mobile article')).toHaveCount(2);
  expect(await page.locator('.paired-fields > section > div').first().evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
  await expectNoHorizontalOverflow(page);
});

test('Toolsの検索直後クリックと履歴移動が競合しない', async ({ page }) => {
  await page.goto('/tools');
  const search = page.getByLabel('ツールを検索');
  await search.fill('ElevenLabs');
  await page.getByRole('heading', { name: 'ElevenLabs' }).getByRole('link').click();
  await page.waitForTimeout(350);
  await expect(page).toHaveURL(/\/tools\/elevenlabs$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/tools\?q=ElevenLabs$/);
  await expect(search).toHaveValue('ElevenLabs');

  await page.goto('/tools');
  await page.getByRole('button', { name: 'BGM' }).click();
  await expect(page).toHaveURL(/goal=music/);
  await page.goBack();
  await expect(page).toHaveURL(/\/tools$/);
  await page.goForward();
  await expect(page).toHaveURL(/goal=music/);
});

test('Compare候補は2件選択後も開いたままでback/forwardに同期する', async ({ page }) => {
  await page.goto('/compare');
  const picker = page.locator('.compare-picker-panel');
  await expect(picker).toHaveAttribute('open', '');
  await page.getByLabel('ElevenLabs').check();
  await expect(picker).toHaveAttribute('open', '');
  await page.getByLabel('Suno').check();
  await expect(page.getByText('2 / 4', { exact: true })).toBeVisible();
  await expect(picker).toHaveAttribute('open', '');
  await page.goBack();
  await expect(page.getByText('1 / 4', { exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByText('2 / 4', { exact: true })).toBeVisible();
});

test('affiliate CTAは広告表示と安全な外部リンク属性を保つ', async ({ page }) => {
  await page.goto('/tools/elevenlabs');
  const cta = page.getByRole('link', { name: /ElevenLabs公式サイト/ }).first();
  await expect(cta).toHaveAttribute('href', 'https://try.elevenlabs.io/jlxoxtxe9768');
  await expect(cta).toHaveAttribute('target', '_blank');
  await expect(cta).toHaveAttribute('rel', 'sponsored nofollow noopener');
  await expect(page.getByText('広告リンク', { exact: true }).first()).toBeVisible();
});

test('375px: Stacksを補助ルートとして閲覧できる', async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto('/stacks/2d-rpg');
  await expect(page.getByRole('heading', { name: /2D RPG/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('Project Generatorのエンジン条件が計画と共有stateへ反映される', async ({ page }) => {
  await page.goto('/project');
  await generateProject(page, 'Steam向け3Dホラー。Unity。プログラミング中級。一人開発。低予算。商用。');
  await expect(page.locator('.project-result')).toContainText('Unity');
});

test('320pxかつ200% zoomでも主要画面に横方向の文書overflowがない', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 320, height: 640 });
  const session = await page.context().newCDPSession(page);
  try {
    for (const route of ['/', '/builder', '/compare?ids=github-copilot,cursor']) {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
      await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
      await expect.poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThanOrEqual(1.9);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({ path: testInfo.outputPath(`zoom-${route.replace(/\W+/g, '-') || 'home'}.png`), fullPage: true });
      await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    }
    await page.goto('/project');
    await generateProject(page, '2Dパズル。ブラウザ。一人開発。初心者。低予算。個人利用。Godot。音声なし。3Dなし。');
    await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await expectNoHorizontalOverflow(page);
    const completion = page.locator('.completion-control').first();
    expect((await completion.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  } finally {
    await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    await session.detach();
  }
});

test('4ツール比較、差分絞り込み、キーボードfocusを維持する', async ({ page }) => {
  await page.goto('/compare?ids=github-copilot,cursor,elevenlabs,meshy');
  await expect(page.getByText('4 / 4', { exact: true })).toBeVisible();
  const differences = page.getByLabel('差分のみ表示');
  await differences.focus();
  await expect(differences).toBeFocused();
  await page.keyboard.press('Space');
  await expect(differences).toBeChecked();
  await expect(page.getByText(/差分のみ表示中/)).toBeVisible();
  const remove = page.getByRole('button', { name: 'Meshyを比較から解除' });
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('3 / 4', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/ids=github-copilot%2Ccursor%2Celevenlabs|ids=github-copilot,cursor,elevenlabs/);
});
