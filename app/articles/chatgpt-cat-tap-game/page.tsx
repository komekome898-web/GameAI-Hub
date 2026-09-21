import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { BeginnerGameWorkspace } from "@/components/BeginnerGameWorkspace";
import { CopyTextButton } from "@/components/CopyTextButton";
import { articleMetadata, getArticle } from "@/data/articles";

const article = getArticle("chatgpt-cat-tap-game")!;
const baseMetadata = articleMetadata(article);
export const metadata: Metadata = {
  ...baseMetadata,
  title: "ChatGPTで猫タップゲームを作る【初心者向け】HTMLですぐ遊べる",
  description:
    "ChatGPTへそのまま渡せるpromptと1ファイルの完成例で、猫のタップ／クリック、スコア0→1→2、リセットを作って確認する初心者向け手順。",
};

const firstPrompt = `プログラミング初心者向けに、猫をタップ／クリックして遊ぶブラウザゲームを作ってください。

必須条件:
- HTML、CSS、JavaScriptを1つのindex.htmlにまとめる
- 外部ライブラリ、外部画像、API、外部ネットワーク通信を使わない
- 1画面に、大きく見える猫（絵文字の🐱でよい）、スコア、リセットボタンを表示する
- スコアの初期値は0
- 猫をタップまたはクリックするたび、スコアを必ず1だけ増やす
- リセットボタンでスコアを0に戻す
- キーボードでも猫を操作でき、スマートフォン幅でも文字とボタンが読めるようにする

返答形式:
- そのまま保存して動かせるindex.htmlの全文を、省略せず1つのhtmlコード枠で返す
- コード枠の中に説明文やMarkdownの記号を入れない
- 頼んでいない移動、ゴール、収集、戦闘の仕組みは追加しない`;

