import type { Metadata } from "next";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { BeginnerGameWorkspace } from "@/components/BeginnerGameWorkspace";
import { CopyTextButton } from "@/components/CopyTextButton";
import { articleMetadata, getArticle } from "@/data/articles";

const article = getArticle("ai-browser-game-how-to")!;
export const metadata: Metadata = articleMetadata(article);

const gameIdea = `モンスターと1対1で戦う2Dブラウザゲームを作りたい。
ゲーム制作は初めてです。まず画像と音声なしで、
たたかう・HP変化・勝利結果・もう一度を1画面に作りたい。`;

const firstGenerationPrompt = `ゲーム制作初心者向けに、2Dブラウザゲームを作ってください。

要件:
- HTML、CSS、JavaScriptを1つのindex.htmlにまとめる
- 外部ライブラリ、外部ファイル、画像、外部ネットワーク通信を使わない
- ブラウザの1画面に、味方1体と敵1体、それぞれの名前とHPを表示する
- 「たたかう」ボタンを押すと敵HPが減り、敵が倒れていなければ反撃で味方HPも減る
- 敵HPが0になったら勝利結果を文字で表示し、それ以降「たたかう」を押せなくする
- 「もう一度」ボタンでHP、結果、ボタンを初期状態へ戻す
- スマートフォン幅でも読める簡単な見た目にする

返答形式:
- 初心者がそのまま保存・貼り付けできる、動作するindex.htmlのコード全文を省略せず返す
- Markdownの説明文とコードを混ぜず、説明はコード枠の前に短く置く
- HTML全文は1つのhtmlコード枠に明確に分離する`;

