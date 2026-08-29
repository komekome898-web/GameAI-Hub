'use client';

import { buildSubId, track } from '@/lib/analytics';

const offers = [
  {
    service: 'elevenlabs',
    href: 'https://try.elevenlabs.io/jlxoxtxe9768',
    title: 'ゲーム音声をAIで作るなら ElevenLabs',
    description: 'ボイス、ナレーション、会話音声を制作工程に組み込みたいときの候補。',
    cta: 'ElevenLabsを試す ↗',
  },
  {
    service: 'meshy',
    href: 'https://www.meshy.ai?via=gameaihub',
    title: '3D素材をAIで作るなら Meshy',
    description: '3Dモデルやテクスチャ生成を実際のゲーム制作で試したいときの候補。',
    cta: 'Meshyを試す ↗',
  },
] as const;

export function ArticleAffiliateLinks(){
  return <section className="result-next" aria-labelledby="article-ai-tools">
    <h2 id="article-ai-tools">実際にAIを制作へ使ってみる</h2>
    <p>読むだけでなく、小さな成果物を1つ作って試すと、自分の用途に合うか判断しやすくなります。</p>
    <div className="stack-mini-grid">
      {offers.map(offer=><article key={offer.service}>
        <h3>{offer.title}</h3>
        <p>{offer.description}</p>
        <a
          className="button"
          href={offer.href}
          target="_blank"
          rel="sponsored nofollow noopener"
          onClick={()=>track('affiliate_click',{
            service:offer.service,
            page:'/articles',
            placement:'article-footer',
            sub_id:buildSubId(offer.service,'articles','article-footer'),
          })}
        >{offer.cta}</a>
      </article>)}
    </div>
  </section>;
}
