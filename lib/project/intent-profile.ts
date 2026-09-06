import type { ProjectBrief } from './types';

export type IntentTemplate = 'tap-score' | 'battle' | 'novel' | 'movement-goal' | 'unspecified';

export type IntentProfile = {
  template: IntentTemplate;
  label: string;
  actor?: string;
  loop: string;
};

/**
 * Selects a task shape only from confirmed structured facts. Unknown ideas stay
 * unknown instead of being replaced by the old movement-to-goal default.
 */
export function projectIntentProfile(brief: ProjectBrief): IntentProfile {
  const details = brief.details.map(detail => detail.text.normalize('NFKC').toLocaleLowerCase('ja-JP'));
  const joined = details.join(' / ');
  const entity = brief.details.find(detail => detail.kind === 'entity')?.text;

  if (/(?:タップ|クリック).*(?:得点|スコア)|(?:得点|スコア).*(?:増え|加算|\+1)/.test(joined)) {
    return { template: 'tap-score', label: `${entity ?? '対象'}をタップして得点を増やすゲーム`, actor: entity, loop: `${entity ?? '対象'}を表示 → タップ／クリック → 得点を1増やす` };
  }
  if (brief.genre === 'monster-collection' || /(?:戦闘|1\s*対\s*1|一対一|たたかう|戦う|バトル)/.test(joined)) {
    return { template: 'battle', label: 'モンスター同士の1対1バトル', loop: '味方と敵を表示 → 攻撃 → HPと勝敗を更新' };
  }
  if (brief.genre === 'visual-novel') {
    const bilingual = brief.locale === 'ja-en' || brief.capabilities.includes('localization') || /日本語.*英語|日英|言語.*切り替/.test(joined);
    return { template: 'novel', label: bilingual ? '日本語と英語を切り替えられる短いノベルゲーム' : '短いノベルゲーム', loop: bilingual ? '会話を表示 → 日本語／英語を切り替える → 最後まで読む' : '会話を表示 → 次の台詞へ進む → 最後まで読む' };
  }
  if (/(?:移動|動か).*(?:ゴール|目的地)|(?:ゴール|目的地).*(?:移動|到達)/.test(joined)) {
    return { template: 'movement-goal', label: '移動してゴールするゲーム', loop: 'プレイヤーを移動 → ゴールへ到達 → クリアを表示' };
  }
  return { template: 'unspecified', label: '確認した主要操作の小さなゲーム', loop: '確認済みの主要操作 → 結果を表示 → やり直す' };
}
