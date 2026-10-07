'use client';
import Link from 'next/link';
import { track } from '@/lib/analytics';
export function ArticleProjectCta({slug,label,description,placement}:{slug:string;label:string;description:string;placement:string}){
  return <section className="result-next article-project-cta" aria-labelledby={`article-cta-${slug}`}><p className="eyebrow">NEXT BUILD ACTION</p><h2 id={`article-cta-${slug}`}>{label}</h2><p>{description}</p><p>Projectを開いたら、作りたいゲームと必要な条件を入力・確認してください。</p><Link className="button" href={`/project?source=${encodeURIComponent(slug)}`} onClick={()=>track('article_to_project',{page:`/articles/${slug}`,placement,article_slug:slug,cta_placement:placement,source_context:'article',route_category:'article'})}>Projectでゲーム案を入力する</Link></section>
}