const starterGame = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>はじめてのモンスターバトル</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: sans-serif; color: #17202a; background: #e8f7ef; }
    main { width: min(88%, 360px); padding: 24px; text-align: center;
      background: white; border: 3px solid #17202a; border-radius: 18px; }
    .hp { font-size: 1.1rem; font-weight: bold; }
    button { margin: 6px; padding: 12px 18px; font: inherit; font-weight: bold;
      border: 2px solid #17202a; border-radius: 10px; cursor: pointer; }
    #fight { color: white; background: #087f5b; }
  </style>
</head>
<body>
  <main>
    <h1>モンスターバトル</h1>
    <p class="hp">ゆうしゃ HP: <span id="playerHp">24</span></p>
    <p class="hp"><span id="enemyName"></span> HP: <span id="enemyHp">18</span></p>
    <p id="message" aria-live="polite">たたかうを押そう</p>
    <button id="fight">たたかう</button>
    <button id="reset">もう一度</button>
  </main>
  <script>
    const enemyName = "スライム"; // 最初の改造では、この名前だけを変える
    let playerHp = 24;
    let enemyHp = 18;
    const playerHpText = document.querySelector("#playerHp");
    const enemyHpText = document.querySelector("#enemyHp");
    const message = document.querySelector("#message");
    const fight = document.querySelector("#fight");
    document.querySelector("#enemyName").textContent = enemyName;

    function draw() {
      playerHpText.textContent = playerHp;
      enemyHpText.textContent = enemyHp;
    }
    fight.addEventListener("click", () => {
      enemyHp = Math.max(0, enemyHp - 6);
      if (enemyHp === 0) {
        message.textContent = enemyName + "に勝った！";
        fight.disabled = true;
      } else {
        playerHp = Math.max(0, playerHp - 4);
        message.textContent = enemyName + "が反撃した！";
      }
      draw();
    });
    document.querySelector("#reset").addEventListener("click", () => {
      playerHp = 24;
      enemyHp = 18;
      fight.disabled = false;
      message.textContent = "たたかうを押そう";
      draw();
    });
    draw();
  </script>
</body>
</html>`;

const changePrompt = `次のindex.htmlは、たたかう・反撃・勝利結果・もう一度まで動いています。
この動作を残したまま、敵の名前だけを「スライム」から「炎スライム」へ変えてください。
変更した行を先に説明し、その後に省略なしのHTML全文を1つのコード枠で返してください。
画像、音声、別ファイル、追加機能は加えないでください。`;

export default function AiBrowserGameHowTo() {
  return (
    <ArticleFrame article={article}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">BROWSER GAME / PLAY → CHANGE → CONTINUE</p>
          <h1>AIでブラウザゲームを作る方法｜1画面のゲームを動かし、直して次へ進む</h1>
          <p className="lead">
            読むだけで終わらないように、完成済みの <strong>index.html</strong> をこのページで動かします。
            勝利結果まで遊び、AIで同じ形を生成し、敵の名前を1か所だけ直してProject Generatorへ渡すところまでが今回のゴールです。
          </p>
          <div className="article-contract">
            <p><strong>所要の目安：</strong>まず15〜30分（AIの応答や端末操作で変わります）</p>
            <p><strong>今作る：</strong>味方と敵1体、HP、たたかう、反撃、勝利結果、もう一度</p>
            <p><strong>今は作らない：</strong>画像、音声、収集、育成、公開URL</p>
            <p><strong>完了：</strong>動作確認 → 敵名を1回変更 → 元の動作を再確認 → Projectを開始</p>
          </div>
        </header>

        <section>
          <h2>1. まず完成例を動かす</h2>
          <p>
            下には、HTML・CSS・JavaScriptをまとめた完成例が入っています。「ゲームを表示」を押してください。
            コードはブラウザ内の隔離された表示枠で実行され、外部通信はできません。それでも、知らないコードへ個人情報や秘密情報を足さないでください。
          </p>
          <BeginnerGameWorkspace
            projectId="article-ai-browser-game-how-to"
            initialCode={starterGame}
          />
          <h3>ここまでの成功条件</h3>
          <ol>
            <li>最初に「ゆうしゃ HP: 24」「スライム HP: 18」が見える。</li>
            <li>「たたかう」1回で敵HPが18→12、味方HPが24→20になる。</li>
            <li>合計3回押すと敵HPが0になり、勝利結果「スライムに勝った！」が出る。</li>
            <li>勝った後は「たたかう」を押せない。</li>
            <li>「もう一度」で双方のHPとメッセージが最初に戻る。</li>
          </ol>
          <p><strong>5つ揃うまで先へ進みません。</strong> 揃ったら、上の「この版は動いたと記録」を押して変更前へ戻れるようにします。</p>
        </section>

        <section>
          <h2>2. 3つの途中地点で完成形を読む</h2>
          <p>この1ファイルにも役割は3つあります。全部を暗記する必要はありません。</p>
          <dl className="article-lesson-grid">
            <div><dt>HTML</dt><dd>見出し、HP、メッセージ、2つのボタンを置く。</dd></div>
            <div><dt>CSS</dt><dd>1画面に収まるカードと、押せるボタンの見た目を作る。</dd></div>
            <div><dt>JavaScript</dt><dd>クリックでHPを変え、勝利結果で止め、「もう一度」で戻す。</dd></div>
          </dl>
          <p>
            途中版は「画面が見えるだけ」です。完成例との差は、ボタンを押した後の処理です。
            AIへは「ゲームを作って」だけでなく、<strong>操作 → 数値の変化 → 終了 → リセット</strong>まで指定すると、確認可能な依頼になります。
          </p>
          <pre className="article-code"><code>{`<!-- 途中版：表示はできるが、まだ遊べない -->
<h1>モンスターバトル</h1>
<p>ゆうしゃ HP: 24</p>
<p>スライム HP: 18</p>
<button>たたかう</button>
<button>もう一度</button>`}</code></pre>
          <ol className="article-checkpoints">
            <li><strong>Step A — 表示：</strong>味方・敵の名前、HP、ボタンが1画面に見える。</li>
            <li><strong>Step B — HP変化：</strong>「たたかう」で敵HPが減り、敵の反撃で味方HPも減る。</li>
            <li><strong>Step C — 結果＋もう一度：</strong>敵HPが0で勝利結果が出て停止し、初期状態へ戻せる。</li>
          </ol>
          <p>AIの出力もA→B→Cの順で確認します。Aが崩れているのにCまでまとめて直そうとせず、最初に失敗した地点を伝えます。</p>
        </section>

        <section>
          <h2>3. 最初のゲームをAIへ生成してもらう</h2>
          <p>
            完成形と途中地点を理解したら、次の指示をそのままAIへ送ります。これは特定サービスだけの機能を前提にせず、返答形式と確認可能な動作を固定する指示です。
          </p>
          <pre className="article-code"><code>{firstGenerationPrompt}</code></pre>
          <CopyTextButton label="最初のゲーム生成promptをコピー" text={firstGenerationPrompt} />
          <ol>
            <li>AIの返答から、<code>&lt;!doctype html&gt;</code> で始まり <code>&lt;/html&gt;</code> で終わるコード全文だけをコピーする。</li>
            <li>上の「ゲームのコード」をAIのコード全文で置き換え、「ゲームを表示」を押す。</li>
            <li>Step A、B、Cを順番に確認する。AIが「完成」と書いても、実際に操作できるまでは完了にしない。</li>
          </ol>
          <p>出力が要件と違う場合は、掲載完成例で動作を確認できる状態を残したまま、最初に失敗したStepと実際の表示をAIへ返します。</p>
        </section>

        <section>
          <h2>4. 変更は敵の名前1か所だけ</h2>
          <p>
            上の「ゲームのコード」で <code>const enemyName = &quot;スライム&quot;;</code> を探し、
            <code>const enemyName = &quot;炎スライム&quot;;</code> に直します。他の行は変えず、「ゲームを表示」をもう一度押します。
          </p>
          <h3>変更後の成功条件</h3>
          <ul>
            <li>敵名が「炎スライム」になった。</li>
            <li>初期HPは24と18のまま。</li>
            <li>3回で勝ち、勝った後は止まり、「もう一度」で戻る。</li>
          </ul>
          <p>
            これは小さく直してから元の機能を再確認する、最初の回帰テストです。壊れたら「動いた版へ戻す」を押し、名前の行だけをもう一度変更します。
          </p>
        </section>

        <section>
          <h2>5. 同じ変更をAIへ頼むなら、守る動作も渡す</h2>
          <p>手で直せた1変更をAIへ頼む場合は、現在のHTML全文に次の指示を添えます。AIが返した説明ではなく、HTML全文を上の欄へ貼って再実行してください。</p>
          <pre className="article-code"><code>{changePrompt}</code></pre>
          <CopyTextButton label="1変更のAI指示をコピー" text={changePrompt} />
          <p>
            AIが画像や別ファイルを加えた、コードを途中で省略した、元のHP変化や勝利結果が消えた場合は採用しません。「動いた版へ戻す」で復旧し、現在のコード全文と失敗した結果を添えて同じ1変更を頼み直します。
          </p>
        </section>

        <section>
          <h2>6. 動かないときは症状から1つ戻る</h2>
          <ul>
            <li><strong>ゲームを表示できない：</strong>コードの先頭が <code>&lt;!doctype html&gt;</code>、末尾が <code>&lt;/html&gt;</code> か確認する。説明文や <code>```</code> は除く。</li>
            <li><strong>白い画面／ボタンが反応しない：</strong>表示枠の下にエラーが出たら内容をコピーする。PCならConsoleの最初の赤いエラーと行番号も使える。</li>
            <li><strong>変更後だけ壊れた：</strong>「動いた版へ戻す」。変更前が動くことを再確認し、変更を敵名1行だけに戻す。</li>
            <li><strong>コードが消えそう：</strong>動いた状態で「index.htmlを保存」。再開時は「保存したゲームを開く」から選び、実行し直す。</li>
          </ul>
          <p>相談時は「押した操作」「期待した表示」「実際の表示」「エラー」の4点だけを渡します。個人情報、秘密、入力したくないコードは送らないでください。</p>
        </section>

        <section className="article-inline-handoff">
          <p className="eyebrow">CONTINUE THE SAME GAME</p>
          <h2>7. 動いたゲームを、Projectの最初の作業へつなぐ</h2>
          <p>
            ここで作ったのは共通の練習例です。次は、自分のゲーム条件を固定します。下の案をコピーしてProject Generatorを開き、入力欄へ貼ってください。
            Project側でも「1対1」「ブラウザ」「たたかう・勝利結果・もう一度」が残っていることを確認してから生成します。
          </p>
          <pre className="article-code"><code>{gameIdea}</code></pre>
          <CopyTextButton label="Project用のゲーム案をコピー" text={gameIdea} />
          <p>
            <ArticleProjectLink
              slug="ai-browser-game-how-to"
              label="同じゲームの制作ロードマップを作る"
              placement="article_body_after_exercise"
            />
          </p>
          <h3>Projectへ進めたと言える状態</h3>
          <ul>
            <li>条件確認にブラウザゲームと1対1の戦闘が残っている。</li>
            <li>最初の作業に、操作できる1画面と観察可能な完了条件がある。</li>
            <li>Projectで生成したコードも、貼る → 表示 → 確認 → 動いた版を記録、の順で検証できる。</li>
          </ul>
        </section>
      </div>
    </ArticleFrame>
  );
}
