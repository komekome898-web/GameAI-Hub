import type { ReactNode } from 'react';
import { ArticleAffiliateCtas } from '@/components/ArticleAffiliateCtas';

export default function ArticlesLayout({children}:{children:ReactNode}){
  return <>{children}<ArticleAffiliateCtas/></>;
}