const catTapGame = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>猫タップゲーム</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: system-ui, sans-serif; color: #30251f; background: #fff3d9; }
    main { width: min(90%, 360px); padding: 28px; text-align: center;
      background: white; border: 3px solid #30251f; border-radius: 24px; }
    #cat { display: block; width: 100%; min-height: 150px; margin: 18px 0;
      font-size: 6rem; border: 0; border-radius: 20px; cursor: pointer;
      background: #ffd166; touch-action: manipulation; }
    #cat:focus-visible, #reset:focus-visible { outline: 4px solid #176b87; outline-offset: 3px; }
    #score { font-size: 2rem; font-weight: 800; }
    #reset { padding: 12px 20px; font: inherit; font-weight: 700;
      border: 2px solid #30251f; border-radius: 10px; background: white; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <h1>猫タップゲーム</h1>
    <p id="score" aria-live="polite">スコア: 0</p>
    <button id="cat" aria-label="猫をタップしてスコアを増やす">🐱</button>
    <button id="reset">リセット</button>
  </main>
  <script>
    let score = 0;
    const scoreText = document.querySelector("#score");
    document.querySelector("#cat").addEventListener("click", () => {
      score += 1;
      scoreText.textContent = "スコア: " + score;
    });
    document.querySelector("#reset").addEventListener("click", () => {
      score = 0;
      scoreText.textContent = "スコア: 0";
    });
  </script>
</body>
</html>`;

const recoveryTemplate = `次のindex.htmlを実行しましたが、期待どおりに動きません。

押した操作: 猫を2回クリックした
期待した結果: スコアが0→1→2と1ずつ増える
実際の結果: （画面で見えたことをそのまま書く）
表示されたエラー: （エラー全文と行番号。表示がなければ「表示なし」）

下のHTML全文を確認し、原因を1つずつ説明してください。猫をタップ／クリックしてスコアを1増やす仕組みとリセットは残し、修正版のindex.html全文を省略せず返してください。

（ここに、今実行したindex.htmlの全文を貼る）`;

export const projectIdea = `猫をタップするとスコアが1増える、1画面の2Dブラウザゲームを作りたいです（パソコンでは猫をクリックします）。
今は猫、スコア0→1→2、リセットまで動いています。
この仕組みを壊さず、初心者が次に行う小さな制作taskと確認条件を決めたいです。`;

export default function ChatGptCatTapGame() {
  return (
    <ArticleFrame article={article} showProjectCta={false}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">CHATGPT / FIRST PLAYABLE GAME</p>
          <h1>ChatGPTで猫タップゲームを作る</h1>
          <p className="lead">
            コードを書いたことがなくても、最初に作るものを小さく固定すれば、画面を見ながら確認できます。この記事では、
            <strong>猫をタップ／クリックするたびスコアが1増える、1画面のブラウザゲーム</strong>を作ります。
          </p>
          <div className="article-contract">
            <p><strong>完成物：</strong>見える猫、0から始まるスコア、1ずつの加算、リセット</p>
            <p><strong>必要なもの：</strong>ChatGPTへpromptを入力する手段と、このページの動作確認欄</p>
            <p><strong>不要：</strong>外部画像、ライブラリ、API、ログイン機能、移動・収集・戦闘</p>
            <p><strong>完了：</strong>0→1→2→0を自分で操作し、猫の色を1回変え、同じゲームをProjectへ渡す</p>
          </div>
        </header>

        <section>
          <h2>1. まず完成例を遊ぶ</h2>
          <p>「ゲームを表示」を押し、表示された猫を2回押してから「リセット」を押してください。コードはこのページ内の隔離された表示枠で動き、外部通信は使いません。</p>
          <BeginnerGameWorkspace projectId="article-chatgpt-cat-tap-game" initialCode={catTapGame} />
          <h3>目で確認する完了条件</h3>
          <ol>
            <li>猫の絵と「スコア: 0」と「リセット」が同じ画面に見える。</li>
            <li>猫を1回押すと「スコア: 1」、もう1回押すと「スコア: 2」になる。</li>
            <li>「リセット」を押すと「スコア: 0」に戻る。</li>
            <li>リセット後に猫を押すと、再び0→1と増える。</li>
          </ol>
          <p>見た目が表示されただけでは完成ではありません。4つを実際に操作できたら、「この版は動いたと記録」を押して復旧用の版を残します。</p>
        </section>

        <section>
          <h2>2. ChatGPTへ最初のコードを頼む</h2>
          <p>次のpromptをコピーしてChatGPTの入力欄へ貼ります。返答から <code>&lt;!doctype html&gt;</code> で始まるHTML全文だけをコピーし、上の「ゲームのコード」を置き換えて「ゲームを表示」を押してください。</p>
          <pre className="article-code"><code>{firstPrompt}</code></pre>
          <CopyTextButton label="猫タップゲームのpromptをコピー" text={firstPrompt} />
          <p>返されたコードの見た目や変数名が掲載例と違っても、上の完了条件をすべて満たせば成功です。AIが「完成」と書いたことではなく、あなたが0→1→2→0を確認したことを基準にします。</p>
        </section>

        <section>
          <h2>3. 最初の成功後は、猫の色だけ変える</h2>
          <p>掲載例へ戻してから、コード内の <code>background: #ffd166;</code> を <code>background: #bde0fe;</code> に変え、もう一度「ゲームを表示」を押します。これは猫のボタン背景を黄色から水色へ変えるだけです。</p>
          <h3>変更後の確認</h3>
          <ul>
            <li>猫の背景色が変わっている。</li>
            <li>猫を押すと、変わらず0→1→2と増える。</li>
            <li>リセットで0に戻る。</li>
          </ul>
          <p>スコアの仕組みは変えません。壊れた場合は「動いた版へ戻す」を押し、色の値1か所だけを再度変更します。</p>
        </section>

        <section>
          <h2>4. 動かないときは、見えた症状から戻す</h2>
          <dl className="article-lesson-grid">
            <div><dt>ゲーム欄に何も表示されない</dt><dd>説明文や <code>```html</code> を除き、<code>&lt;!doctype html&gt;</code> から <code>&lt;/html&gt;</code> までを貼り直します。</dd></div>
            <div><dt>猫は見えるが、押しても0のまま</dt><dd>猫を1回押してから、表示枠の下に出たエラー全文と行番号をコピーします。エラーがなければ「表示なし」と書きます。</dd></div>
            <div><dt>1回で2以上増える</dt><dd>「1回押したら0から2になった」と回数と数値を記録します。連打ではなく、1回ずつゆっくり押して再確認します。</dd></div>
            <div><dt>リセットしても0に戻らない</dt><dd>リセット前の数値、押した後の数値、エラーを記録します。変更前が動いたなら「動いた版へ戻す」で復旧します。</dd></div>
          </dl>
          <h3>AIへ返すものはこの4点＋HTML全文</h3>
          <p><strong>押した操作、期待した結果、実際の結果、表示されたエラー</strong>を曖昧にせず、今実行したHTML全文と一緒に渡します。スクリーンショットだけ、または「動きません」だけでは、AIが同じ状態を確認できません。</p>
          <pre className="article-code"><code>{recoveryTemplate}</code></pre>
          <CopyTextButton label="不具合をAIへ返す型をコピー" text={recoveryTemplate} />
          <p>個人情報や秘密の値は貼らないでください。直したコードを受け取ったら、説明ではなくHTML全文を動かし、0→1→2→0をもう一度確認します。</p>
        </section>

        <section>
          <h2>5. もっと基本から確認したいとき</h2>
          <p>HTML全文のコピー、保存、動いた版への復旧を詳しく確認したい場合は、<Link href="/articles/ai-browser-game-how-to/">AIでブラウザゲームを作る方法</Link>へ進んでください。この猫ゲームと同じく、1つのindex.htmlを動かす手順です。</p>
        </section>

        <section className="article-inline-handoff">
          <p className="eyebrow">NEXT: KEEP THE SAME GAME</p>
          <h2>6. 次は同じ猫タップゲームをProjectへ渡す</h2>
          <p>最初の成功後の次の行動は、機能を思いつきで増やすことではなく、今動いている条件をProject Generatorへ渡して次の小さなtaskを決めることです。下のゲーム案をコピーしてから進み、条件確認でも<strong>猫、タップ／クリック、スコアが1ずつ増える</strong>の3点が残っていることを確認してください。</p>
          <pre className="article-code"><code>{projectIdea}</code></pre>
          <CopyTextButton label="Project用の猫タップゲーム案をコピー" text={projectIdea} />
          <p><ArticleProjectLink slug="chatgpt-cat-tap-game" label="同じ猫タップゲームの次の制作手順を作る" placement="article_body_after_first_success" /></p>
          <h3>Projectへ渡せたと言える状態</h3>
          <ul>
            <li>ゲーム案に猫が見える。</li>
            <li>操作がタップ／クリックのままである。</li>
            <li>スコアが1ずつ増える条件と、今はリセットまで動くことが残っている。</li>
            <li>移動、ゴール、収集、戦闘など、頼んでいない仕組みに置き換わっていない。</li>
          </ul>
        </section>
      </div>
    </ArticleFrame>
  );
}
