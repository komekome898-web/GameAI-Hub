// Disposable browser fixture. Never imported by published routes or registries.
import { createRoot } from 'react-dom/client';
import { CreationDeck, type CreationDeckItem } from '../../components/CreationDeck';
const count = Number(new URL(location.href).searchParams.get('count'));
const items: CreationDeckItem[] = Array.from({ length: count }, (_, index) => ({
  id: `test-game-${index}`, title: `検証専用作品 ${index + 1}`, href: `#intro-${index}`,
  description: 'モンスターを操作し、3Dの荒野で技を放って戦うTPSバトルロイヤル。',
  label: 'TPS・バトルロイヤル', playUrl: 'https://example.com/', deviceNote: '確認：横画面相当。検証用データ。',
  image: { src: '/images/games/aramon/title-screen.png', srcSet: '', width: 667, height: 375 },
}));
createRoot(document.getElementById('games')!).render(<CreationDeck kind="game" items={items} defaultMode="deck" />);
