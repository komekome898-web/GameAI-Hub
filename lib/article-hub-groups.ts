import { articleCategoryLabels, getArticleGroups } from '@/data/articles';
import { getStartArticleVisual, startArticleVisuals, type StartArticleSlug } from '@/lib/article-visuals';

export function getHubGroups() {
  return getArticleGroups().map(group => ({
    id: group.id, title: group.title, description: group.description,
    items: group.articles.map(article => ({
      id: article.slug, href: `/articles/${article.slug}/`, title: article.title,
      description: article.description, updatedAt: article.updatedAt,
      label: article.contextNote ?? articleCategoryLabels[article.category],
      image: article.slug in startArticleVisuals ? getStartArticleVisual(article.slug as StartArticleSlug) : undefined,
    })),
  }));
}
