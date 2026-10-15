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

export const siteDescriptionLines = [
  'AIでゲームを作ってみたいあなたへ',
  'ツール選びから作り方や作品の実例までサポート',
  '次はあなたのアイデアを遊べるゲームに',
] as const;

export const site = {
  name: 'GameBuildiary',
  nickname: 'ビルダイアリー',
  url: normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  description: siteDescriptionLines.join('。'),
};

/** Returns an absolute HTTPS URL suitable for canonical and structured-data fields. */
export function absoluteSiteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${site.url}/`).href;
}
