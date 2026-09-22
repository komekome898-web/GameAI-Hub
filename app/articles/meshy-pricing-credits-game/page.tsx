import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("meshy-pricing-credits-game")!;
const meshy = getService("meshy")!;
export const metadata: Metadata = articleMetadata(article);

export default function MeshyPricingCreditsGame() {
  return <ArticleFrame article={article} showProjectCta={false}><div className="article-content">
    <header className="page-head">
      <p className="eyebrow">3D ASSET / CREDIT BUDGET</p>
      <h1>Meshy AIの料金は？無料版・Pro・Premium・Ultraの違いとゲーム開発のクレジット目安</h1>
      <p className="lead">Meshyにはカード登録なしで試せるFreeがあります。有料プランは主に月間クレジット、処理枠・優先度、download・API・非公開所有の条件が変わります。ただし、クレジット数は完成したゲーム用アセット数ではありません。</p>
      <p><strong>公式情報確認: 2026-09-22</strong>。価格・付与量・対象モデルは変わるため、決済前は必ずライブの公式料金を確認してください。</p>
      <p className="affiliate-disclosure-note"><strong>この記事にはプロモーションを含みます。</strong></p>
      <dl className="article-lesson-grid">
        <div><dt>まず試す</dt><dd>Freeの100 monthly creditsで1〜数点を生成し、制作環境へ持ち込めるか確認。</dd></div>
        <div><dt>制作量を決める</dt><dd>生成・texture・再試行・rigを別々に足し、月間枠と比較。</dd></div>
        <div><dt>購入前</dt><dd>この記事の算数ではなく、公式Pricingの当日表示を最終判断に使う。</dd></div>
      </dl>
    </header>

    <section><h2>どのプランを最初に確認する？</h2><dl className="article-lesson-grid">
      <div><dt>品質を試す / 1〜数個</dt><dd><strong>Freeをまず確認。</strong>100 credits、低いqueue priority、現在のdownload制限を受け入れられるかを見る。</dd></div>
      <div><dt>個人ゲームで継続制作</dt><dd><strong>Proをまず確認。</strong>月1,000 credits、API、private ownership、10 concurrent tasksという現行Pricingの条件と必要量を照合。</dd></div>
      <div><dt>大量に試行錯誤</dt><dd><strong>Premium（3,000）またはUltra（8,000）をまず確認。</strong>採用数でなく試行総数から逆算する。</dd></div>
      <div><dt>API / automation</dt><dd><strong>Pro以上をまず確認。</strong>API creditはweb appの生成条件と同一とは決めつけずAPI Docsで操作別costを確認。</dd></div>
      <div><dt>2人以上の制作チーム</dt><dd><strong>Studioをまず確認。</strong>shared pool、seat、権限、同時処理を公式比較表で確認する。</dd></div>
    </dl><p>これは万能な「おすすめ順位」ではありません。必要な処理、公開条件、人数に対応する最初の確認候補です。</p></section>

    <section><h2>現在のプラン比較</h2><div className="article-decision-table"><table><thead><tr><th>プラン</th><th>月払い表示 / 月間credits</th><th>制作上の差</th><th>まず想定する規模</th></tr></thead><tbody>
      <tr><td data-label="プラン">Free</td><td data-label="料金・枠">$0 / 100</td><td data-label="差">カード不要。低いqueue priority。Free専用HelpはMeshy 6 Liteを月10回download可、比較Helpはdownload不可と記載が衝突。</td><td data-label="規模">品質・import経路の試験</td></tr>
      <tr><td data-label="プラン">Pro</td><td data-label="料金・枠">$20 / 1,000</td><td data-label="差">10 queued tasks、4 free retries、unlimited downloads、API、private ownership。</td><td data-label="規模">個人の継続制作</td></tr>
      <tr><td data-label="プラン">Premium</td><td data-label="料金・枠">$40 / 3,000</td><td data-label="差">30 queued tasks、12 free retries、unlimited downloads、API、private ownership。</td><td data-label="規模">高頻度の個人制作</td></tr>
      <tr><td data-label="プラン">Ultra</td><td data-label="料金・枠">$100 / 8,000</td><td data-label="差">100 queued tasks、40 free retries、unlimited downloads、API、private ownership。月間枠は一次資料間で不一致。</td><td data-label="規模">個人の大量試行</td></tr>
      <tr><td data-label="プラン">Studio</td><td data-label="料金・枠">公式で確認（チーム向け）</td><td data-label="差">Pricingはshared poolと24 retries、reset Helpは4,000 per seat、refund Helpは8 retriesと不一致。seat・共有枠を購入画面で確認。</td><td data-label="規模">複数人の制作</td></tr>
    </tbody></table></div><p>年払い表示は総額・月換算・割引表示を混同しないでください。通貨、税、地域、キャンペーンでcheckout表示が変わり得るため、上表は2026-09-22のUSD月払い表示の記録です。</p></section>

    <section><h2>クレジットの動きは「残高へ毎月足す」ではない</h2><ul className="article-checkpoints">
      <li><strong>monthly credits：</strong>subscriptionの月間pool。更新時は未使用分へ満額を加算するのでなく、プラン上限までrefillされ、繰り越して増え続けない。</li>
      <li><strong>permanent credits：</strong>購入した追加creditsやrewardで得たcredits。公式Helpでは失効しない別枠。</li>
      <li><strong>消費：</strong>選ぶmodel/version、texture解像度、geometry、remesh、rig、animationなど操作ごとに異なる。</li>
      <li><strong>refund：</strong>公式Helpではfailed taskは返却。開始前cancelは返却対象だが、processing開始後のcancelは返却されない。</li>
      <li><strong>reset：</strong>Freeは毎月1日00:00 UTC。有料はsubscription更新日にrefill。</li>
    </ul><aside className="article-callout"><h3>1,000 credits = 完成50点、とは限らない</h3><p>20-creditのAPI生成だけなら算数上50回ですが、texture、代替案、修正、rigを足すと試行回数は減ります。さらに、生成成功はゲーム内のscale、topology、style、performanceに合格したことを保証しません。</p></aside></section>

    <section><h2>「何体作れる？」を透明な式で考える</h2><p>以下ではweb appとAPIを混ぜません。web app HelpはMeshy 7のmodel stageを25、2K/4K textureを10と案内します。API DocsはMeshy 7 / 7.1のbaseを20、高geometryを+5、textureを10（8Kは15）と案内します。画面表示が違う場合は画面を優先してください。</p><dl className="article-lesson-grid">
      <div><dt>web app：baseだけ1回</dt><dd>Meshy 7 model stage = <strong>25 credits</strong>。textureも採用品質も含まない。</dd></div>
      <div><dt>web app：base + 4K texture</dt><dd>25 + texture 10 = <strong>35 credits</strong>。8K textureなら textureが15。</dd></div>
      <div><dt>web app：代替案2回 + 採用案をtexture</dt><dd>(25 × 3) + 10 = <strong>85 credits</strong>。3案すべてにtextureなら105。</dd></div>
      <div><dt>API：rig + 3 animations</dt><dd>base 20 + texture 10 + auto-rig 5 + (animation 3 × 3) = <strong>44 credits</strong>。FreeはAPIを利用できず、形状修正・再生成も別。</dd></div>
    </dl><p>低polyやSmart Topologyなど別モデルはcostが異なります。古い「1生成=10 credits」のような固定換算を全modelへ広げません。</p></section>

    <section><h2>ゲーム制作量から月間予算を作る</h2><div className="article-decision-table"><table><thead><tr><th>制作ケース</th><th>明示する仮定</th><th>算数上の最低量</th><th>判断</th></tr></thead><tbody>
      <tr><td data-label="ケース">browser / indie prototypeの小物5点</td><td data-label="仮定">web appで各1回Meshy 7 base + 4K texture、retryなし</td><td data-label="算数">5 × (25 + 10) = 175</td><td data-label="判断">Free 100を75超過。3点だけtextureでも155。まず1点をFreeで検品し、現行有料枠を確認。</td></tr>
      <tr><td data-label="ケース">小物10 + creature 2</td><td data-label="仮定">有料APIで小物各30、creature各44（rig + 3 actions）</td><td data-label="算数">(10 × 30) + (2 × 44) = 388</td><td data-label="判断">最低でもFree外。各assetに代替1回ならさらに12 × 20 = 240。</td></tr>
      <tr><td data-label="ケース">characterを反復</td><td data-label="仮定">有料APIで6案をbase + texture、1案にrig + 5 actions</td><td data-label="算数">(6 × 30) + 5 + (5 × 3) = 200</td><td data-label="判断">採用1体でも200。完成数でなく探索回数を予算化。</td></tr>
      <tr><td data-label="ケース">batch / API prototype</td><td data-label="仮定">30 inputs、各base + texture、10件を1回再試行</td><td data-label="算数">30 × 30 + 10 × 20 = 1,100</td><td data-label="判断">1,000も算数上100不足。失敗返却を期待して枠を小さくしない。</td></tr>
    </tbody></table></div><p>いずれも成功率を仮定せず、post-processing、手修正、追加textureを含めない下限例です。実際のproduction-ready数はこれより少なくなり得ます。</p></section>

    <section><h2>Freeは何を試せて、どこで止まる？</h2><p>Freeはカード不要、月100 creditsでcore generationを試せます。Free専用HelpはMeshy 6 Liteに限り月10 downloadsと案内する一方、plan comparison HelpはFree download不可と記載しています。モデル名とdownload可否は更新が速いため、生成前にFree画面の対象モデルと残りdownload数を確認してください。</p><p>Free生成物の商用利用はCC BY 4.0の帰属表示が必要という現行専用案内があります。詳しい判断は<Link href="/articles/meshy-commercial-use-game/">料金を決める前後にMeshyの権利条件を確認するガイド</Link>へ分けています。</p></section>

    <section><h2>upgradeで変わる点と、請求で誤解しやすい点</h2><ul className="article-checkpoints"><li>有料では月間credits、queue / concurrency、download・API access、retry、private ownership等の条件が変わる。</li><li>月払いと年払いの表示単位を区別し、checkoutの通貨・税・総額を確認する。</li><li>monthly creditsは永久に累積せず、更新時に上限へrefill。permanent creditsとは別。</li><li>failed / cancelled taskの返却は状態で変わる。processing後のcancelを無料のretryと数えない。</li><li>downgrade後の権利は<Link href="/articles/meshy-commercial-use-game/">商用利用ガイド</Link>で生成時プランと一緒に確認する。</li></ul></section>

    <section><h2>一次資料が同時に一致しないとき</h2><aside className="article-callout"><h3>2026-09-22に確認した主な衝突</h3><p><strong>Ultra：</strong>Pricingとplan comparisonは月8,000 credits、reset/refill Helpは10,000と記載。現在の購入判断には直接のPricing 8,000を採用し、古い可能性のあるHelpとの差を隠しません。</p><p><strong>Free download：</strong>専用Free HelpはMeshy 6 Liteを月10回、plan comparisonは不可と記載。対象モデルを含め公式画面で再確認してください。</p><p><strong>Studio：</strong>Pricingは5,500 shared creditsと24 retries、reset Helpは4,000 credits per seat、refund Helpは8 retriesと記載。チーム契約ではseat、共有方法、refill、retryを購入画面で照合してください。</p></aside><p>pricingとmodel世代は速く変わり、各Helpの更新時点が揃わない場合があります。この記事は確認日を記録し、決済直前の公式Pricing / Helpを最終根拠にします。</p></section>

    <section className="article-inline-handoff" aria-labelledby="meshy-pricing-check"><p className="section-label">LIVE PLAN CHECK</p><h2 id="meshy-pricing-check">現行料金・クレジット・プラン条件をMeshy公式で確認する</h2><p>必要量の式を作った後で、当日のcredits、billing、download、API、license条件を照合してください。以下はアフィリエイトリンクです。</p><OutboundLink service={meshy} page="/articles/meshy-pricing-credits-game" placement="meshy_pricing_plan_check" label="現行料金・クレジット・プラン条件をMeshy公式で確認する" /></section>
    <section><h2>料金決定の次へ</h2><p><Link href="/articles/meshy-commercial-use-game/">料金を決める前後に権利条件を確認</Link>し、<Link href="/articles/meshy-game-development-guide/">実際にゲーム用アセットを1点作って取り込む</Link>手順へ進みます。<Link href="/tools/meshy/">Meshyツール情報</Link>でも現在の検証済み項目を確認できます。</p></section>
  </div></ArticleFrame>;
}
