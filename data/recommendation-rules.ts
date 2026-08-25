import { RecommendationRuleSchema } from '@/lib/domain';

// Priority only resolves overlapping product-fit rules. Affiliate state is deliberately absent.
export const recommendationRules = RecommendationRuleSchema.array().parse([
  { id:'code-assisted-copilot', stage:'code', serviceSlug:'github-copilot', conditions:[{field:'codingPreference',operator:'equals',value:'assisted'}], reasonTemplate:'コーディング支援を使いながら自分で実装する条件に合う候補です。生成コードは必ずレビューとテストを行います。', priority:20 },
  { id:'code-first-cursor', stage:'code', serviceSlug:'cursor', conditions:[{field:'codingPreference',operator:'equals',value:'code-first'}], reasonTemplate:'コード主体でコードベース検索やリファクタリングも行う条件に合う候補です。', priority:20 },
  { id:'no-code-prototype', stage:'prototype', serviceSlug:'rosebud-ai', conditions:[{field:'codingPreference',operator:'equals',value:'no-code'}], reasonTemplate:'ノーコードでゲームのプロトタイプを作る用途に合致します。エクスポートと商用条件は採用前に確認が必要です。', priority:20 },
  { id:'two-d-visuals', stage:'visuals', serviceSlug:'scenario', conditions:[{field:'assetRequirements',operator:'includes',value:'2d-assets'}], reasonTemplate:'2Dアセットが必要という条件と、登録済みの主要用途が一致します。', priority:20 },
  { id:'concept-visuals', stage:'visuals', serviceSlug:'scenario', conditions:[{field:'assetRequirements',operator:'includes',value:'concept-art'}], reasonTemplate:'コンセプト画像が必要という条件と、登録済みの主要用途が一致します。', priority:15 },
  { id:'three-d-assets', stage:'3d', serviceSlug:'meshy', conditions:[{field:'assetRequirements',operator:'includes',value:'3d-assets'}], reasonTemplate:'3Dモデルまたはテクスチャが必要という条件と、登録済みの主要用途が一致します。', priority:20 },
  { id:'three-d-game', stage:'3d', serviceSlug:'meshy', conditions:[{field:'gameType',operator:'equals',value:'3d'}], reasonTemplate:'3Dゲームを作る条件と、登録済みの3Dモデル・テクスチャ用途が一致します。ゲーム実装や最終品質を保証するものではありません。', priority:19 },
  { id:'voice-required', stage:'voice', serviceSlug:'elevenlabs', conditions:[{field:'voiceRequirement',operator:'equals',value:'required'}], reasonTemplate:'キャラクター音声が必要という条件と、登録済みの主要用途が一致します。', priority:20 },
  { id:'voice-optional', stage:'voice', serviceSlug:'elevenlabs', conditions:[{field:'voiceRequirement',operator:'equals',value:'optional'}], reasonTemplate:'音声を追加候補とする条件に合うため、任意工程として提示します。', priority:10, optional:true },
  { id:'music-required', stage:'music-sfx', serviceSlug:'suno', conditions:[{field:'musicRequirement',operator:'equals',value:'required'}], reasonTemplate:'BGMが必要という条件と、登録済みの主要用途が一致します。効果音対応を意味するものではありません。', priority:20 },
  { id:'music-optional', stage:'music-sfx', serviceSlug:'suno', conditions:[{field:'musicRequirement',operator:'equals',value:'optional'}], reasonTemplate:'BGMを追加候補とする条件に合うため、任意工程として提示します。', priority:10, optional:true },
  { id:'npc-dialogue', stage:'npc-dialogue', serviceSlug:'inworld', conditions:[{field:'genre',operator:'equals',value:'rpg'},{field:'integrationImportance',operator:'equals',value:'high'}], reasonTemplate:'RPGでゲーム内会話と統合を重視する条件に合う候補です。遅延・費用・安全性は実環境で検証します。', priority:15, optional:true },
]);
