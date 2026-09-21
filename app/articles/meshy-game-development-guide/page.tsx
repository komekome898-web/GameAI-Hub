import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("meshy-game-development-guide")!;
const meshy = getService("meshy")!;
export const metadata: Metadata = articleMetadata(article);

export default function MeshyGameDevelopmentGuide() {
  return (
    <ArticleFrame article={article} showProjectCta={false}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">3D ASSET / FIRST IMPORT</p>
          <h1>Meshy AIの使い方｜ゲーム用3Dモデルを作ってUnity・Blenderへ持っていく手順</h1>
          <p className="lead">Meshyは、文章や画像から3Dモデルを生成できるツールです。このガイドは初めてゲーム用3D素材を作る人が、単純な小物かクリーチャーを1つ生成し、BlenderまたはUnityへ読み込み、実際に使えるか判断するところまで進むための手順です。</p>
          <p className="affiliate-disclosure-note"><strong>この記事にはプロモーションを含みます。</strong></p>
          <div className="article-contract">
            <p><strong>成果物：</strong>対象ツールへ読み込み、向き・縮尺・見た目を確認した3Dアセット1点</p>
            <p><strong>今はしない：</strong>シーン全体、キャラクター一式、同系統アセットの量産</p>
            <p><strong>完了：</strong>生成画面ではなく、ゲーム制作環境の中で採用・修正・不採用を判断できた</p>
          </div>
        </header>

        <section>
          <h2>1. Meshyを開く前に最初のアセットを決める</h2>
          <p>宝箱、ポーション瓶、単純なモンスター、背景用の樽など、用途を一文で説明できる1点を選びます。ゲームの全景や完全なアニメーション付きキャスト、既存作品の固有キャラクターから始めません。</p>
          <ul className="article-checkpoints">
            <li>遠目でも意図した物に見えるシルエット</li><li>上下・前後が正しい</li><li>素材感がゲームの方向性に合う</li><li>用途に対して明らかな形状破綻がない</li><li>対象ツールへ読み込め、縮尺を調整できる</li>
          </ul>
          <p>このガイドでは「木と金属でできた、閉じた宝箱」を例にします。</p>
        </section>

        <section>
          <h2>2. Text to 3DとImage to 3Dを選ぶ</h2>
          <dl className="article-lesson-grid">
            <div><dt>Text to 3D</dt><dd>形や雰囲気を文章で探索したい。厳密な見本がまだないとき。</dd></div>
            <div><dt>Image to 3D</dt><dd>自作のコンセプト画など、守りたい輪郭や視覚方向がすでにあるとき。</dd></div>
          </dl>
          <p>一方が常に高品質という意味ではありません。入力画像を使う場合も、その画像をアップロードし生成に使う権利があるか確認します。</p>
          <h3>再利用できるpromptの型</h3>
          <pre className="article-code"><code>{`［物体］、［輪郭］、［画風］、［素材］、［必ず見える特徴］

例：閉じた宝箱、低く幅広い輪郭、stylized low-poly、
暗い木材と鈍い金属、正面中央に大きな留め金、台座なし`}</code></pre>
          <p>最初から長い設定集を入れず、出力を見て「輪郭」「素材」「必須特徴」のどこが違うかを1つずつ直します。</p>
        </section>

        <section className="article-inline-handoff" aria-labelledby="meshy-first-asset">
          <p className="section-label">FIRST ASSET TEST</p>
          <h2 id="meshy-first-asset">作る1点と合格条件が決まったら生成する</h2>
          <p>まず宝箱など1点だけを試します。現在利用できる生成方式とプラン条件は公式画面で確認してください。</p>
          <OutboundLink service={meshy} page="/articles/meshy-game-development-guide" placement="meshy_game_guide_first_asset" label="Meshyで最初のテストアセットを作る" />
        </section>

        <section>
          <h2>3. 生成結果を選び、書き出す前に検査する</h2>
          <p>最初の候補を自動的に採用しません。前・横・後ろから見て、シルエット、裏側の読みやすさ、浮いた破片、穴や不自然な突起、テクスチャの継ぎ目、ゲーム内の用途を邪魔する形を確認します。生成されたtopologyが自動的にゲーム向けとは限りません。</p>
          <p>たとえば開閉する宝箱なら、ふたと本体を分けて動かせる必要があるかも先に判断します。必要な構造を満たさないモデルは、見栄えだけで採用しません。</p>
        </section>

        <section>
          <h2>4. 出力形式を行き先から決める</h2>
          <div className="article-decision-table">
            <table>
              <thead><tr><th>行き先</th><th>最初の候補</th><th>確認すること</th></tr></thead>
              <tbody>
                <tr><td data-label="行き先">Unity</td><td data-label="最初の候補">FBX</td><td data-label="確認すること">Meshy公式ガイドの推奨。テクスチャを同じフォルダへ置き、materialを確認。</td></tr>
                <tr><td data-label="行き先">Blender</td><td data-label="最初の候補">GLBまたはFBX</td><td data-label="確認すること">GLBはまとまった受け渡しに便利。既存工程がFBXならFBXを選ぶ。</td></tr>
                <tr><td data-label="行き先">Web / browser 3D</td><td data-label="最初の候補">GLB</td><td data-label="確認すること">1ファイルにまとめやすいが、使用ライブラリで実際に読み込む。</td></tr>
              </tbody>
            </table>
          </div>
          <p>形式名だけで材料が必ず再現されるとは限りません。modelファイルとtextureの構成を確認し、読み込み先でmaterialを割り当て直せるよう元ファイルを保管します。</p>
        </section>

        <section>
          <h2>5A. Blenderへ持っていく</h2>
          <ol><li>GLBまたはFBXをMeshyからダウンロードする。</li><li>BlenderのImportから対応形式を選ぶ。</li><li>正面・上下、原点、寸法、material、meshの裏側を確認する。</li><li>次のゲーム工程に必要な修正だけ行い、別ファイルで保存する。</li></ol>
          <p>Meshyには公式Blender pluginの案内もありますが、対応バージョン、ログイン、利用条件は導入時点の公式ページで確認してください。pluginを使わなくても、GLB/FBXの手動importは別の経路として選べます。</p>
          <h2>5B. Unityへ持っていく</h2>
          <ol><li>FBXと必要なtextureをProjectのAssets配下へ入れる。</li><li>modelを空のSceneへ置き、cameraとlightの下で見る。</li><li>Transformの向きとscale、materialの割り当てを確認する。</li><li>必要ならPrefab化し、実際の床やキャラクターの隣に置く。</li></ol>
          <p>「importできた」だけで終えず、最小Sceneで意図した大きさと見た目になるところまで確認します。</p>
        </section>

        <section className="article-inline-handoff" aria-labelledby="meshy-export-check">
          <p className="section-label">EXPORT CHECK</p>
          <h2 id="meshy-export-check">量産前に現在の書き出し・プラン条件を確認する</h2>
          <p>最初のimport経路が分かった段階で、必要な形式、権利、現在のプラン条件を公式表示で確認します。料金やcreditsはこの記事に固定していません。</p>
          <OutboundLink service={meshy} page="/articles/meshy-game-development-guide" placement="meshy_game_guide_export_check" label="Meshyの現在の書き出し条件を確認する" />
        </section>

        <section>
          <h2>6. ゲームで「使える」か判定する</h2>
          <ul className="article-checkpoints"><li>意図したシルエットに見える</li><li>正面・上下・原点が扱いやすい</li><li>周囲と比べてscaleが適切</li><li>textureとmaterialが想定どおり表示される</li><li>穴、浮遊物、壊れた面など明らかなmeshエラーがない</li><li>poly数や描画負荷が解決済みとは仮定せず、対象端末で後に測る</li><li>公開用途に必要なlicenseと入力素材の権利を確認した</li></ul>
          <p><strong>生成画像やmodelが1つできただけでは制作taskは完了ではありません。実際の制作環境へimportし、ゲーム文脈で確認できた状態が完了です。</strong></p>
        </section>

        <section>
          <h2>7. Free・Paid・商用利用の確認</h2>
          <p>2026年9月21日にMeshy公式ヘルプを確認した時点では、Freeプランで生成したassetはCC BY 4.0として帰属表示が必要と案内され、paid subscriberが生成したassetはその帰属要件とは異なる条件で扱われています。生成時点のプランによる違いを、公開前に公式ヘルプとTermsで確認してください。</p>
          <p>自作でない画像、他者のキャラクター、ブランド素材などを入力する場合、生成サービスのプランとは別に、入力・公開に必要な権利を確認します。これは法的助言ではありません。価格、credits、download条件は変わりやすいため、<Link href="/tools/meshy/">Meshyの検証済み情報</Link>と公式ページで現行条件を確認してください。</p>
        </section>

        <section>
          <h2>8. 失敗した場所から1工程だけ戻る</h2>
          <dl className="article-lesson-grid">
            <div><dt>対象に似ていない</dt><dd>用途を変えず、輪郭と必須特徴をpromptの先頭へ戻す。</dd></div><div><dt>余計な部品・形状破綻</dt><dd>最も単純な候補を選び、直せない箇所を具体化して再生成する。</dd></div><div><dt>textureが違う</dt><dd>素材語を1つに絞る。import後だけ違うならmaterialとtexture参照を確認する。</dd></div><div><dt>textureが表示されない</dt><dd>textureファイルの同梱とmaterial割り当てを確認し、必要ならGLBを試す。</dd></div><div><dt>scale・向きが違う</dt><dd>対象ツール内で基準物と比較し、Transformを直してPrefab等へ保存する。</dd></div><div><dt>形式を間違えた</dt><dd>変換を重ねず、Meshyの元assetから行き先向け形式で再downloadする。</dd></div>
          </dl>
        </section>

        <section className="article-inline-handoff" aria-labelledby="meshy-project-next">
          <p className="section-label">PROJECT HANDOFF</p><h2 id="meshy-project-next">同じゲームで次の検証へ進む</h2>
          <p>取り込んだ1点について、当たり判定、操作との連携、実機負荷、周囲とのstyle統一のどれかを次のtaskにします。合格する前に同系統のassetを量産しません。</p>
          <ArticleProjectLink slug={article.slug} label="取り込んだ3Dアセットの次のtaskを決める" placement="article_body_import_verified" />
        </section>
      </div>
    </ArticleFrame>
  );
}
