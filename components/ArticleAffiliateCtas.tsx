'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { buildSubId, track } from '@/lib/analytics';

const ELEVENLABS='https://try.elevenlabs.io/jlxoxtxe9768';
const MESHY='https://www.meshy.ai?via=gameaihub';

type Mounts={disclosure:HTMLElement|null;first:HTMLElement|null;second:HTMLElement|null};

function makeMount(after:Element,key:string){
  const mount=document.createElement('span');
  mount.dataset.articleAffiliateMount=key;
  after.insertAdjacentElement('afterend',mount);
  return mount;
}

function click(service:string,page:string,placement:string){
  const sub_id=buildSubId(service,page,placement);
  track('affiliate_click',{service,page,placement,sub_id});
}

export function ArticleAffiliateCtas(){
  const pathname=usePathname();
  const [mounts,setMounts]=useState<Mounts>({disclosure:null,first:null,second:null});

  useEffect(()=>{
    if(pathname!=='/articles/ai-fantasy'&&pathname!=='/articles/ai-usage-guide')return;
    const article=document.querySelector('article.page-shell');
    if(!article)return;
    article.querySelectorAll('[data-article-affiliate-mount]').forEach(node=>node.remove());

    const header=article.querySelector('header.page-head');
    let disclosure:HTMLElement|null=null;
    if(header)disclosure=makeMount(header,'disclosure');

    let first:HTMLElement|null=null;
    let second:HTMLElement|null=null;

    if(pathname==='/articles/ai-usage-guide'){
      const headings=Array.from(article.querySelectorAll('h3'));
      const imageHeading=headings.find(node=>node.textContent?.trim()==='画像生成');
      const voiceHeading=headings.find(node=>node.textContent?.trim()==='音声');
      const imageParagraph=imageHeading?.nextElementSibling;
      const voiceParagraph=voiceHeading?.nextElementSibling;
      if(imageParagraph)first=makeMount(imageParagraph,'meshy-inline');
      if(voiceParagraph)second=makeMount(voiceParagraph,'elevenlabs-inline');
    }else{
      const sections=Array.from(article.querySelectorAll('section'));
      const section=sections.find(node=>node.querySelector('h2')?.textContent?.trim()==='では、AIは使えないのか');
      if(section){
        const paragraphs=Array.from(section.querySelectorAll('p'));
        const anchor=paragraphs.find(node=>node.textContent?.trim()==='この領域ではとても強い。') ?? paragraphs.at(-1);
        if(anchor){
          first=makeMount(anchor,'fantasy-meshy');
          second=makeMount(first,'fantasy-elevenlabs');
        }
      }
    }

    setMounts({disclosure,first,second});
    return ()=>{
      [disclosure,first,second].forEach(node=>node?.remove());
    };
  },[pathname]);

  if(pathname!=='/articles/ai-fantasy'&&pathname!=='/articles/ai-usage-guide')return null;
  const usage=pathname==='/articles/ai-usage-guide';

  return <>
    {mounts.disclosure&&createPortal(<p className="affiliate-disclosure-note"><small>この記事にはプロモーションを含みます。</small></p>,mounts.disclosure)}
    {mounts.first&&createPortal(usage
      ? <p>3Dモデル生成までAIに任せたいなら、私はまず小さな素材を1つ作って品質と修正のしやすさを見る。候補の一つが <a href={MESHY} target="_blank" rel="sponsored nofollow noopener" onClick={()=>click('meshy',pathname,'usage_visuals_inline')}>Meshy</a> だ。いきなり量産せず、ゲームへ持ち込めるかまで確認してから広げる。</p>
      : <p>この距離感で試すなら、3D生成では <a href={MESHY} target="_blank" rel="sponsored nofollow noopener" onClick={()=>click('meshy',pathname,'fantasy_tools_inline')}>Meshy</a> のような専用ツールを、小さな素材1つから試す方がいい。出力が派手かではなく、実際の制作で修正して使えるかを見る。</p>,mounts.first)}
    {mounts.second&&createPortal(usage
      ? <p>音声も同じで、デモの自然さだけでは決めない。台詞を数本作り、同じ声を安定して出せるか、運用しやすいかまで試す。私なら <a href={ELEVENLABS} target="_blank" rel="sponsored nofollow noopener" onClick={()=>click('elevenlabs',pathname,'usage_voice_inline')}>ElevenLabs</a> を候補に入れる。</p>
      : <p>音声なら <a href={ELEVENLABS} target="_blank" rel="sponsored nofollow noopener" onClick={()=>click('elevenlabs',pathname,'fantasy_voice_inline')}>ElevenLabs</a> のようなサービスを、台詞数本だけで試してみる。AIを信じるのではなく、実際の成果物を見て採用するか決める。</p>,mounts.second)}
  </>;
}
