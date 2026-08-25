import type { Metadata } from 'next';
import { BuilderClient } from '@/components/BuilderClient';

export const metadata: Metadata = {
  title: 'AIゲーム開発構成を作る',
  description: '作りたいゲームと制作条件から、工程順・AIツール候補・代替案・確認事項を組み立てます。',
  alternates: { canonical: '/builder/' },
  openGraph: { title: 'AIゲーム開発構成を作る | GameAI Hub', description: '4つの短い質問から、必要な制作工程、AIツール候補、代替案、確認事項を組み立てます。', url: '/builder/' },
};

export default function BuilderPage() {
  return <BuilderClient />;
}
