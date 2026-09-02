import type { Metadata } from 'next';

export const articleCategories = ['field-note','practical-guide','beginner','tool','genre','comparison'] as const;
export type ArticleCategory = typeof articleCategories[number];
export type ArticleLink = { href:string; label:string; reason:string; kind:'article'|'guide'|'tool'|'compare'|'reference' };
export type ArticleSource = { label:string; url:string; kind:'primary'|'first-hand'; verifiedAt:string };
export type ArticleRecord = {
  slug:string; title:string; description:string; category:ArticleCategory; tags:readonly string[]; publicationStatus:'published'|'draft'|'research_required';
  publishedAt:string; updatedAt:string; lastVerifiedAt?:string; author:string; editorialNote:string;
  sources:readonly ArticleSource[]; related:readonly ArticleLink[];
  projectCta:{ label:string; description:string; placement:'article_end' }; promotions:readonly {serviceSlug:'meshy'|'elevenlabs';placement:'production_tools';context:string}[];
};

export const articleCategoryLabels:Record<ArticleCategory,string>={
  'field-note':'開発フィールドノート','practical-guide':'実践ガイド',beginner:'初心者向け',tool:'ツール実践',genre:'ジャンル別',comparison:'比較・選定'
};

export const articles = [
  {
    slug:'ai-fantasy',title:'AIに幻想を抱くあなたへ',description:'AIに任せれば全部うまくいく、と思っていた私が、実際の開発で何度も失敗してわかったこと。AIは魔法ではない。使う側の検証と判断が必要だ。',category:'field-note',tags:['AI活用','品質検証','失敗事例'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'運営者の開発経験を整理したフィールドノートです。製品仕様の比較記事ではありません。',sources:[],related:[{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',reason:'失敗を防ぐ具体的な指示と検証の型へ進む',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',reason:'考え方を検証可能な実装タスクへ変える',kind:'guide'},{href:'/methodology/',label:'GameAI Hubの調査・評価方法',reason:'確認済み情報と不明情報の扱いを確認する',kind:'reference'}],projectCta:{label:'自分のゲームの最初の制作手順を作る',description:'丸投げせず、成果物と完了条件に分けた最初の作業を作ります。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-usage-guide',title:'AIの正しい使い方',description:'AIに期待しすぎて何度も失敗した私が、初めてAIを使う人に向けて、プロンプトの書き方、失敗時の対処法、用途別のAIの使い分けを実体験ベースで整理する。',category:'practical-guide',tags:['AI活用','プロンプト','品質検証'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',publicationStatus:'published',lastVerifiedAt:'2026-08-29',author:'GameAI Hub編集部',editorialNote:'運営者の実体験に基づく実践ガイドです。各サービスの最新仕様は公式資料で別途確認してください。',sources:[{label:'OpenAI: GPT-5.6 in ChatGPT',url:'https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt/',kind:'primary',verifiedAt:'2026-08-29'},{label:'Anthropic: Claude Opus 5',url:'https://www.anthropic.com/news/claude-opus-5',kind:'primary',verifiedAt:'2026-08-29'},{label:'Google: Gemini 3',url:'https://blog.google/products-and-platforms/products/gemini/gemini-3/',kind:'primary',verifiedAt:'2026-08-29'}],related:[{href:'/articles/ai-fantasy/',label:'AIに幻想を抱くあなたへ',reason:'AIへ任せる範囲と人が確認する範囲を整理する',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',reason:'目的・制約・完了条件を実装単位へ落とす',kind:'guide'},{href:'/tools/',label:'成果物からAIツールを探す',reason:'必要な成果物が決まった後に公式根拠を確認する',kind:'tool'}],projectCta:{label:'自分のゲームで試す最初の作業を作る',description:'目的、制約、成果物、完了条件をゲーム案に合わせて具体化します。',placement:'article_end'},promotions:[]
  }
] as const satisfies readonly ArticleRecord[];

export const publishedArticles=articles.filter(article=>article.publicationStatus==='published');

export function validateArticles(records:readonly ArticleRecord[]){
 const errors:string[]=[];const seen=new Set<string>();const publishedSlugs=new Set(records.filter(a=>a.publicationStatus==='published').map(a=>a.slug));
 for(const a of records){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug))errors.push(`invalid slug: ${a.slug}`);if(seen.has(a.slug))errors.push(`duplicate slug: ${a.slug}`);seen.add(a.slug);
  for(const [field,date] of [['publishedAt',a.publishedAt],['updatedAt',a.updatedAt],['lastVerifiedAt',a.lastVerifiedAt]] as const)if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))))errors.push(`invalid ${field}: ${a.slug}`);
  if(a.updatedAt<a.publishedAt)errors.push(`updatedAt before publishedAt: ${a.slug}`);
  if(a.publicationStatus==='published'&&(!a.projectCta||!a.editorialNote||a.related.length===0))errors.push(`incomplete published article: ${a.slug}`);
  if(a.publicationStatus==='published'&&(a.category==='tool'||a.category==='comparison')&&(!a.lastVerifiedAt||a.sources.length===0))errors.push(`unverified factual article: ${a.slug}`);
  const sourceUrls=new Set<string>();for(const source of a.sources){try{if(new URL(source.url).protocol!=='https:')errors.push(`non-https source: ${a.slug}`)}catch{errors.push(`invalid source: ${a.slug}`)}if(sourceUrls.has(source.url))errors.push(`duplicate source: ${a.slug}`);sourceUrls.add(source.url);if(!/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedAt)||Number.isNaN(Date.parse(source.verifiedAt)))errors.push(`invalid source date: ${a.slug}`);if(a.lastVerifiedAt&&source.verifiedAt>a.lastVerifiedAt)errors.push(`source newer than article verification: ${a.slug}`)}
  const relatedHrefs=new Set<string>();for(const link of a.related){if(link.href===articlePath(a)||!link.reason||!link.href.startsWith('/'))errors.push(`invalid related link: ${a.slug}`);if(relatedHrefs.has(link.href))errors.push(`duplicate related link: ${a.slug}`);relatedHrefs.add(link.href);const match=link.href.match(/^\/articles\/([^/]+)\/?$/);if(match&&!publishedSlugs.has(match[1]))errors.push(`related article is not published: ${a.slug}`)}
  for(const promotion of a.promotions)if(!promotion.context.trim())errors.push(`promotion without production rationale: ${a.slug}`);
 }
 return errors;
}

export function getArticle(slug:string):ArticleRecord|undefined{return articles.find(article=>article.slug===slug)}
export function articlePath(article:ArticleRecord){return `/articles/${article.slug}/`}
export function articleMetadata(article:ArticleRecord):Metadata{return {title:article.title,description:article.description,alternates:{canonical:articlePath(article)},openGraph:{type:'article',title:`${article.title} | GameAI Hub`,description:article.description,url:articlePath(article),publishedTime:article.publishedAt,modifiedTime:article.updatedAt,tags:[...article.tags]},authors:[{name:article.author}]}}
