import type { Metadata } from "next";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("elevenlabs-game-development-guide")!;
const elevenlabs = getService("elevenlabs")!;
export const metadata: Metadata = articleMetadata(article);

export default function ElevenLabsGameDevelopmentGuide() {
  return (
    <ArticleFrame article={article}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">VOICE / FIRST IN-GAME AUDIO</p>
          <h1>ゲーム開発向けElevenLabs使い方ガイド｜日本語音声・効果音・APIの選び方</h1>
          <p className="lead">
            ElevenLabsの機能を全部試すのではなく、代表セリフを1〜3本作り、音声ファイルとして保存し、ゲーム内で再生して検品するまでを一度通すためのガイドです。
          </p>
          <p className="affiliate-disclosure-note"><strong>この記事にはプロモーションを含みます。</strong></p>
          <div className="article-contract">
            <p><strong>最初の成果物：</strong>ゲーム内で正しい場面に再生できる代表セリフ1〜3本</p>
            <p><strong>今はしない：</strong>全セリフの量産、必要性が決まっていないAPI連携</p>
            <p><strong>完了：</strong>発音・音量・再生タイミングを実際のゲーム内で確認できた</p>
          </div>
        </header>

        <section>
          <h2>まず結論：初心者は「固定音声ファイル」から始める</h2>
          <dl className="article-lesson-grid">
            <div><dt>決まったセリフ・ナレーション</dt><dd>Text to Speechで音声ファイルを作る。</dd></div>
            <div><dt>ボタン音・足音・環境音</dt><dd>必要な場面が決まってからSound Effectsを検討する。</dd></div>
            <div><dt>毎回変わるAI NPC会話</dt><dd>固定ファイルでは用意できない場合にAPIを検討する。</dd></div>
          </dl>
          <p>「こんにちは」「敵が来たぞ」「クエスト完了だ」のように文章が事前に決まっているなら、APIは不要です。音声を使わないゲームなら、ElevenLabs自体を工程へ加える必要もありません。</p>
        </section>

        <section>
          <h2>ElevenLabsでゲーム制作に何ができる？</h2>
          <h3>キャラクターのセリフとナレーション</h3>
          <p>RPG、ビジュアルノベル、アドベンチャーゲームの主人公、NPC、敵、ナレーター、チュートリアル役などの固定文章を音声化できます。ただし「声が生成できた」では完成ではありません。必要なのは、ゲーム内で正しい場面に再生できる音声ファイルです。</p>
          <h3>効果音</h3>
          <p>Sound Effectsでは衝撃音、足音、環境音、UI音、演出音などを作る選択肢があります。キャラクターボイスと同時に量産せず、最初の1プレイに必要な音だけを作ります。</p>
          <h3>APIによる動的な音声</h3>
          <p>LLMがNPCの返答を生成するなど、ゲーム中に文章そのものが変わり、固定ファイルでは準備できない場合はAPIが候補になります。APIキーなどの認証情報をブラウザや配布コードへ直接埋め込まず、サーバー側で保護する構成も必要です。</p>
        </section>

        <section>
          <h2>日本語ゲーム音声にも使える？</h2>
          <p>ElevenLabsの対応言語には日本語が含まれます。ただし、日本語対応は、すべての文章が自然に読まれる保証ではありません。次の要素を含む実際のゲーム用セリフで確認してください。</p>
          <ul>
            <li>キャラクター名、架空の地名、技名</li>
            <li>数字や英字</li>
            <li>長い文章や感情の強いセリフ</li>
          </ul>
          <p>数十〜数百件を先に生成せず、代表セリフで発音、人物像、聞き取りやすさを判断します。</p>
        </section>

        <section>
          <h2>ゲーム用音声を1つ完成させる手順</h2>
          <h3>1. 代表セリフを1〜3本だけ決める</h3>
          <pre className="article-code"><code>{`ここで少し待っていて。
すぐに戻ってくるよ。`}</code></pre>
          <p>日本語が自然か、キャラクターに合うか、ゲーム内で聞き取りやすいかを試せる短い文章から始めます。</p>

          <h3>2. セリフIDと使用場所を決める</h3>
          <ul className="article-checkpoints">
            <li><strong><code>voice_001</code></strong> — 「ここで少し待っていて。」— NPC初回会話</li>
            <li><strong><code>voice_002</code></strong> — 「準備はできた？」— 出発前</li>
            <li><strong><code>voice_003</code></strong> — 「よく戻ってきたね。」— 帰還時</li>
          </ul>
          <p>命名規則そのものより、ゲーム内のセリフ、生成した音声、使用場所を対応させられることが重要です。</p>

          <h3>3. 実際のセリフで声を選ぶ</h3>
          <p>短い紹介サンプルだけでなく、自分のゲームで使う文章を読ませます。年齢感、落ち着き、明るさ、聞き取りやすさ、複数回聞いたときの違和感を確認します。</p>

          <h3>4. 読ませる本文だけを生成欄へ入れる</h3>
          <p>「ゲームに組み込めるようにしてください」「検品表も作ってください」といった制作管理の指示は、読み上げ本文へ混ぜません。まず実際に発声させたい文章だけを入力します。</p>

          <h3>5. 発音・感情・間を確認する</h3>
          <ul>
            <li>固有名詞と数字を意図どおり読めている</li>
            <li>句読点の間が長すぎたり短すぎたりしない</li>
            <li>感情の強さが場面に合っている</li>
            <li>ゲーム画面と合わせても聞き取れる</li>
          </ul>
          <p>違和感があれば、声を替える前に文章を短くする、句読点を見直す、数字表現を変える、長いセリフを分割する方法も試します。</p>
        </section>

        <section className="article-inline-handoff" aria-labelledby="elevenlabs-first-test">
          <p className="section-label">FIRST PRODUCTION TEST</p>
          <h2 id="elevenlabs-first-test">ここで代表セリフだけを実際に試す</h2>
          <p>声と代表セリフが決まったら、最初は1〜3本だけ生成します。利用できる機能、無料枠、出力条件は現在の公式画面で確認してください。</p>
          <OutboundLink service={elevenlabs} page="/articles/elevenlabs-game-development-guide" placement="voice_first_test" />
        </section>

        <section>
          <h2>6. ゲームで再生できる形式として保存する</h2>
          <p>利用できる出力形式や音質は機能・プランで異なります。公式APIのText to SpeechにはMP3、PCMなど複数の出力形式があり、一部形式にはプラン条件があります。「必ずWAV」と決め打ちせず、使用するゲームエンジンで読み込み・再生できる形式を1つ選び、現在の公式仕様と契約プランを確認します。</p>
          <p>初心者の最初の基準は最高音質ではなく、保存したファイルをゲームへ正常に組み込んで再生できることです。</p>

          <h3>7. ゲームへ組み込み、そこで最終判断する</h3>
          <ul>
            <li>ファイルを読み込める</li>
            <li>正しい場面で再生される</li>
            <li>BGMに埋もれず、効果音より大きすぎない</li>
            <li>画面演出に対して再生タイミングが自然</li>
          </ul>
          <p>ElevenLabsの生成画面で自然に聞こえても、ゲーム内では音量や演出との組み合わせで使いにくいことがあります。採用判断はゲーム内で行います。</p>
        </section>

        <section>
          <h2>ゲーム用音声の合格基準</h2>
          <h3>採用してよい状態</h3>
          <ul>
            <li>セリフ本文が正しく、大きな発音ミスがない</li>
            <li>意図した雰囲気で、ゲーム内でも聞き取れる</li>
            <li>再生タイミングが自然</li>
            <li>セリフID、ファイル、使用場所を対応できる</li>
          </ul>
          <h3>作り直した方がよい状態</h3>
          <ul>
            <li>キャラクター名、数字、英字を不自然に読む</li>
            <li>間や感情が場面と合わない</li>
            <li>ゲーム内で聞き取りにくい</li>
            <li>どのセリフのファイルか分からない</li>
          </ul>
          <p><strong>1〜3本で基準を満たしてから量産します。</strong>「100件生成 → 組み込み後に問題発見 → 100件修正」という手戻りを避け、3件、10件、30件のように同じ基準で増やします。</p>
        </section>

        <section>
          <h2>APIはいつ使えばいい？</h2>
          <dl className="article-lesson-grid">
            <div><dt>固定ファイル向き</dt><dd>ビジュアルノベル、固定NPC会話、戦闘ボイス、チュートリアル、ナレーション。</dd></div>
            <div><dt>APIを検討</dt><dd>AI NPC、LLMがその場で作る文章、プレイヤーごとに変わる会話。</dd></div>
            <div><dt>判断基準</dt><dd>固定ファイルでは実現できない要件が、すでに存在するか。</dd></div>
          </dl>
          <p>APIがあるから使うのではありません。まず静的ファイル方式を完成させ、その方式では用意できない動的文章が必要になったときに検討します。</p>
        </section>

        <section>
          <h2>無料で試せる？ 商用ゲームでも使える？</h2>
          <p>2026年9月9日に公式Pricingを確認した時点ではFreeプランがあり、StarterにはCommercial Licenseの記載があります。ただし、無料で生成できることと、商用ゲームへ使用できることは別の判断です。</p>
          <p>料金、クレジット、商用ライセンス、Voice Cloningの条件は変更される可能性があります。販売、広告収益化、有料配布を予定する場合は、公開時点の公式PricingとTermsを確認してください。声をクローンする場合は、その声を使用する権利と必要な許可も別途確認します。</p>
        </section>

        <section className="article-inline-handoff" aria-labelledby="voice-project-plan">
          <p className="section-label">PROJECT HANDOFF</p>
          <h2 id="voice-project-plan">音声が本当に必要か分からない場合</h2>
          <p>「ElevenLabsを使いたい」から仕様を決めず、フルボイスか部分ボイスか、誰に何シーン必要か、固定音声か動的生成か、公開・販売予定があるかを先に整理します。</p>
          <pre className="article-code"><code>主要キャラクター2人、重要シーンだけ音声あり。最初は代表セリフ3本で試したい。</code></pre>
          <ArticleProjectLink slug={article.slug} label="Project Generatorで音声制作taskを整理する" placement="article_body_voice_scope" />
        </section>

        <section>
          <h2>まとめ：最初の3本をゲーム内で合格させる</h2>
          <ol>
            <li>代表セリフを1〜3本決める</li>
            <li>声を選び、日本語音声を生成する</li>
            <li>発音、感情、間を確認する</li>
            <li>ゲームで再生できる形式として保存する</li>
            <li>ゲームへ組み込み、音量とタイミングを検品する</li>
          </ol>
          <p>音声が不要ならElevenLabsを使う必要はありません。必要な制作工程だけで使い、AI音声を使うことではなく、プレイできるゲームへ進むことを完了条件にします。</p>
        </section>
      </div>
    </ArticleFrame>
  );
}
