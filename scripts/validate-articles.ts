import { articles, validateArticles } from '../data/articles';
const errors=validateArticles(articles);if(errors.length)throw new Error(errors.join('\n'));console.log(`Validated ${articles.length} article records`);
