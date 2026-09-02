import type { Metadata } from 'next';
import Link from 'next/link';
import { articleCategoryLabels, publishedArticles } from '@/data/articles';
export const metadata:Metadata={title:'AIゲーム開発の記事',description:'AIゲーム開発の実践、失敗、検証方法を、次の制作作業につながる形で整理した記事一覧。',alternates:{canonical:'/articles/'},openGraph:{url:'/articles/'}};
export default function ArticlesPage(){return <div className="page-shell"><header className="page-head"><p className="eyebrow">CONTENT TO BUILD</p><h1>読んだ後に、<br/>ゲーム制作を始める</h1><p className="lead">一般論の一覧ではなく、制作判断、失敗の回避、次の成果物へつながる記事を掲載します。</p><Link className="button" href="/project">自分の最初の制作手順を作る</Link></header><section><div className="stack-mini-grid">{publishedArticles.map(article=><Link key={article.slug} href={`/articles/${article.slug}`}><span>{articleCategoryLabels[article.category]} · 更新 {article.updatedAt}</span><h2>{article.title}</h2><p>{article.description}</p><b>記事を読む →</b></Link>)}</div></section></div>}
