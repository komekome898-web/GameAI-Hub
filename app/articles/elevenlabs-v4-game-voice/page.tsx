import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleHeader } from "@/components/ArticleHeader";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("elevenlabs-v4-game-voice")!;
const elevenlabs = getService("elevenlabs")!;
export const metadata: Metadata = articleMetadata(article);

export default function ElevenLabsV4GameVoice() {
  return (
    <ArticleFrame article={article}>
      <div className="article-content">
        <ArticleHeader
          article={article}
          eyebrow="VOICE / MODEL DECISION"
          title="ElevenLabs v4とは？ゲーム音声で何が変わった？v3との違い・日本語・Turboを解説"
          lead="固定セリフ、複数話者のカットシーン、リアルタイムAI NPCを混同せず、代表的な日本語セリフで採用可否を決めるためのゲーム制作者向けガイドです。"
          promoted
        >
          <div className="article-contract">
            <p>
              <strong>成果物：</strong>
              自分のゲームに合うモデル候補と、採用・不採用を判断できる代表セリフ4パターン
            </p>
            <p>
              <strong>確認日：</strong>2026年9月30日（公式資料を再確認）
            </p>
            <p>
              <strong>注意：</strong>掲載文は再現用テスト台本です。GameAI
              Hubが生成・試聴した音声の評価ではありません。
            </p>
          </div>
        </ArticleHeader>

        <section>
          <h2>先に結論：ゲームの音声方式から選ぶ</h2>
          <dl className="article-lesson-grid">
            <div>
              <dt>固定ゲーム音声</dt>
              <dd>
                演技、文脈、キャラクターの一貫性を優先し、まずEleven
                v4を試す。生成ファイルをゲームへ入れる。
              </dd>
            </div>
            <div>
              <dt>複数話者の会話</dt>
              <dd>
                カットシーンやVNはv4のText to
                Dialogueを試す。編集しやすさ優先なら話者別ファイルを維持する。
              </dd>
            </div>
            <div>
              <dt>リアルタイムAI NPC</dt>
              <dd>
                表現力のあるリアルタイム演技ならv4 Turboを検討する。遅延やコストを優先する場合はFlash
                v2.5とも比較する。
              </dd>
            </div>
          </dl>
          <p>
            文章が事前に決まるなら、APIやTurboを追加する必要はありません。音声ファイル方式の方が実装、再現、検品を管理しやすい場合があります。
          </p>
        </section>

        <section>
          <h2>Eleven v4 / v4 Turboでゲーム音声の何が変わった？</h2>
          <p>
            ElevenLabsは2026年9月28日にv4とv4
            Turboを公開しました。公式資料は、v4を表現力と文脈理解を重視するモデル、Turboを低遅延の対話用途向けとして位置づけています。90以上の言語（日本語を含む）、自然言語のAudio
            Tags、複数話者のText to Dialogue、IVC/PVCを扱えます。
          </p>
          <p>
            これは「どの日本語セリフも自然」「同じ指示なら同じ音声」を意味しません。声、文章、タグごとに結果をゲーム内で検品します。
          </p>
        </section>

        <section>
          <h2>v3 vs v4 vs v4 Turbo</h2>
          <div className="article-decision-table">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>v3</th>
                  <th>v4</th>
                  <th>v4 Turbo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>主目的</th>
                  <td>表現豊かなTTS</td>
                  <td>高品質な演技・長い文脈</td>
                  <td>対話・低遅延</td>
                </tr>
                <tr>
                  <th>対応言語</th>
                  <td>70以上</td>
                  <td>90以上</td>
                  <td>90以上</td>
                </tr>
                <tr>
                  <th>公式Model資料のAPI文字数上限</th>
                  <td>5,000</td>
                  <td>10,000</td>
                  <td>同じ数値の明記を確認できず</td>
                </tr>
                <tr>
                  <th>Audio Tags / 複数話者</th>
                  <td>対応 / Text to Dialogue対応</td>
                  <td>対応 / Text to Dialogue対応</td>
                  <td>対応 / 対話用途</td>
                </tr>
                <tr>
                  <th>PVC</th>
                  <td>製品page: 利用不可 / prompting: 未最適化</td>
                  <td>対応</td>
                  <td>対応</td>
                </tr>
                <tr>
                  <th>ゲーム用途</th>
                  <td>既存制作の比較候補</td>
                  <td>固定音声・VN・カットシーン</td>
                  <td>リアルタイムAI NPC</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Turboの遅延は、モデル資料の「約100msのmedian inference
            latency」と製品・公開資料の「約150msのmedian time to first
            speech」が併存します。推論時間と最初の発声までの時間は同じ指標ではないため、1つの「遅延値」にまとめず、実際の通信・LLM・再生開始を含む構成で測定します。
          </p>
          <p>
            また、公式Model資料はFlash v2.5を約75msの低遅延モデルとして掲載しています。v4
            Turboは表現力のあるリアルタイムキャラクター／agentの候補ですが、「ElevenLabsで常に最速」とは扱いません。遅延とコストが最優先ならFlash
            v2.5も同じ実装条件で比較してください。
          </p>
        </section>

        <section>
          <h2>日本語ゲーム音声で最初に試す4パターン</h2>
          <p>
            同じ声で各パターンを複数回生成し、発音、演技、長さ、再現性を記録してください。以下は生成・試聴済みサンプルではなく、コピーして使う
            <strong>再現用テスト台本</strong>です。
          </p>
          <ol>
            <li>
              <strong>穏やかなNPC：</strong>
              <pre className="article-code">
                <code>
                  旅人さん、星見ヶ丘へ行くなら、鐘が三度鳴る前に橋を渡って。
                </code>
              </pre>
            </li>
            <li>
              <strong>ささやき・緊張：</strong>
              <pre className="article-code">
                <code>
                  [whispering] 静かに。黒曜門の向こうで、誰かが息をしている。
                </code>
              </pre>
            </li>
            <li>
              <strong>戦闘・切迫：</strong>
              <pre className="article-code">
                <code>
                  [shouting] レイナ、下がれ！ 奥義「蒼雷連牙」を放つ！
                </code>
              </pre>
            </li>
            <li>
              <strong>2人の会話：</strong>
              <pre className="article-code">
                <code>{`ミオ: [sighs] また遺跡の鍵をなくしたの？\nカイ: なくしてない。月影市場に置いてきただけだ。`}</code>
              </pre>
            </li>
          </ol>
          <p>
            「星見ヶ丘」「黒曜門」「蒼雷連牙」の読みを先に定義し、必要なら公式best
            practicesが案内するスラッシュ区切りのIPAも小さく試します。日本語や架空名で常に効くとは断定せず、表記変更との比較を残します。
          </p>
        </section>

        <section
          className="article-inline-handoff"
          aria-labelledby="v4-first-test"
        >
          <p className="section-label">REPRESENTATIVE TEST</p>
          <h2 id="v4-first-test">4パターンから必要な1〜3本だけ試す</h2>
          <p>
            固定、複数話者、リアルタイムのどれが必要か決めた後、現在のモデルとプラン表示を公式画面で確認します。
          </p>
          <OutboundLink
            service={elevenlabs}
            page="/articles/elevenlabs-v4-game-voice"
            placement="v4_representative_test"
            label="ElevenLabsで代表セリフを試す"
          />
        </section>

        <section>
          <h2>Audio Tagsは「キャラクターへの演技指示」</h2>
          <p>
            <code>[whispering]</code>、<code>[shouting]</code>、
            <code>[laughing]</code>、<code>[sighs]</code>
            などを、感情、声量、反応、音の演出として使えます。閉じたコマンド一覧ではなく自然言語の指示です。
          </p>
          <ul>
            <li>一度に「1行・1感情」から始める</li>
            <li>タグなし版も保存して比較する</li>
            <li>声を固定してタグだけ変える</li>
            <li>プレビューだけでなくBGM・効果音入りのゲーム内で聞く</li>
          </ul>
          <p>
            公式もAudio
            Tagsを開発中の領域と説明しています。効かない、過剰に演じる、発話指示と効果音要求の意図がずれる場合があるため、結果は保証されません。
          </p>
        </section>

        <section>
          <h2>VN / RPGカットシーンの複数話者</h2>
          <p>
            Text to Dialogueでは各turnに本文と<code>voice_id</code>
            を割り当て、turnごとにAudio
            Tagsを置けます。公式資料は、1つのdialogueに話者数の上限はないと明記しています。ただし、これは大人数のcastを1つの制作単位にまとめる推奨ではありません。場面単位に分け、話者別の編集や差し替えが必要かを先に決めます。出力は非決定的で、seedは一貫性を改善し得ますが同一結果を保証しません。
          </p>
          <p>
            長い会話は場面単位に分けます。公式資料は、大規模な会話生成の信頼性のため1リクエストの
            <code>inputs[].text</code>
            合計を2,000文字以下にするよう勧めています。これは信頼性のためのベストプラクティスであり、上表のモデル／API文字数上限とは別です。ダッシュボードでは本文と設定が同じ場合に最大2回の無料再生成が案内されていますが、現行画面も確認してください。
          </p>
          <ul className="article-checkpoints">
            <li>
              <code>scene03_mio_004_v2.mp3</code>
              のようにscene・話者・行・版を残す
            </li>
            <li>
              口の動きや字幕同期を個別編集するなら、話者別ファイルも比較する
            </li>
            <li>採用take、voice ID、本文、設定を台帳へ残す</li>
          </ul>
        </section>

        <section>
          <h2>v4 TurboでリアルタイムNPCを作る前に</h2>
          <pre className="article-code">
            <code>
              player input → game / protected server → LLM text → Eleven v4
              Turbo → streamed audio → game
            </code>
          </pre>
          <p>
            応答全体にはLLM、ネットワーク、TTS、バッファ、再生開始が含まれます。ElevenLabs
            APIキーをブラウザや配布クライアントへ直接埋め込まず、必要な場合は保護されたサーバー側の経路を使います。固定セリフで成立するNPCにはこの複雑さを加えません。
          </p>
        </section>

        <section>
          <h2>Voice Cloneとキャラクターの一貫性</h2>
          <p>
            IVC（Instant Voice Cloning）は短い試作、PVC（Professional Voice
            Cloning）は検証を伴う高忠実度の方式という大まかな違いがあります。公式v4製品ページはPVCがv3で利用できずv4で戻ったと説明する一方、現行のprompting資料はv3のPVCを「完全には最適化されず、clone品質が下がり得る」と説明しており、公式資料間で表現が一致しません。v4はPVCを明示的にサポートし、PVCやVoice
            Libraryにはv4が現在の推奨先です。公式v4資料は既存cloneについてv4向けの再学習・fine-tuningが必要になり得るとしています。
          </p>
          <p>
            製品資料には約10秒からのcloning表現がありますが、運用docsは品質のためIVCで約1〜2分、PVCではさらに多い清潔な録音を推奨しています。「10秒がベストプラクティス」とは扱いません。権利、本人同意、商用条件は
            <Link href="/articles/elevenlabs-commercial-use-game/">
              ElevenLabs商用利用ガイド
            </Link>
            で確認してください。
          </p>
        </section>

        <section>
          <h2>v4でハマりやすい点</h2>
          <ul>
            <li>
              v4/v3はSSMLの<code>&lt;break&gt;</code>タグ非対応。Audio
              Tags、句読点、文章構造で間を調整する。
            </li>
            <li>
              v4はStabilityとSimilarityを使い、StyleとSpeedスライダーは利用できない。
            </li>
            <li>
              Audio Tagsと複数話者出力は非決定的で、指示どおりとは限らない。
            </li>
            <li>v4の精度向上は「v3と同じ声」や個人の好みを保証しない。</li>
            <li>100msと150msは異なる遅延指標なので直接比較しない。</li>
            <li>長文・複数話者は場面単位に分割する。</li>
            <li>日本語の架空名、技名、英字混在は必ず発音QAする。</li>
          </ul>
        </section>

        <section>
          <h2>料金・無料・商用利用</h2>
          <p>
            2026年9月30日の公式PricingではFreeは$0・月10k
            credits、Starterは$6・月30k creditsでCommercial
            LicenseとIVCを掲載し、CreatorにはPVCが掲載されています。v4製品ページはFree以上で利用でき、通常のTTS
            credit
            pricingと案内しています。料金・creditsは変わり得るため契約画面を優先してください。
          </p>
          <p>
            公式Terms上、Free利用は非商用、Paid利用はTermsと必要な権利に従う範囲で商用利用が可能です。詳細な法務説明は重複させず、
            <Link href="/articles/elevenlabs-commercial-use-game/">
              公開前のプラン・権利チェック
            </Link>
            へ進んでください。
          </p>
        </section>

        <section>
          <h2>ゲーム制作での採用基準</h2>
          <ul className="article-checkpoints">
            <li>日本語と架空名を意図した読みで発音できる</li>
            <li>感情と声量が場面に合う</li>
            <li>同じキャラクターだと認識できる一貫性がある</li>
            <li>字幕、口パク、入力応答に対するタイミングが許容範囲</li>
            <li>BGM・効果音入りでも聞き取れる</li>
            <li>scene ID、セリフID、voice ID、採用takeを追跡できる</li>
            <li>公開前にプラン、文章、声、cloneの権利を確認した</li>
          </ul>
          <p>
            1〜3本がこの基準を通るまで量産しません。失敗したら、タグを減らす、文を短くする、表記を変える、別の声を試す、固定ファイルへ戻す、の順に原因を1つずつ切り分けます。
          </p>
        </section>

        <section
          className="article-inline-handoff"
          aria-labelledby="v4-next-action"
        >
          <p className="section-label">NEXT ACTION</p>
          <h2 id="v4-next-action">代表セリフをゲーム内の成果物にする</h2>
          <p>
            <Link href="/articles/elevenlabs-game-development-guide/">
              既存の使い方ガイド
            </Link>
            で保存・組み込み・ゲーム内QAまで進め、機能の中立的な記録は
            <Link href="/tools/elevenlabs/">ElevenLabsツールページ</Link>
            で確認できます。音声の範囲が未定なら、先にゲーム条件からtaskへ分けます。
          </p>
          <ArticleProjectLink
            slug={article.slug}
            label="自分のゲーム用に最初の音声taskを作る"
            placement="article_body_v4_handoff"
          />
        </section>
      </div>
    </ArticleFrame>
  );
}
