import type { Metadata } from 'next';
import { ProjectGeneratorClient } from '@/components/ProjectGeneratorClient';

export const metadata: Metadata = {
  title: 'AI Game Project Generator',
  description: 'ゲームのアイデアから、最初のプレイ可能範囲、制作ロードマップ、Codex向け指示、素材とリスクを組み立てます。',
  alternates: { canonical: '/builder/' },
  openGraph: { title: 'AI Game Project Generator | GameAI Hub', description: 'ゲームのアイデアを実行可能なProject Planへ変えます。', url: '/builder/' },
};

export default function BuilderPage() {
  return <ProjectGeneratorClient />;
}
