import type { Metadata } from 'next';
import { ArticleFrame } from '@/components/ArticleFrame';
import { articleMetadata, getArticle } from '@/data/articles';

const article=getArticle('before-asking-ai-build-game')!;
export const metadata:Metadata=articleMetadata(article);

export default function BeforeAskingAiBuildGameArticle(){return <ArticleFrame article={article}><div className="article-content">
  <header className="page-head">
    <p className="eyebrow">FIELD NOTE / BEGINNER</p>
    <h1>AIに「ゲームを作って」と頼む前に決めるべき5つのこと</h1>
    <p className="lead">AIへ長いプロンプトを書く前に、決めておいた方がいいことがある。ゲームの世界観でも、使うAIでもない。最初に作る範囲と、完成を判断する基準だ。</p>
  </header>

  <section><h2>1. 最初に遊べる瞬間を1つだけ決める</h2><p>「RPGを作る」「モンスターゲームを作る」では大きすぎる。最初は、プレイヤーが動く、敵を1体倒せる、会話を1回進められる、といった1つの遊びに絞る。</p><p>最初の目標はゲーム全体ではなく、<strong>ゲームらしい反応が1つ返ってくる状態</strong>でいい。</p></section>

  <section><h2>2. どこで動かすかを決める</h2><p>ブラウザなのか、Unityなのか、Godotなのか。ここが曖昧だと、AIはもっともらしい別々の前提を混ぜることがある。</p><p>初心者なら、まず「ブラウザで開く」のように確認方法まで単純な環境を選ぶと、成功と失敗を見分けやすい。</p></section>

  <section><h2>3. 最初の成果物を決める</h2><p>AIに「いい感じに作って」と頼むのではなく、「このファイルができる」「この画面が表示される」のように成果物を指定する。</p><p>成果物がない依頼は、会話が進んだことを開発が進んだことと勘違いしやすい。</p></section>

  <section><h2>4. 完了条件を目で確認できる形にする</h2><p>「完成」「品質が高い」「ちゃんと動く」は、人によって意味が違う。</p><p>代わりに「左右キーで動く」「敵に触れるとHPが減る」「ゲームオーバー後に再開できる」のように書く。AIの自己評価ではなく、自分で確認できる条件にする。</p></section>

  <section><h2>5. 次に何を足すかを1つだけ決める</h2><p>最初の成果物が動いたら、その次も小さくする。移動の次は敵、敵の次は勝敗、勝敗の次はUI、といった具合だ。</p><p>先の100工程を全部決める必要はない。次の1工程が分かれば前に進める。</p></section>

  <section><h2>ツール選びは、その後でいい</h2><p>初心者ほど「どのAIが一番いいか」を先に調べがちだが、成果物が決まっていなければ比較基準も決まらない。</p><p>コードが必要なのか、画像が必要なのか、音声が必要なのか。それが分かってからツールを選ぶ方が、判断はずっと簡単になる。</p></section>

  <section><h2>良いプロンプトより、良い作業単位</h2><p>AIゲーム開発では、文章力より作業の切り方の方が重要になる場面が多い。</p><p><strong>最初の1プレイ、成果物、完了条件、次の1作業。</strong>この4つが決まっていれば、AIへの依頼はかなり短くできる。</p></section>
</div></ArticleFrame>}
