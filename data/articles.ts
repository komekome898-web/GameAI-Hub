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
    slug:'ai-browser-game-how-to',title:'AIでブラウザゲームを作る方法｜1画面のゲームを動かし、直して次へ進む',description:'初心者がAIの返した1つのindex.htmlを貼り付けて実行し、勝敗とやり直しを確認し、保存・復旧して同じゲームの次の作業へ進む手順。',category:'beginner',tags:['AIゲーム開発','ブラウザゲーム','初心者','HTML'],publishedAt:'2026-09-04',updatedAt:'2026-09-04',publicationStatus:'published',lastVerifiedAt:'2026-09-04',author:'GameAI Hub編集部',editorialNote:'Project Generatorの条件保持と、検証用HTMLによる貼付・実行・保存・復旧・次タスクの画面操作を確認した初心者向け手順です。外部AIの出力は毎回同一とは限りません。',sources:[{label:'MDN: HTML basics',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content',kind:'primary',verifiedAt:'2026-09-04'},{label:'Chrome DevTools: Console overview',url:'https://developer.chrome.com/docs/devtools/console/',kind:'primary',verifiedAt:'2026-09-04'},{label:'GitHub Docs: Asking GitHub Copilot questions in GitHub',url:'https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-github',kind:'primary',verifiedAt:'2026-09-04'}],related:[{href:'/articles/before-asking-ai-build-game/',label:'AIへ頼む前に決める5項目',reason:'別のゲーム案でも最初の範囲と完了条件を決める',kind:'article'},{href:'/guides/ai-2d-rpg-workflow/',label:'AIで2D RPGを作る制作フロー',reason:'1画面の試作から長い制作工程へ広げる順序を確認する',kind:'guide'},{href:'/methodology/',label:'GameAI Hubの調査・評価方法',reason:'ツール情報の確認済み・不明の分け方を見る',kind:'reference'}],projectCta:{label:'自分のブラウザゲームを「最初の1プレイ」に分ける',description:'条件を確認し、今作るもの・作らないもの・完了条件を固定して、1つのindex.htmlを動かす作業へ進みます。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-fantasy',title:'AIに幻想を抱くあなたへ',description:'AIに任せれば全部うまくいく、と思っていた私が、実際の開発で何度も失敗してわかったこと。AIは魔法ではない。使う側の検証と判断が必要だ。',category:'field-note',tags:['AI活用','品質検証','失敗事例'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'運営者の開発経験を整理したフィールドノートです。製品仕様の比較記事ではありません。',sources:[],related:[{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',reason:'失敗を防ぐ具体的な指示と検証の型へ進む',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',reason:'考え方を検証可能な実装タスクへ変える',kind:'guide'},{href:'/methodology/',label:'GameAI Hubの調査・評価方法',reason:'確認済み情報と不明情報の扱いを確認する',kind:'reference'}],projectCta:{label:'自分のゲームの最初の制作手順を作る',description:'丸投げせず、成果物と完了条件に分けた最初の作業を作ります。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-usage-guide',title:'AIの正しい使い方',description:'AIに期待しすぎて何度も失敗した私が、初めてAIを使う人に向けて、プロンプトの書き方、失敗時の対処法、用途別のAIの使い分けを実体験ベースで整理する。',category:'practical-guide',tags:['AI活用','プロンプト','品質検証'],publishedAt:'2026-08-29',updatedAt:'2026-08-29',publicationStatus:'published',lastVerifiedAt:'2026-08-29',author:'GameAI Hub編集部',editorialNote:'運営者の実体験に基づく実践ガイドです。各サービスの最新仕様は公式資料で別途確認してください。',sources:[{label:'OpenAI: GPT-5.6 in ChatGPT',url:'https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt/',kind:'primary',verifiedAt:'2026-08-29'},{label:'Anthropic: Claude Opus 5',url:'https://www.anthropic.com/news/claude-opus-5',kind:'primary',verifiedAt:'2026-08-29'},{label:'Google: Gemini 3',url:'https://blog.google/products-and-platforms/products/gemini/gemini-3/',kind:'primary',verifiedAt:'2026-08-29'}],related:[{href:'/articles/ai-fantasy/',label:'AIに幻想を抱くあなたへ',reason:'AIへ任せる範囲と人が確認する範囲を整理する',kind:'article'},{href:'/guides/codex-game-development-brief/',label:'Codexへ渡す実装ブリーフ',reason:'目的・制約・完了条件を実装単位へ落とす',kind:'guide'},{href:'/tools/',label:'成果物からAIツールを探す',reason:'必要な成果物が決まった後に公式根拠を確認する',kind:'tool'}],projectCta:{label:'自分のゲームで試す最初の作業を作る',description:'目的、制約、成果物、完了条件をゲーム案に合わせて具体化します。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-delegation-trap',title:'AIにゲーム開発を丸投げすると、なぜ途中で詰むのか',description:'AIにゲーム全体を一気に作らせるより、最小の1プレイと観察できる完了条件に分けた方が初心者は進みやすい。AIゲーム開発を丸投げしないための実践的な考え方。',category:'field-note',tags:['AIゲーム開発','初心者','制作フロー','失敗回避'],publishedAt:'2026-09-02',updatedAt:'2026-09-02',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'GameAI Hubの開発・初心者導線設計で得た経験を整理したフィールドノートです。特定サービスの性能比較や最新仕様を扱う記事ではありません。',sources:[],related:[{href:'/articles/ai-fantasy/',label:'AIに幻想を抱くあなたへ',reason:'AIへ期待しすぎると何が起きるか、実際の失敗例から確認する',kind:'article'},{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',reason:'大きな依頼を目的・制約・完了条件へ分ける具体的な型へ進む',kind:'article'},{href:'/guides/ai-2d-rpg-workflow/',label:'AIで2D RPGを作る制作フロー',reason:'小さな成果物を積み上げる実際のゲーム制作順へ進む',kind:'guide'}],projectCta:{label:'自分のゲームを「最初の1作業」に分ける',description:'作りたいゲームから、今作る成果物・使うAI・完了条件までを1ステップに絞ります。',placement:'article_end'},promotions:[]
  },
  {
    slug:'before-asking-ai-build-game',title:'AIに「ゲームを作って」と頼む前に決めるべき5つのこと',description:'AIへゲーム制作を頼む前に、最初の1プレイ、実行環境、成果物、完了条件、次の1作業を決める。初心者がAIゲーム開発を始める前の実践チェック。',category:'field-note',tags:['AIゲーム開発','初心者','企画','制作フロー'],publishedAt:'2026-09-02',updatedAt:'2026-09-02',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'初心者向け制作導線の設計経験から、AIへ依頼する前に決める作業単位を整理したフィールドノートです。',sources:[],related:[{href:'/articles/ai-delegation-trap/',label:'AIにゲーム開発を丸投げすると、なぜ途中で詰むのか',reason:'依頼を大きくしすぎたときに起こる問題を先に確認する',kind:'article'},{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',reason:'目的・制約・完了条件を具体的な指示へ変える',kind:'article'},{href:'/guides/ai-2d-rpg-workflow/',label:'AIで2D RPGを作る制作フロー',reason:'小さな成果物を積み上げる順序の例を見る',kind:'guide'}],projectCta:{label:'自分のゲームの最初の1作業を決める',description:'ゲーム案から、最初の成果物・使うAI・完了条件を具体化します。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-completion-claim',title:'AIが「完成しました」と言っても信用してはいけない理由',description:'AIの「完成」「修正済み」「問題なし」を最終判断にせず、実物・再現手順・観察可能な完了条件で確認するための品質管理の考え方。',category:'field-note',tags:['AI活用','品質検証','レビュー','失敗回避'],publishedAt:'2026-09-02',updatedAt:'2026-09-02',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'AI開発での受入テスト経験から、AIの自己報告と実際の成果物を分けて考える方法を整理したフィールドノートです。',sources:[],related:[{href:'/articles/ai-fantasy/',label:'AIに幻想を抱くあなたへ',reason:'AIの自己評価と実画面の差が起きた失敗例を読む',kind:'article'},{href:'/articles/ai-delegation-trap/',label:'AIにゲーム開発を丸投げすると、なぜ途中で詰むのか',reason:'完成判定以前に作業を小さく分ける理由を確認する',kind:'article'},{href:'/methodology/',label:'GameAI Hubの調査・評価方法',reason:'確認済み情報と不明情報をどう分けるかを見る',kind:'reference'}],projectCta:{label:'成果物と完了条件から最初の作業を作る',description:'AIの自己申告ではなく、自分で確認できる完了条件を持つ制作手順に変えます。',placement:'article_end'},promotions:[]
  },
  {
    slug:'ai-tool-comparison-later',title:'ゲーム開発初心者ほど、AIツール比較を後回しにした方がいい',description:'AIツールを先に大量比較するより、今必要な成果物を決めてから選ぶ方が初心者は迷いにくい。制作工程の中でAIを選ぶ考え方。',category:'field-note',tags:['AIゲーム開発','初心者','ツール選び','比較'],publishedAt:'2026-09-02',updatedAt:'2026-09-02',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'初心者向けGameAI Hubの設計思想をもとに、ツール比較を制作工程の後段へ置く理由を整理したフィールドノートです。特定サービスのランキング記事ではありません。',sources:[],related:[{href:'/articles/before-asking-ai-build-game/',label:'AIに「ゲームを作って」と頼む前に決めるべき5つのこと',reason:'ツールを選ぶ前に決める成果物と完了条件を整理する',kind:'article'},{href:'/articles/ai-usage-guide/',label:'AIの正しい使い方',reason:'AIへ任せる役割を作業単位で考える',kind:'article'},{href:'/tools/',label:'成果物からAIツールを探す',reason:'必要な成果物が決まった段階で候補を確認する',kind:'tool'}],projectCta:{label:'先に作るものを決めてからAIを選ぶ',description:'あなたのゲームで今必要な成果物を特定し、その作業に合うAI候補まで絞ります。',placement:'article_end'},promotions:[]
  },
  {
    slug:'small-first-success',title:'AIでゲームを作るなら、最初の成功体験は小さい方がいい',description:'企画書ではなく、キャラクターが動く・台詞が進むなど小さなプレイ可能状態を最初の成功にする。AIゲーム開発を続けやすくする進め方。',category:'field-note',tags:['AIゲーム開発','初心者','プロトタイプ','制作フロー'],publishedAt:'2026-09-02',updatedAt:'2026-09-02',publicationStatus:'published',author:'GameAI Hub編集部',editorialNote:'初心者向け制作フローの設計経験から、最初の成功体験を小さくする理由を整理したフィールドノートです。',sources:[],related:[{href:'/articles/ai-delegation-trap/',label:'AIにゲーム開発を丸投げすると、なぜ途中で詰むのか',reason:'大きな依頼を小さな制作単位へ分ける理由を確認する',kind:'article'},{href:'/articles/before-asking-ai-build-game/',label:'AIに「ゲームを作って」と頼む前に決めるべき5つのこと',reason:'最初の成果物と完了条件を具体的に決める',kind:'article'},{href:'/guides/ai-2d-rpg-workflow/',label:'AIで2D RPGを作る制作フロー',reason:'小さな成功を次の機能へ積み上げる例を見る',kind:'guide'}],projectCta:{label:'最初の「動いた」を作る1作業を決める',description:'ゲーム全体ではなく、最初に確認できる小さな成功までの手順を作ります。',placement:'article_end'},promotions:[]
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
