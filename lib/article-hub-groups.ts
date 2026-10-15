import type { HubGroup } from "@/components/ArticleHub";
import { games, getPublishedGames, gamePath, type GameRecord } from "@/data/games";
import { articleCategoryLabels, getArticleGroups } from '@/data/articles';
import { getStartArticleVisual, startArticleVisuals, type StartArticleSlug } from '@/lib/article-visuals';

export function getHubGroups(gameRecords: readonly GameRecord[] = games): HubGroup[] {
  return getArticleGroups().map(group => ({
    id: group.id, title: group.title, description: group.description,
    kind: group.id === "games" ? "game" as const : undefined,
    items: group.id === "games" ? getPublishedGames(gameRecords).map(game => ({
      id: game.slug, href: gamePath(game), title: game.title, description: game.description,
      label: game.genre, playUrl: game.playUrl, deviceNote: game.deviceNote,
      image: { ...game.image, srcSet: `${game.image.src} 1x` },
    })) : group.articles.map(article => ({
      id: article.slug, href: `/articles/${article.slug}/`, title: article.title,
      description: article.description, updatedAt: article.updatedAt,
      label: article.contextNote ?? articleCategoryLabels[article.category],
      image: article.slug in startArticleVisuals ? getStartArticleVisual(article.slug as StartArticleSlug) : undefined,
    })),
  }));
}
