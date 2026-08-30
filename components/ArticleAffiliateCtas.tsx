'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { buildSubId, track } from '@/lib/analytics';

type Mounts={disclosure:HTMLElement|null;first:HTMLElement|null;second:HTMLElement|null};
export type ArticleServiceLink={slug:string;name:string;url:string;affiliate:boolean};

function makeMount(after:Element,key:string){
  const mount=document.createElement('div');
  mount.dataset.articleAffiliateMount=key;
  after.insertAdjacentElement('afterend',mount);
  return mount;
}

function ArticleServiceAnchor({service,page,placement,disclosureId}:{service:ArticleServiceLink;page:string;placement:string;disclosureId:string}){
  return <a
    href={service.url}
    target="_blank"
    rel={service.affiliate?'sponsored nofollow noopener':'noopener'}
    aria-describedby={service.affiliate?disclosureId:undefined}
    onClick={()=>{
      const properties={service:service.slug,page,placement,sub_id:buildSubId(service.slug,page,placement)};
      track('outbound_click',properties);
      if(service.affiliate)track('affiliate_click',properties);
    }}
  >{service.name}</a>;
}

export function ArticleAffiliateCtas({meshy,elevenlabs}:{meshy:ArticleServiceLink|null;elevenlabs:ArticleServiceLink|null}){
  const rawPathname=usePathname();
  const pathname=rawPathname.length>1?rawPathname.replace(/\/$/,''):rawPathname;
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

    let active=true;
    queueMicrotask(()=>{
      if(active)setMounts({disclosure,first,second});
    });
    return ()=>{
      active=false;
      [disclosure,first,second].forEach(node=>node?.remove());
    };
  },[pathname]);

  if(pathname!=='/articles/ai-fantasy'&&pathname!=='/articles/ai-usage-guide')return null;
  const usage=pathname==='/articles/ai-usage-guide';
  const disclosureId=`article-affiliate-disclosure-${usage?'usage':'fantasy'}`;
  const hasAffiliate=Boolean(meshy?.affiliate||elevenlabs?.affiliate);

  return <>
    {mounts.disclosure&&hasAffiliate&&createPortal(<p id={disclosureId} className="affiliate-disclosure-note"><small><strong>広告について:</strong> この記事には本文と分離した広告枠があります。対象リンク経由の申込み等により、当サイトが報酬を受け取る場合があります。広告の有無は本文の結論や比較結果に影響しません。</small></p>,mounts.disclosure)}
    {mounts.first&&meshy&&createPortal(usage
      ? <aside className="article-ad-slot" aria-label={meshy.affiliate?'広告':'関連する公式リンク'}><strong>{meshy.affiliate?'広告':'関連する公式リンク'}</strong><p><ArticleServiceAnchor service={meshy} page={pathname} placement="usage_visuals_inline" disclosureId={disclosureId}/> の公式ページで、3D生成の機能・料金・利用条件を確認できます。本文とは独立した案内です。</p></aside>
      : <aside className="article-ad-slot" aria-label={meshy.affiliate?'広告':'関連する公式リンク'}><strong>{meshy.affiliate?'広告':'関連する公式リンク'}</strong><p><ArticleServiceAnchor service={meshy} page={pathname} placement="fantasy_tools_inline" disclosureId={disclosureId}/> の公式ページで、3D生成の機能・料金・利用条件を確認できます。本文とは独立した案内です。</p></aside>,mounts.first)}
    {mounts.second&&elevenlabs&&createPortal(usage
      ? <aside className="article-ad-slot" aria-label={elevenlabs.affiliate?'広告':'関連する公式リンク'}><strong>{elevenlabs.affiliate?'広告':'関連する公式リンク'}</strong><p><ArticleServiceAnchor service={elevenlabs} page={pathname} placement="usage_voice_inline" disclosureId={disclosureId}/> の公式ページで、音声生成の機能・料金・利用条件を確認できます。本文とは独立した案内です。</p></aside>
      : <aside className="article-ad-slot" aria-label={elevenlabs.affiliate?'広告':'関連する公式リンク'}><strong>{elevenlabs.affiliate?'広告':'関連する公式リンク'}</strong><p><ArticleServiceAnchor service={elevenlabs} page={pathname} placement="fantasy_voice_inline" disclosureId={disclosureId}/> の公式ページで、音声生成の機能・料金・利用条件を確認できます。本文とは独立した案内です。</p></aside>,mounts.second)}
  </>;
}
