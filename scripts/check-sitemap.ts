import sitemap from '../app/sitemap';
import { getServices } from '../lib/services';
const entries=sitemap();
if(entries.some(e=>e.url.includes('?')))throw new Error('Parameterized URL in sitemap');
if(entries.some(e=>e.url.includes('/compare')))throw new Error('Noindex compare URL in sitemap');
if(entries.some(e=>!e.url.endsWith('/')))throw new Error('Sitemap URL does not match trailingSlash canonical policy');
for(const s of getServices())if(!entries.some(e=>e.url.endsWith(`/tools/${s.slug}/`)))throw new Error(`Missing ${s.slug}`);
console.log(`Sitemap contains ${entries.length} canonical URLs`);
