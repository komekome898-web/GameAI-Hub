import { existsSync, readFileSync } from "node:fs";
import { games, getPublishedGames } from "../data/games";
import { publishedArticles } from "../data/articles";
import { validateGames } from "../lib/game-validation";
const errors = validateGames(games);
for (const game of getPublishedGames()) {
  const path = `public${game.image.src}`;
  if (!existsSync(path)) errors.push(`missing image: ${game.slug}`);
  else if (game.image.src.endsWith('.png')) {
    const bytes = readFileSync(path);
    if (bytes.length < 24 || bytes.readUInt32BE(16) !== game.image.width || bytes.readUInt32BE(20) !== game.image.height) errors.push(`image dimensions differ: ${game.slug}`);
  }
  if (game.productionArticle?.href.startsWith("/") && !publishedArticles.some(article => game.productionArticle!.href === `/articles/${article.slug}/`)) errors.push(`production article not published: ${game.slug}`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Validated ${getPublishedGames().length} published games`);
