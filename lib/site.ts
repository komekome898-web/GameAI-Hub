export const productionUrl = 'https://game-ai-hub.vercel.app';

function normalizeSiteOrigin(value: string | undefined): string {
  if (!value) return productionUrl;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname) return productionUrl;
    return url.origin;
  } catch {
    return productionUrl;
  }
}

export const site = {
  name: 'GameAI Hub',
  url: normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  description: 'AIゲーム開発ツールを、料金・商用利用・対応環境から日本語で比較できる意思決定サービス',
};

/** Returns an absolute HTTPS URL suitable for canonical and structured-data fields. */
export function absoluteSiteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${site.url}/`).href;
}
