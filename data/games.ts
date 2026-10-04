import type { Metadata } from "next";
import { absoluteSiteUrl, site } from "@/lib/site";

export type GameRecord = {
  slug: string;
  publicationStatus: "draft" | "published";
  order: number;
  publicationReview: { urlChecked: boolean; imageChecked: boolean; permissionConfirmed: boolean; approved: boolean };
  title: string;
  description: string;
  genre: string;
  playUrl: string;
  image: { src: string; alt: string; width: number; height: number; credit: string };
  deviceNote: string;
  platformNote: string;
  verifiedDevices: string[];
  about: string;
  highlights: string[];
  howToPlay: string[];
  controls: string;
  pricingAndRegistration: string;
  author: { name: string; socialUrl?: string; socialLabel?: string };
  aiRoles: { name: string; role: string }[];
  humanContribution: string;
  productionArticle?: { href: string; title: string };
  updatedAt: string;
  sources: { label: string; href: string }[];
};

export const games: GameRecord[] = [{
  slug: "aramon", publicationStatus: "published", order: 1,
  publicationReview: { urlChecked: true, imageChecked: true, permissionConfirmed: true, approved: true },
  title: "荒野モン動",
  description: "モンスターを操作し、3Dの荒野で技を放って戦うTPSバトルロイヤル。",
  genre: "TPS・バトルロイヤル",
  playUrl: "https://komekome898-web.github.io/aramon/index.html",
  image: { src: "/images/games/aramon/title-screen.png", alt: "荒野モン動のタイトル画面", width: 667, height: 375, credit: "荒野モン動／おりょう" },
  deviceNote: "作者の環境：iPhone SE3・Safari。編集確認：Firefox横画面相当。",
  platformNote: "スマートフォンの横画面を想定したゲームです。",
  verifiedDevices: ["Firefox・667×375の横画面相当（2026年10月4日、記事編集時の操作確認）", "作者のプレイ環境：iPhone SE（第3世代）・Safari"],
  about: "モンスターを背後から見ながら操作し、技を使って戦うブラウザゲームです。マルチプレイとリアルマップに加え、マスモンの育成も楽しめます。",
  highlights: ["リアルマップのTEAM戦で、地形を見ながら戦う。", "火炎連砲や魔神炎など、モンスターの技とエフェクト。", "マスモンの能力値を見て、育成のトレーニングを選ぶ。"],
  howToPlay: ["ゲームを開き、ゲーム内の「遊び方説明」で操作やルールを確認します。", "技を試す訓練場で操作を確かめてから、バトルへ進めます。"],
  controls: "左下スティックで移動、画面ドラッグで視点回転、FIREで攻撃、DASHで回避。キーボードではWASDで移動、Fで攻撃、Spaceで回避できます。",
  pricingAndRegistration: "料金条件と、プレイに登録が必須かどうかは未確認です。ゲーム内には記録とマスモンを保存するログイン／アカウント作成機能があります。利用前にゲーム内の案内を確認してください。",
  author: { name: "おりょう", socialUrl: "https://x.com/oryoooo_game", socialLabel: "X @oryoooo_game" },
  aiRoles: [
    { name: "Claude", role: "無料プランのチャットでゲームの土台を制作。その後、制作当時はClaude ProのClaude Codeでマルチプレイやリアルマップなどの機能を追加。" },
    { name: "ChatGPT", role: "画像素材の制作。" },
    { name: "音素材", role: "フリー素材とClaudeで作った音が中心。一部にSunoで作られた提供楽曲を使用。" },
  ],
  humanContribution: "作者がゲームを動かして技の見え方を確かめ、AIへの調整依頼とプレイ確認を何度も繰り返しました。ほかのゲームも参考にしながら、画面やエフェクトを調整しています。",
  productionArticle: { href: "/articles/aramon-production-story/", title: "荒野モン動の制作体験を読む" },
  updatedAt: "2026-10-04",
  sources: [{ label: "作者の制作体験とプレイ確認", href: "/articles/aramon-production-story/" }, { label: "公開ゲーム内の遊び方・アカウント案内", href: "https://komekome898-web.github.io/aramon/index.html" }],
}];

export const getPublishedGames = (records: readonly GameRecord[] = games) => records.filter(game => game.publicationStatus === "published").sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
export const getPublishedGame = (slug: string) => getPublishedGames().find(game => game.slug === slug);
export const gamePath = (game: Pick<GameRecord, "slug">) => `/games/${game.slug}/`;
export function gameMetadata(game: GameRecord): Metadata {
  return { title: `${game.title}の紹介・遊び方`, description: game.description, alternates: { canonical: gamePath(game) }, openGraph: { type: "website", title: `${game.title} | ${site.name}`, description: game.description, url: gamePath(game), images: [{ url: absoluteSiteUrl(game.image.src), width: game.image.width, height: game.image.height, alt: game.image.alt }] }, twitter: { card: "summary_large_image", images: [absoluteSiteUrl(game.image.src)] } };
}
