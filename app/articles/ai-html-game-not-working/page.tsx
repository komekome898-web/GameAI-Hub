import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleHeader } from "@/components/ArticleHeader";
import { CopyTextButton } from "@/components/CopyTextButton";
import { HtmlGameDebugDemo } from "@/components/HtmlGameDebugDemo";
import { articleMetadata, getArticle } from "@/data/articles";

const article = getArticle("ai-html-game-not-working")!;
export const metadata = articleMetadata(article);

const troubleshootingPrompt = `操作: 「たたかう」3回で勝った後、「もう一度」を押した。
期待: HPが24／18に戻り、2回目も攻撃して勝利まで遊べる。
実際: HPは戻るが、攻撃ボタンが反応しない。
エラー: Consoleに例外は出ない。
関連コード: ボタンのHTML、勝利時とリセット時の処理を添付する。

原因と最小限の変更箇所を説明してください。
勝利後に攻撃を止める動作は残し、リセット後に攻撃できるようにしてください。
変更したコードと、初回・リセット・2回目を確かめる手順を返してください。`;

export default function HtmlGameNotWorkingArticle() {
  return (
    <ArticleFrame article={article} showProjectCta={false}>
      <div className="article-content">
        <ArticleHeader article={article} eyebrow="HTML GAME / TROUBLESHOOTING" title={article.title}
          lead={<>ボタンが反応しないときは、元のファイルを残し、押した順番と最初のエラーを確かめます。1画面のバトルで、初めから止まる不具合と、遊び直すと止まる不具合を直してみましょう。</>}>
          <p>例を試す前に、自分のゲームを別のファイルへ保存してください。</p>
        </ArticleHeader>

        <section id="symptoms">
          <h2>自分の症状から読む</h2>
          <ul>
            <li><a href="#syntax">最初から反応せず、SyntaxErrorが出る</a></li>
            <li><a href="#selector">nullやaddEventListenerを含むTypeErrorが出る</a></li>
            <li><a href="#reset">1回目は遊べるが、やり直すと反応しない</a></li>
            <li><a href="#first-error">白い画面など、原因がまだ分からない</a></li>
          </ul>
          <p>症状だけで原因は決まりません。下の例は、<a href="/articles/ai-browser-game-how-to/">ブラウザゲームの作り方</a>の掲載例に不具合を1つずつ入れた練習です。</p>
        </section>

        <section id="first-error">
          <h2>元のファイルを残し、最初のエラーを見る</h2>
          <ol>
            <li>元のindex.htmlを複製し、修正はコピーで行う。動いた版があるなら、それも残す。</li>
            <li>PCではゲームを開き、右クリックの「検証」からConsoleを開く。ログを消して再読み込みし、ゲームに関係する最初の赤いエラーと行番号を記録する。</li>
            <li>エラーがなければ、押した順番、期待した表示、実際の表示を記録する。再読み込みで直ったか、勝利後のリセットで再発するかも確かめる。</li>
          </ol>
          <p>GameBuildiaryの表示枠なら、枠の下のエラー概要も使えます。参考行番号は貼ったコードとずれる場合があります。修正後は「ゲームを表示」を押して、実行する版を更新してください。</p>
          <p>白い画面の場合は、保存したHTMLにゲームの要素があるか、JavaScriptで画面を作る構造かも確認します。今回の例のように、JavaScriptが止まっても静的な文字やボタンが残るゲームがあります。</p>
        </section>

        <section id="syntax">
          <h2>例1 値が抜けてSyntaxErrorになる</h2>
          <pre className="article-code"><code>{'// 壊れた行\nconst enemyName = ;\n\n// 修正\nconst enemyName = "スライム";'}</code></pre>
          <p><code>SyntaxError: Unexpected token &apos;;&apos;</code> が出ました。見出し、HP 24／18、ボタンは残り、敵名だけが空欄です。攻撃もリセットも反応しません。</p>
          <p>このscriptは解析に失敗し、敵名の設定やクリック処理の登録が始まりません。値を戻して再実行すると、敵名が出て、2回目の勝利まで遊べました。別のコードでは、エラー行と直前の行の値・引用符・括弧を確認します。</p>
        </section>

        <section id="selector">
          <h2>例2 ボタンのIDと取得する名前が違う</h2>
          <pre className="article-code"><code>{'<button id="fight">たたかう</button>\n\n// 壊れた行: #attackの要素はない\nconst fight = document.querySelector("#attack");\n\n// 修正: HTMLのIDに合わせる\nconst fight = document.querySelector("#fight");'}</code></pre>
          <p><code>TypeError: Cannot read properties of null (reading &apos;addEventListener&apos;)</code> が出ました。敵名は表示されますが、攻撃もリセットも反応しません。取得結果がnullのまま、クリック処理を登録しようとして止まります。</p>
          <p>この例はボタンより後にscriptがあるため、取得する名前を戻すだけで直りました。nullには読み込み順が関係する場合もありますが、IDが違うまま読み込み待ちを足しても一致する要素は見つかりません。</p>
        </section>

        <section id="reset">
          <h2>例3 リセットしても攻撃ボタンが無効のまま</h2>
          <p>最初は勝てるのに、「もう一度」の後だけ攻撃できず、Consoleにも例外が出ない例です。HPと案内文は戻りますが、ボタンの無効状態が残っていました。</p>
          <pre className="article-code"><code>{'// 勝利時は残す\nfight.disabled = true;\n\n// リセット処理の中へ戻す\nfight.disabled = false;'}</code></pre>
          <p>削除していた再有効化の1行を戻すと、勝利後は攻撃が止まり、リセット後は再び攻撃できました。勝利時の停止処理まで消さないでください。再読み込みだけで一時的に遊べても、勝利→リセットで再発すれば修正は終わっていません。</p>
        </section>

        <section id="demo">
          <h2>掲載例で壊れた版と修正版を試す</h2>
          <p>まず「動く基準版」で、HPが24／18→20／12→16／6→16／0となり、3回目で勝つことを確認します。その後、試す例を切り替えます。これらの数値はこの掲載例だけの基準です。</p>
          <details>
            <summary>ゲームの実演とコードを開く</summary>
            <HtmlGameDebugDemo />
          </details>
        </section>

        <section id="ask-ai">
          <h2>AIには操作と関連コードを渡す</h2>
          <p>原因が分からなければ、次の相談例を自分の症状に置き換えます。まず関係するHTMLと処理だけを添え、不足する箇所が分かってから追加してください。</p>
          <pre className="article-code"><code>{troubleshootingPrompt}</code></pre>
          <CopyTextButton text={troubleshootingPrompt} label="相談例をコピー" />
          <p>APIキー、トークン、Cookie、個人情報、非公開URLや個人のフォルダー名は除きます。エラー画面にも含まれていないか確認してください。</p>
        </section>

        <section id="replay-check">
          <h2>直した後は2回目の勝利まで確かめる</h2>
          <ul>
            <li>読み直すと初期表示になり、操作に関係するエラーが出ない。</li>
            <li>攻撃でHPが変わり、勝利結果が出る。</li>
            <li>勝った後は攻撃できない。</li>
            <li>リセットでHPと結果が戻り、再び攻撃できる。</li>
            <li>2回目も勝利まで遊べる。</li>
          </ul>
          <p>通った版を別ファイルで保存します。最初のゲームを作り直す場合は、<a href="/articles/ai-browser-game-how-to/">完成例の実行・保存手順</a>へ戻れます。</p>
        </section>

        <section id="evidence">
          <h2>検証した範囲</h2>
          <p>2026年10月11日、LinuxのChromium 151.0.7922.173で、基準版・3つの破損版・3つの修正版を1280／375／320px幅で確認しました。元例と実演用コピーで各21ケースの起動、操作、読み直し、勝利後の停止、リセットを調べ、動く版は2回目の勝利まで確認しています。</p>
          <details>
            <summary>実演用コピーと検証の制限</summary>
            <p>このページの実演は別コピーです。元例の狭幅でのはみ出しをborder-boxで直し、見出しを語のまとまりで折り返すようにしました。ゲームの数値や処理は変えず、3つの不具合も1つずつ分けています。元の作り方記事は変更していません。</p>
            <p>実機のタッチ・ファイル操作、Safari／Firefox、外部モジュールは未検証です。外部moduleを使う別のゲームではfile://の読み込み制限も確認対象になりますが、この単一HTMLの3例には当てはまりません。ブラウザーの保護設定は解除しません。</p>
          </details>
        </section>
      </div>
    </ArticleFrame>
  );
}
