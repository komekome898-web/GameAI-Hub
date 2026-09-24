import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type VercelConfig = {
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
};

const previousCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://region1.google-analytics.com; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

function parseDirectives(value: string) {
  return new Map(value.split(';').map((part) => {
    const [name, ...sources] = part.trim().split(/\s+/);
    return [name, sources] as const;
  }));
}

function allowsOrigin(sources: string[], origin: string) {
  const url = new URL(origin);
  return sources.some((source) => {
    if (!source.startsWith('https://')) return false;
    const allowed = new URL(source.replace('*.', 'wildcard.'));
    if (allowed.protocol !== url.protocol) return false;
    if (!source.includes('*.')) return allowed.origin === url.origin;
    const suffix = allowed.hostname.slice('wildcard'.length);
    return url.hostname.endsWith(suffix) && url.hostname !== suffix.slice(1);
  });
}

describe('Vercel Content-Security-Policy', () => {
  it('adds only the GA4 analytics collector origin to connect-src', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as VercelConfig;
    const csp = config.headers
      .flatMap(({ headers }) => headers)
      .find(({ key }) => key.toLowerCase() === 'content-security-policy')?.value;
    expect(csp).toBeDefined();

    const before = parseDirectives(previousCsp);
    const after = parseDirectives(csp!);
    expect([...after.keys()]).toEqual([...before.keys()]);

    for (const [directive, sources] of before) {
      if (directive !== 'connect-src') expect(after.get(directive)).toEqual(sources);
    }

    const beforeConnect = before.get('connect-src')!;
    const afterConnect = after.get('connect-src')!;
    expect(afterConnect).toEqual([
      ...beforeConnect,
      'https://analytics.google.com',
    ]);

    expect(allowsOrigin(beforeConnect, 'https://analytics.google.com')).toBe(false);
    expect(allowsOrigin(afterConnect, 'https://analytics.google.com')).toBe(true);
    expect(allowsOrigin(afterConnect, 'https://stats.g.doubleclick.net')).toBe(false);
    expect(allowsOrigin(afterConnect, 'https://www.google.com')).toBe(false);
  });
});
