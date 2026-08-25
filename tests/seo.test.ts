import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { getServices } from '@/lib/services';
import { productionUrl, site } from '@/lib/site';
import { metadata as rootMetadata } from '@/app/layout';
import { metadata as toolsMetadata } from '@/app/tools/page';
import { metadata as compareMetadata } from '@/app/compare/page';
import { metadata as methodologyMetadata } from '@/app/methodology/page';
import { metadata as affiliateMetadata } from '@/app/affiliate-disclosure/page';
import { metadata as privacyMetadata } from '@/app/privacy/page';
import { generateMetadata } from '@/app/tools/[slug]/page';

describe('SEO', () => {
  it('uses the permanent production origin', () => {
    expect(productionUrl).toBe('https://game-ai-hub.vercel.app');
    expect(site.url).toBe(productionUrl);
  });

  it('uses self-referencing canonical and Open Graph URLs for every public page', async () => {
    const pages = [
      ['/', rootMetadata],
      ['/tools', toolsMetadata],
      ['/compare', compareMetadata],
      ['/methodology', methodologyMetadata],
      ['/affiliate-disclosure', affiliateMetadata],
      ['/privacy', privacyMetadata],
    ] as const;

    for (const [path, metadata] of pages) {
      expect(new URL(String(metadata.alternates?.canonical), productionUrl).href).toBe(`${productionUrl}${path}`);
      expect(new URL(String(metadata.openGraph?.url), productionUrl).href).toBe(`${productionUrl}${path}`);
    }

    for (const service of getServices()) {
      const path = `/tools/${service.slug}`;
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: service.slug }) });
      expect(new URL(String(metadata.alternates?.canonical), productionUrl).href).toBe(`${productionUrl}${path}`);
      expect(new URL(String(metadata.openGraph?.url), productionUrl).href).toBe(`${productionUrl}${path}`);
    }
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
