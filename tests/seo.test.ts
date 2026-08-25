import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { getServices } from '@/lib/services';
import { site } from '@/lib/site';

describe('SEO', () => {
  it('uses the permanent production origin', () => {
    expect(site.url).toBe('https://game-ai-hub.vercel.app');
  });

  it('sitemap has all public routes, detail pages, and no query pages', () => {
    const map = sitemap();
    expect(map).toHaveLength(14);
    expect(map.every(({ url }) => url.startsWith(`${site.url}/`) || url === site.url)).toBe(true);
    expect(map.some(({ url }) => url.includes('?'))).toBe(false);
    expect(map.some(({ url }) => url.endsWith('/compare'))).toBe(true);
    for (const service of getServices()) {
      expect(map.some(({ url }) => url.endsWith(`/tools/${service.slug}`))).toBe(true);
    }
  });

  it('robots points to the production sitemap and blocks parameters', () => {
    const result = robots();
    expect(result.sitemap).toBe(`${site.url}/sitemap.xml`);
    expect(JSON.stringify(result.rules)).toContain('/*?*');
  });
});
