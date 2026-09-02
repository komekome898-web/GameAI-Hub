import type { Metadata } from 'next';

export const articleCategories = ['field-note','practical-guide','beginner','tool','genre','comparison'] as const;
export type ArticleCategory = typeof articleCategories[number];
export type ArticleLink = { href:string; label:string; kind:'article'|'guide'|'tool'|'compare' };
export type ArticleSource = { label:string; url:string; kind:'primary'|'first-hand' };
export type ArticleRecord = {
  slug:string; title:string; description:string; category:ArticleCategory; tags:readonly string[];
  publishedAt:string; updatedAt:string; author:string; editorialNote:string;
  sources:readonly ArticleSource[]; related:readonly ArticleLink[];
  projectCta:{ label:string; description:string; placement:string };
};

export const articleCategoryLabels:Record<ArticleCategory,string>={
  'field-note':'開発フィールドノート','practical-guide':'実践ガイド',beginner:'初心者向け',tool:'ツール実践',genre:'ジャンル別',comparison:'比較・選定'
};

export const articles = [
  {
    slug:'ai-fantasy',title:'AIに幻想を抱くあなたへ',description:'AIに任せれば全部うまくいく、と思っていた私が、実際の開発で何度も失敗してわかったこと。AIは魔法ではない。使う側の検証と判断が必要だ。',category:'field-note',tags:['AI活用','品質検証','失敗事例'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',author:'GameAI Hub編集部',editorialNote:'運営者の開発経験を整理したフィールドノートです。製品仕様の比較記事ではありません。',sources:[],related:[{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',kind:'guide'},{href:'/methodology/',label:'GameAI Hubの調査・評価方法',kind:'guide'}],projectCta:{label:'自分のゲームの最初の制作手順を作る',description:'丸投げせず、成果物と完了条件に分けた最初の作業を作ります。',placement:'article_end'}
  },
  {
    slug:'ai-usage-guide',title:'AIの正しい使い方',description:'AIに期待しすぎて何度も失敗した私が、初めてAIを使う人に向けて、プロンプトの書き方、失敗時の対処法、用途別のAIの使い分けを実体験ベースで整理する。',category:'practical-guide',tags:['AI活用','プロンプト','品質検証'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',author:'GameAI Hub編集部',editorialNote:'運営者の実体験に基づく実践ガイドです。各サービスの最新仕様は公式資料で別途確認してください。',sources:[],related:[{href:'/articles/ai-fantasy/',label:'AIに幻想を抱くあなたへ',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',kind:'guide'},{href:'/tools/',label:'成果物からAIツールを探す',kind:'tool'}],projectCta:{label:'自分のゲームで試す最初の作業を作る',description:'目的、制約、成果物、完了条件をゲーム案に合わせて具体化します。',placement:'article_end'}
  }
] as const satisfies readonly ArticleRecord[];

export function getArticle(slug:string):ArticleRecord|undefined{return articles.find(article=>article.slug===slug)}
export function articlePath(article:ArticleRecord){return `/articles/${article.slug}/`}
export function articleMetadata(article:ArticleRecord):Metadata{return {title:article.title,description:article.description,alternates:{canonical:articlePath(article)},openGraph:{type:'article',title:`${article.title} | GameAI Hub`,description:article.description,url:articlePath(article),publishedTime:article.publishedAt,modifiedTime:article.updatedAt,tags:[...article.tags]},authors:[{name:article.author}]}}
