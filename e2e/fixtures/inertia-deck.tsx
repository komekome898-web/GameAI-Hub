// Browser-only fixture: never imported by app routes or the article registry.
import { createRoot } from 'react-dom/client';
import { CreationDeck, type CreationDeckItem } from '../../components/CreationDeck';
const count = Number(new URL(location.href).searchParams.get('count'));
const items: CreationDeckItem[] = Array.from({ length: count }, (_, i) => ({
  id: `inertia-fixture-${i}`, href: `#fixture-article-${i}`, title: `検証専用 記事 ${i + 1}`,
  description: `識別番号 ${i + 1}。同じ円環コンポーネントの多件数検証。公開記事ではありません。`,
  label: `TEST ${i + 1}`, updatedAt: '2026-10-03', image: { src: '/visual-v2/thumbnails/planning-480.webp', srcSet: '' },
}));
createRoot(document.getElementById('start')!).render(<CreationDeck items={items} defaultMode={new URL(location.href).searchParams.has('automatic') ? 'deck' : 'list'} />);
