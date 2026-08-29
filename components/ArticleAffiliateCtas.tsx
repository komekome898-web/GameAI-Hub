'use client';

import { usePathname } from 'next/navigation';
import { buildSubId, track } from '@/lib/analytics';

const ELEVENLABS='https://try.elevenlabs.io/jlxoxtxe9768';
const MESHY='https://www.meshy.ai?via=gameaihub';

type Offer={service:string;name:string;href:string;copy:string;cta:string};

const offers:Offer[]=[
  {service:'elevenlabs',name:'ElevenLabs',href:ELEVENLABS,copy:'ゲームの台詞・ナレーションなど、音声AIを実際の制作工程で試したい人向け。自然さだけでなく、権利条件や大量生成時の運用まで確認して使う。',cta:'ElevenLabsを確認する ↗'},
  {service:'meshy',name:'Meshy',href:MESHY,copy:'3Dモデル生成を制作に組み込みたい人向け。1枚のデモで判断せず、形状の再現性、修正のしやすさ、ゲームへ持ち込むまでの工程で評価する。',cta:'Meshyを確認する ↗'},
];

export function ArticleAffiliateCtas(){
  const pathname=usePathname();
  if(pathname!=='/articles/ai-fantasy'&&pathname!=='/articles/ai-usage-guide')return null;

  const isUsage=pathname==='/articles/ai-usage-guide';
  const heading=isUsage?'実際にAIを試すなら、用途を絞って使う':'幻想を捨てた上で、実際の道具として試す';
  const intro=isUsage
    ?'「一番強いAIを全部に使う」のではなく、仕事ごとに選ぶ。音声ならElevenLabs、3D生成ならMeshyのように、用途を絞って実際の制作工程で試す。'
    :'AIそのものを否定したいわけではない。用途を限定し、出力を自分で確認する前提ならかなり強い。具体例として、音声生成と3D生成の入口を置いておく。';

  const click=(offer:Offer,index:number)=>{
    const placement=`article_${isUsage?'usage':'fantasy'}_${index+1}`;
    const sub_id=buildSubId(offer.service,pathname,placement);
    track('affiliate_click',{service:offer.service,page:pathname,placement,sub_id});
  };

  return <section className="page-shell article-affiliate" aria-labelledby="article-affiliate-title">
    <p className="affiliate-disclosure-note"><small>この記事にはプロモーションを含みます。</small></p>
    <p className="section-label">TOOLS I WOULD ACTUALLY TEST</p>
    <h2 id="article-affiliate-title">{heading}</h2>
    <p>{intro}</p>
    <div className="stack-mini-grid">
      {offers.map((offer,index)=><article key={offer.service}>
        <h3>{offer.name}</h3>
        <p>{offer.copy}</p>
        <a href={offer.href} target="_blank" rel="sponsored nofollow noopener" onClick={()=>click(offer,index)}>{offer.cta}</a>
      </article>)}
    </div>
  </section>;
}
