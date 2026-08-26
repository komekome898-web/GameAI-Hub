import type { MetadataRoute } from 'next';
import { stackTemplates } from '@/data/stack-templates';
import { guides } from '@/data/guides';
import { getServices } from '@/lib/services';
import { site } from '@/lib/site';
export const dynamic='force-static';
const absolute=(path:string)=>`${site.url}${path==='/'?'/':`${path}/`}`;
export default function sitemap():MetadataRoute.Sitemap{
  // /compare is a parameter-driven utility page and explicitly noindex.
  const paths=['/','/project','/guides','/stacks','/tools','/methodology','/affiliate-disclosure','/privacy'];
  return [...paths.map(path=>({url:absolute(path),lastModified:'2026-08-26'})),...guides.map(guide=>({url:absolute(`/guides/${guide.slug}`),lastModified:guide.lastVerified})),...stackTemplates.map(stack=>({url:absolute(`/stacks/${stack.slug}`),lastModified:'2026-08-25'})),...getServices().map(s=>({url:absolute(`/tools/${s.slug}`),lastModified:s.lastVerified}))];
}
