// Browser-only content-update fixture; never imported by app routes or registry.
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CreationDeck } from '../../components/CreationDeck';

function Fixture() {
  const [long, setLong] = useState(true);
  const items = useMemo(() => [0, 1, 2].map(index => ({
    id: `summary-${index}`, href: `#summary-${index}`, title: `検証用カテゴリ ${index + 1}`,
    description: index === 0 && long ? '長い説明の表示範囲を実際の高さで確認します。'.repeat(12) : '短い説明です。',
    count: 3, label: '検証専用',
  })), [long]);
  return <><div><button onClick={() => setLong(false)}>短い内容に更新</button><button onClick={() => setLong(true)}>長い内容に更新</button></div><CreationDeck kind="category" items={items} defaultMode="deck" /></>;
}
createRoot(document.getElementById('start')!).render(<Fixture />);
