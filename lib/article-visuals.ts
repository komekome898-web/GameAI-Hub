export const startArticleVisuals = {
  "ai-browser-game-how-to": "game-creation",
  "before-asking-ai-build-game": "planning",
  "github-beginner-game-development": "development",
} as const;

export type StartArticleSlug = keyof typeof startArticleVisuals;

export function getStartArticleVisual(slug: StartArticleSlug) {
  const visual = startArticleVisuals[slug];
  return {
    src: `/visual-v2/thumbnails/${visual}-960.webp`,
    srcSet: `/visual-v2/thumbnails/${visual}-480.webp 480w, /visual-v2/thumbnails/${visual}-960.webp 960w`,
  };
}
