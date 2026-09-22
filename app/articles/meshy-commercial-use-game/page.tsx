import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("meshy-commercial-use-game")!;
const meshy = getService("meshy")!;
export const metadata: Metadata = articleMetadata(article);

export default function MeshyCommercialUseGame() {
  return <ArticleFrame article={article} showProjectCta={false}><div className="article-content">
    <header className="page-head">
      <p className="eyebrow">3D ASSET / LICENSE CHECK</p>
      <h1>Meshy AIは商用利用できる？無料版・有料版のライセンスとゲーム利用条件</h1>
      <p className="lead">生成した3Dアセットをゲームへ入れる前に、生成時のプラン、帰属表示、参照画像の権利、配布方法を分けて判定します。</p>
      <p><strong>公式情報を2026年9月21日に確認</strong>。これは一般的な情報整理であり、法律相談ではありません。公開直前には現行の公式条件を再確認してください。</p>
      <p className="affiliate-disclosure-note"><strong>この記事にはプロモーションを含みます。</strong></p>
      <dl className="article-lesson-grid">
        <div><dt>Freeで生成</dt><dd>専用の公式案内ではCC BY 4.0。商用利用には帰属表示が必要。</dd></div>
        <div><dt>Paidで非公開生成</dt><dd>現行条件の範囲で私的な所有権。Meshyへの帰属表示は不要と案内。</dd></div>
        <div><dt>画像をアップロード</dt><dd>どのプランでも、画像・キャラクター・ロゴの権利は別に確認。</dd></div>
      </dl>
    </header>

    <section><h2>ケース別の判断表</h2><div className="article-decision-table"><table><thead><tr><th>ケース</th><th>商用利用</th><th>帰属表示</th><th>所有権・ライセンス</th><th>確認すること</th></tr></thead><tbody>
      <tr><td data-label="ケース">Freeプランで生成</td><td data-label="商用利用">専用案内では可</td><td data-label="帰属表示">CC BY 4.0に従い必要</td><td data-label="所有権・ライセンス">CC BY 4.0</td><td data-label="確認すること">生成時プランと現行条件</td></tr>
      <tr><td data-label="ケース">Paidプランで非公開生成</td><td data-label="商用利用">条件付きで可</td><td data-label="帰属表示">Meshyへの表示は不要との案内</td><td data-label="所有権・ライセンス">第三者権利を侵害せず、Communityへ公開しない等の条件を確認</td><td data-label="確認すること">生成時プラン、公開状態、Terms</td></tr>
      <tr><td data-label="ケース">Paid生成後にFreeへ変更</td><td data-label="商用利用">生成時の権利を維持との案内</td><td data-label="帰属表示">Paid生成物の条件</td><td data-label="所有権・ライセンス">後のdowngradeで遡って変わらない</td><td data-label="確認すること">生成日と当時のプラン記録</td></tr>
      <tr><td data-label="ケース">参照画像から生成</td><td data-label="商用利用">入力素材の権利次第</td><td data-label="帰属表示">プラン条件と素材の条件を別々に確認</td><td data-label="所有権・ライセンス">Meshyの権利だけでは不足</td><td data-label="確認すること">画像・人物・キャラクター・ロゴの許諾</td></tr>
      <tr><td data-label="ケース">Marketplace・素材再販売</td><td data-label="商用利用">追加確認が必要</td><td data-label="帰属表示">出品物と販売先の条件次第</td><td data-label="所有権・ライセンス">公式ページ間に異なる説明あり</td><td data-label="確認すること">Meshyの両方の案内と販売先規約</td></tr>
    </tbody></table></div></section>

    <section><h2>Freeプラン：CC BY 4.0は何を意味する？</h2><p>Meshyの商用利用専用HelpとFreeプランHelpは、Freeプランで生成したアセットをCC BY 4.0で提供し、適切な帰属表示をすれば商用利用できると案内しています。CC BY 4.0では、作者・ライセンスへの表示、変更した場合の表示などを満たす必要があります。</p><p>ゲームでは、credits画面を基本に、必要に応じてストア説明、READMEまたはacknowledgementsにも記録します。「Meshyで生成、CC BY 4.0」のような表示だけで十分かを決めつけず、公式ライセンスの表示要件を確認してください。</p></section>
    <section><h2>Paidプラン：所有権と帰属表示</h2><p>現行Helpは、Paid subscriberが生成したアセットについて、第三者の権利を侵害せず、アセットをprivateのままにしてMeshy Communityへ公開しない等の条件の下で私的な所有権を保持でき、Meshyへの帰属表示は不要と案内しています。</p><p>これは「完全に何でも自由」という意味ではありません。Terms、生成機能の条件、入力素材の権利、公開先の規約は引き続き適用されます。</p></section>
    <section><h2>権利はリリース時ではなく生成時のプランで確認する</h2><p><strong>Asset A：</strong>Paid期間中に生成して条件を満たした後、Freeへdowngradeしても、公式案内ではそのPaid生成物の権利は遡ってFreeへ変わりません。</p><p><strong>Asset B：</strong>downgrade後にFreeで生成したものは、Free生成物としてCC BY 4.0の帰属表示を確認します。公開時のsubscriptionだけで一括判断せず、各ファイルの生成日と生成時プランを保存してください。</p></section>
    <section><h2>アップロード画像・参照画像の権利は別問題</h2><p>Meshyへ支払うことで、他人の写真、他社キャラクター、ロゴ、コンセプトアートの権利が付与されるわけではありません。自作または用途に合う許諾を得た参照素材を使う方が安全です。</p><p><strong>「有料プランで作ったから、他社キャラクターの画像を参照にしたモデルも自動的に安全になる」わけではありません。</strong>生成物に対するプラン上の権利と、入力素材を利用・公開できる権利を別々に確認します。</p></section>
    <section><h2>商用ゲームのケースで確認する</h2><dl className="article-lesson-grid">
      <div><dt>広告付き無料ゲーム</dt><dd>生成時プラン、必要な帰属表示、参照素材、公開時Termsを確認。</dd></div><div><dt>有料Steamゲーム</dt><dd>販売前にアセット台帳とcredits、参照素材の許諾を照合。</dd></div><div><dt>IAPのあるmobile game</dt><dd>無料downloadでも収益化を前提に同じ4点を確認。</dd></div><div><dt>client向けゲーム</dt><dd>プラン条件に加え、納品・再利用・帰属表示の担当を契約で明確化。</dd></div><div><dt>game jam後に商用化</dt><dd>prototype時の生成プランを確認し、不明な素材は公開前に置き換える。</dd></div>
    </dl><p>各store固有の法的結論をこの記事から推測せず、対象platformの現行規約も確認してください。</p></section>
    <section><h2>ゲーム内利用とMarketplace・素材再販売は分ける</h2><p>アセットをゲームの一部として使うことと、raw assetそのものを販売・配布することは同じ判断ではありません。販売先のAI content policyやlicenseも適用されます。</p><aside className="article-callout"><h3>公式情報に現在残る不一致</h3><p>Meshyの商用利用専用Help、FreeプランHelp、所有権Help、TermsはFree生成物をCC BY 4.0の帰属表示付きで商用利用できると案内する一方、Marketplaceのpublishing checklistにはFree生成物を原則personal / non-commercial useとする異なる説明があります。ゲーム内利用には直接的な専用案内を基準にし、raw assetを出品する前にはcommercial-use案内とMarketplace案内の双方を再確認し、不明ならMeshyと販売先へ確認してください。</p></aside><p>したがって「Free assetは必ずどこでも販売できる」とは判断しません。この不一致は、より明確なゲーム内利用の案内まで否定するものでもありません。</p></section>
    <section><h2>公開前チェックリスト</h2><ul className="article-checkpoints"><li>このアセットはどのプランで生成したか</li><li>CC BY 4.0などの帰属表示が必要か</li><li>Paidの私的所有権を主張する場合、現行条件どおりprivateに保ったか</li><li>参照画像を利用・公開する権利があるか</li><li>販売するのはゲームか、raw assetそのものか</li><li>公開直前にMeshyのTermsとHelpを再確認したか</li><li>対象Marketplace・platformに別のAI content規則がないか</li></ul></section>
    <section className="article-inline-handoff" aria-labelledby="meshy-commercial-check"><p className="section-label">OFFICIAL TERMS CHECK</p><h2 id="meshy-commercial-check">現行プランと商用利用条件をMeshy公式で確認する</h2><p>上のチェックを終えた後、使うアセットの生成時プランと現在の商用条件を公式画面で照合してください。以下はアフィリエイトリンクです。</p><OutboundLink service={meshy} page="/articles/meshy-commercial-use-game" placement="meshy_commercial_terms_check" label="現行プランと商用利用条件をMeshy公式で確認する" /></section>
    <section><h2>権利確認の次は1点をゲームへ入れる</h2><p><Link href="/articles/meshy-game-development-guide/">Meshyでゲーム用3Dモデルを作りUnity・Blenderへ持っていく手順</Link>で、1アセットの生成、export、import、検品へ進めます。現在の検証済み情報は<Link href="/tools/meshy/">Meshyツールページ</Link>でも確認できます。</p></section>
  </div></ArticleFrame>;
}
