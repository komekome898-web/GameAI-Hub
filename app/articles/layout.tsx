import type { ReactNode } from 'react';
import { ArticleAffiliateCtas } from '@/components/ArticleAffiliateCtas';
import { getOutboundUrl, getService } from '@/lib/services';

function getArticleService(slug:string){
  const service=getService(slug);
  if(!service)return null;
  return {
    slug:service.slug,
    name:service.name,
    url:getOutboundUrl(service),
    affiliate:Boolean(service.affiliateUrl),
  };
}

export default function ArticlesLayout({children}:{children:ReactNode}){
  return <>{children}<ArticleAffiliateCtas meshy={getArticleService('meshy')} elevenlabs={getArticleService('elevenlabs')}/></>;
}
