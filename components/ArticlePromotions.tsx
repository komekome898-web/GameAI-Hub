import { OutboundLink } from '@/components/OutboundLink';
import type { ArticleRecord } from '@/data/articles';
import { getService } from '@/lib/services';

/** Renders only editorially opted-in promotions at an explicit production step. */
export function ArticlePromotions({article,placement}:{article:ArticleRecord;placement:'production_tools'}){
 const promotions=article.promotions.filter(item=>item.placement===placement);if(!promotions.length)return null;
 return <aside className="article-promotions" aria-label="プロモーション"><p><strong>この記事にはプロモーションを含みます。</strong></p>{promotions.map(item=>{const service=getService(item.serviceSlug);return service?<div key={item.serviceSlug}><p>{item.context}</p><OutboundLink service={service} page={`/articles/${article.slug}`} placement={`${placement}_${item.serviceSlug}`}/></div>:null})}</aside>
}
