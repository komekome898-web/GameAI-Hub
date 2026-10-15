import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import ToolPage from '@/app/tools/[slug]/page';
import { getService } from '@/lib/services';

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a> }));
vi.mock('next/navigation', () => ({ usePathname: () => '/tools/meshy/' }));

describe('tool detail article entry points', () => {
  it.each([
    ['meshy', ['meshy-game-development-guide', 'meshy-pricing-credits-game', 'meshy-commercial-use-game']],
    ['elevenlabs', ['elevenlabs-game-development-guide', 'elevenlabs-v4-game-voice', 'elevenlabs-commercial-use-game']],
  ] as const)('links %s to its existing articles in editorial order while retaining its official CTA', async (slug, articleSlugs) => {
    const html = renderToStaticMarkup(await ToolPage({ params: Promise.resolve({ slug }) }));
    const container = document.createElement('div');
    container.innerHTML = html;
    const section = container.querySelector('section[aria-labelledby="tool-articles-title"]');
    expect(Array.from(section!.querySelectorAll('a'), link => link.getAttribute('href')))
      .toEqual(articleSlugs.map(article => `/articles/${article}/`));
    const service = getService(slug)!;
    expect(container.querySelector(`a[href="${service.affiliateUrl}"]`)?.getAttribute('rel'))
      .toBe('sponsored nofollow noopener');
    expect(container.querySelector('a[href="/project"]')).toBeTruthy();
  });

  it('does not add unrelated article links to other tools', async () => {
    const html = renderToStaticMarkup(await ToolPage({ params: Promise.resolve({ slug: 'openai-codex' }) }));
    expect(html).not.toContain('tool-articles-title');
  });
});
