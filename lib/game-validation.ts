import type { GameRecord } from "@/data/games";

const https = (value: string) => { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; } };
export function validateGames(records: readonly GameRecord[]): string[] {
  const errors: string[] = [], slugs = new Set<string>(), orders = new Set<number>();
  for (const game of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.slug) || slugs.has(game.slug)) errors.push(`invalid or duplicate slug: ${game.slug}`);
    slugs.add(game.slug);
    if (!["draft", "published"].includes(game.publicationStatus)) errors.push(`invalid status: ${game.slug}`);
    if (game.publicationStatus !== "published") continue;
    if (!Number.isInteger(game.order) || game.order < 1 || orders.has(game.order)) errors.push(`invalid or duplicate order: ${game.slug}`);
    orders.add(game.order);
    if (!https(game.playUrl) || (game.author.socialUrl && !https(game.author.socialUrl))) errors.push(`invalid https URL: ${game.slug}`);
    if (!/^\/images\/games\/[a-z0-9/-]+\.(png|webp|jpg|jpeg)$/.test(game.image.src) || !game.image.alt.trim() || !game.image.credit.trim() || game.image.width <= 0 || game.image.height <= 0) errors.push(`invalid image: ${game.slug}`);
    if (!game.title.trim() || !game.description.trim() || !game.author.name.trim() || !game.controls.trim() || !game.pricingAndRegistration.trim() || !game.verifiedDevices.length || !game.sources.length) errors.push(`missing publication facts: ${game.slug}`);
    if (!game.publicationReview || ![game.publicationReview.urlChecked, game.publicationReview.imageChecked, game.publicationReview.permissionConfirmed, game.publicationReview.approved].every(value => value === true)) errors.push(`publication review incomplete: ${game.slug}`);
    if (game.productionArticle && !/^\/articles\/[a-z0-9-]+\/$/.test(game.productionArticle.href) && !https(game.productionArticle.href)) errors.push(`invalid production article: ${game.slug}`);
  }
  return errors;
}
