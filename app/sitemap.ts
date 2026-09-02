import type { MetadataRoute } from 'next';
import { stackTemplates } from '@/data/stack-templates';
import { guides } from '@/data/guides';
import { articles } from '@/data/articles';
import { getServices } from '@/lib/services';
import { site } from '@/lib/site';
export const dynamic='force-static';
const absolute=(path:string)=>`${site.url}${path==='/'?'/':`${path}/`}`;
export const publicSitemapPaths=['/','/project','/guides','/articles','/stacks','/tools','/methodology','/affiliate-disclosure','/privacy'] as const;
export default function sitemap():MetadataRoute.Sitemap{
  // /compare is a parameter-driven utility page and explicitly noindex.
  return [...publicSitemapPaths.map(path=>({url:absolute(path),lastModified:path==='/privacy'?'2026-08-30':'2026-09-02'})),...articles.map(article=>({url:absolute(`/articles/${article.slug}`),lastModified:article.updatedAt})),...guides.map(guide=>({url:absolute(`/guides/${guide.slug}`),lastModified:guide.lastVerified})),...stackTemplates.map(stack=>({url:absolute(`/stacks/${stack.slug}`),lastModified:'2026-08-29'})),...getServices().map(s=>({url:absolute(`/tools/${s.slug}`),lastModified:s.lastVerified}))];
}
