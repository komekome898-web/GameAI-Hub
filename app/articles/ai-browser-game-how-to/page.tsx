import type { Metadata } from 'next';
import { ArticleFrame } from '@/components/ArticleFrame';
import { articleMetadata, getArticle } from '@/data/articles';

const article=getArticle('ai-browser-game-how-to')!;
export const metadata:Metadata=articleMetadata(article);

export default function AiBrowserGameHowTo(){return <ArticleFrame article={article}><div className="article-content">
  <header className="page-head">
    <p className="eyebrow">BROWSER GAME / ONE PLAYABLE FILE</p>
    <h1>AIでブラウザゲームを作る方法｜1画面のゲームを動かし、直して次へ進む</h1>
    <p className="lead">最初に作るのは、画像も音声もない1対1のモンスターバトルです。AIから受け取る成果物は<strong>HTML・CSS・JavaScriptをまとめた1つの index.html</strong>。GameAI Hubへ貼って動かし、攻撃・勝敗・やり直しを自分で確認します。</p>
    <div className="article-contract"><p><strong>今作る：</strong>味方と敵1体ずつ、HP、攻撃と反撃、勝敗、もう一度</p><p><strong>今は作らない：</strong>画像、音声、収集、育成、図鑑、公開URL</p><p><strong>成功：</strong>操作して勝敗まで進み、終了後に攻撃が止まり、最初からやり直せる</p></div>
  </header>

  <section><h2>1. 始める前に用意するもの</h2><p>この手順の確認環境は、パソコンの新しいブラウザ、GameAI Hub、GitHub Copilotのチャットです。特定のエディターやゲームエンジンは使いません。外部AIではログイン等が必要になる場合があり、利用条件や上限はその画面で確認してください。</p><ul><li>このページとProject Generatorを開けるブラウザ</li><li>AIへ指示を送り、返答をコピーできる状態</li><li>ダウンロードした <code>index.html</code> を残す場所</li></ul><p>スマートフォンでもProject内のプレビューは操作できますが、外部AIとの往復やファイル保存は端末・ブラウザで異なります。この手順ではパソコンを基準にします。</p></section>

  <section><h2>2. ゲーム案を、そのまま条件確認へ渡す</h2><p>Project Generatorで次の内容を入力します。これは魔法のプロンプトではなく、今回検証する範囲を固定するための条件です。</p><pre className="article-code"><code>モンスターと1対1で戦う2Dブラウザゲームを作りたい。{`\n`}ゲーム制作は初めてです。まず画像と音声なしで、{`\n`}たたかう・勝敗・やり直しを作りたい。</code></pre><p><strong>次の操作：</strong>「制作ロードマップを作る」を押し、条件確認に「戦闘」と入力文が残っていることを確認します。違っていれば詳細条件で直し、確認できるまで生成へ進みません。</p></section>

  <section><h2>3. 最初のタスクをAIへ渡す</h2><p>条件を確認すると、最初の作業は「1対1のバトルを動かす」です。「この指示をコピー」→「GitHub Copilotのチャットを開く」の順に押し、チャット欄へ貼って送ります。</p><p>返答では、<code>&lt;!doctype html&gt;</code> 付近から <code>&lt;/html&gt;</code> までのコード全文をコピーします。説明文や、コードの前後にある <code>```</code> は含めません。AIが「完成」と書いても、まだ完了にはしません。</p></section>

  <section><h2>4. コードを貼り、ゲームを実行する</h2><ol><li>GameAI Hubへ戻る。</li><li>「ゲームのコード」に、コピーしたHTML全文を貼る。</li><li>「ゲームを表示」を押す。</li><li>表示枠の「攻撃」または「たたかう」を押して、HPの変化を見る。</li></ol><p><strong>成功の観察：</strong>味方と敵の名前・HPが見える／攻撃で双方のHPが変わる／勝ちか負けが文字で出る／終了後は攻撃できない／「もう一度」で初期HPへ戻る。勝敗の両方を確認できない場合は、そのまま「できた」にせず相談します。</p></section>

  <section><h2>5. 表示されないときは、失敗地点を1つずつ見る</h2><ul><li><strong>入力エラー：</strong>HTML全文を貼ったか、説明文や囲み記号だけを貼っていないか確認する。</li><li><strong>白い画面：</strong>Projectの「ここで詰まった」を開き、起きた操作と表示を一言書く。現在タスクと完了条件を含む相談文が作られる。</li><li><strong>パソコンで詳しく見る：</strong>ブラウザの開発者ツール（ChromeではF12等）からConsoleを開き、最初の赤いエラーと行番号をコピーして相談文へ加える。ブラウザや端末により開き方は異なる。</li></ul><p>GameAI Hubがすべてのログを自動取得するわけではありません。また、不明なコードの安全性を保証しません。個人情報や秘密情報はコードや相談文へ入れないでください。</p></section>

  <section><h2>6. 動いた状態を保存し、壊れても戻れるようにする</h2><ol><li>動作確認後、「この版は動いたと記録」を押す。</li><li>「index.htmlを保存」を押し、ダウンロード先を確認する。</li><li>「保存したゲームを開く」で同じファイルを選ぶ。</li><li>もう一度「ゲームを表示」を押し、攻撃・勝敗・やり直しを試す。</li></ol><p>「動いた版」はこの端末のブラウザ内の復旧用記録です。ダウンロードしたHTMLは別のバックアップです。どちらもゲーム中のHPをセーブする機能や、公開URLを作る機能ではありません。</p></section>

  <section><h2>7. 最初の改造は1つだけにする</h2><p>最初のタスクを完了すると、同じHTMLを使う次タスクが表示されます。変更前にもう一度 <code>index.html</code> を保存し、たとえばタイトルと「はじめる」を追加する1変更だけを依頼します。</p><p>変更後も、元の攻撃・HP・勝敗・やり直しをすべて再確認します。壊れたら「動いた版へ戻す」か「保存したゲームを開く」で変更前へ戻り、変更を小さくしてやり直します。</p></section>

  <section><h2>8. 「できた」の後も、同じ成果物を次へ渡す</h2><p>完了条件を一つずつチェックして「できた — 次の作業へ」を押します。次の作業は別のゲームを作り直すのではなく、いま動いたHTMLを受け取ります。詰まった場合も、現在の作業・期待する成果物・完了条件を含む相談文を同じAIへ渡せます。</p><p>公開や再デプロイは、ローカルで遊べる状態とは別工程です。この最初のpillarでは公開先を決めません。まず、戻せる小さな完成状態を手元に残します。</p></section>
</div></ArticleFrame>}
