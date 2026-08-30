import type { Service } from "@/lib/schema";

export const serviceCategoryLabels: Record<Service["category"], string> = {
  "general-llm": "汎用AI",
  "coding-agent": "コーディングエージェント",
  "ide-ai": "AI開発環境",
  "2d-image": "2D画像生成",
  "concept-art": "コンセプトアート",
  "character-consistency": "キャラクター一貫性",
  "texture-material": "テクスチャ・マテリアル",
  "3d-model": "3Dモデル生成",
  rigging: "リギング",
  animation: "アニメーション",
  voice: "音声生成",
  music: "音楽生成",
  sfx: "効果音生成",
  "npc-dialogue": "NPC会話",
  localization: "ローカライズ",
  "video-trailer": "映像・トレーラー",
  "qa-testing": "QA・テスト",
  "game-generator": "ゲーム生成",
  "no-code-low-code": "ノーコード・ローコード",
  "marketing-store-assets": "ストア・販促素材",
};

export function serviceCategoryLabel(category: Service["category"]) {
  return serviceCategoryLabels[category];
}
