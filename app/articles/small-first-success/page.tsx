import type { Metadata } from 'next';
import { ArticleFrame } from '@/components/ArticleFrame';
import { articleMetadata, getArticle } from '@/data/articles';

const article=getArticle('small-first-success')!;
export const metadata:Metadata=articleMetadata(article);

export default function SmallFirstSuccessArticle(){return <ArticleFrame article={article}><div className="article-content">
  <header className="page-head">
    <p className="eyebrow">FIELD NOTE / BEGINNER</p>
    <h1>AIでゲームを作るなら、最初の成功体験は小さい方がいい</h1>
    <p className="lead">最初から「完成したゲーム」を目標にすると、途中の失敗が何を意味するのか分からなくなる。初心者こそ、最初の成功を小さく作った方が続きやすい。</p>
  </header>

  <section><h2>「企画ができた」は、まだゲームができたではない</h2><p>AIは企画書、ロードマップ、世界観、キャラクター設定をすぐに作れる。見栄えもいい。</p><p>でも、初心者が本当に欲しいのは「自分でも作れた」という感覚だ。そのためには文章より、画面上で何かが動く方が強い。</p></section>

  <section><h2>最初の成功は30秒で説明できるくらいでいい</h2><p>キャラクターが左右に動く。ボタンを押すと台詞が変わる。敵に触れるとHPが減る。</p><p>それだけでも十分だ。重要なのは、その仕組みを自分で起動し、触って、成功を確認できること。</p></section>

  <section><h2>小さな成功は、失敗の場所も小さくする</h2><p>ゲーム全体を一気に作ると、動かなかったとき原因候補が多すぎる。コード、画像、状態管理、入力、ファイル構成、環境設定。どこが悪いのか分からない。</p><p>1機能ずつなら、問題が出た場所をかなり絞れる。</p></section>

  <section><h2>「完成度」ではなく「反応」を積み上げる</h2><p>最初は見た目が仮でもいい。効果音がなくてもいい。メニューがなくてもいい。</p><p>入力すると反応する。条件を満たすと結果が変わる。そこにゲームの核がある。</p></section>

  <section><h2>AIとの会話も短くなる</h2><p>目標が小さければ、AIへの依頼も短くできる。「この1機能を追加して。成功条件はこれ」と言える。</p><p>修正も同じ範囲で済むので、会話が長くなって前提が崩れるリスクも減る。</p></section>

  <section><h2>次の作業は、成功したもののすぐ隣に置く</h2><p>移動ができたら敵。敵が出たら接触。接触できたら勝敗。勝敗ができたら再開。</p><p>こうすると、毎回「何をすればいいか」を考え直さずに済む。</p></section>

  <section><h2>完成は、小さな確認の連続で作る</h2><p>大きなゲームでも、実際には小さな機能と確認の積み重ねだ。</p><p><strong>AI時代でも、最初の成功を小さくする価値は変わらない。</strong>むしろ生成速度が上がった分、どこまでを1回の作業にするかを人間が決めることが重要になる。</p></section>
</div></ArticleFrame>}
