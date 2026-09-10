import type { Metadata } from "next";
import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { ArticleProjectLink } from "@/components/ArticleProjectLink";
import { OutboundLink } from "@/components/OutboundLink";
import { articleMetadata, getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

const article = getArticle("elevenlabs-commercial-use-game")!;
const elevenlabs = getService("elevenlabs")!;
export const metadata: Metadata = articleMetadata(article);

export default function ElevenLabsCommercialUseGame() {
  return (
    <ArticleFrame article={article}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">VOICE / COMMERCIAL CHECK</p>
          <h1>ElevenLabsの商用利用ガイド｜ゲーム音声で確認すべき権利とプラン</h1>
          <p className="lead">ElevenLabsで作った音声を収益化ゲームに使えるかは、プラン名だけでは決まりません。生成時の契約と、入力する文章・声の権利を分けて確認するためのガイドです。</p>
          <p className="affiliate-disclosure-note"><strong>この記事にはプロモーションを含みます。</strong></p>
        </header>

        <section>
          <h2>先に結論：商用ゲームなら「生成時のプラン」と「素材側の権利」を両方確認する</h2>
          <p>2026年9月10日の公式Termsでは、Free Userは非商用利用のみ、Paid UserはTermsなどに従う範囲で商用利用できるとされています。ただし、Paidであっても入力する文章や声に必要な権利が自動的に付与されるわけではありません。</p>
          <dl className="article-lesson-grid">
            <div><dt>Freeで個人練習</dt><dd>非商用目的で、共有時の帰属表示など現行条件を確認。</dd></div>
            <div><dt>Freeで収益化ゲーム</dt><dd>Freeに商用ライセンスは含まれないため不適合。</dd></div>
            <div><dt>Paid planで商用ゲーム</dt><dd>生成時の契約、Terms、対象機能の追加条件を確認。</dd></div>
            <div><dt>自分の文章</dt><dd>自分に利用権利があるかを確認。</dd></div>
            <div><dt>他人の文章</dt><dd>著作権者から必要な利用許諾を得る。</dd></div>
            <div><dt>自分のvoice clone</dt><dd>方式ごとの本人確認と利用条件を確認。</dd></div>
            <div><dt>他人のvoice clone</dt><dd>Instantは権利と同意が必要。Professionalは自分自身の声のみ作成可能。</dd></div>
          </dl>
        </section>

        <section><h2>ElevenLabsは商用利用できる？</h2><p>公式Terms上、Paid Userは商用目的でServicesを使用できます。それでもProhibited Use Policy、Service-Specific Terms、適用法令に従う必要があり、Beta Servicesなどには別条件があり得ます。これは法律相談ではなく、個別案件では契約と権利関係を確認してください。</p></section>
        <section><h2>Freeプランの音声は商用ゲームに使える？</h2><p>現行の公式Helpは、Freeプランに商用ライセンスは含まれず、商用目的には使えないと案内しています。Freeは$0・月10k creditsとPricingにありますが、「無料で生成できる」と「収益化に使える」は別の判断です。</p></section>
        <section><h2>商用利用したいならStarter以上を見ればいい？</h2><p>PricingではStarterが月額$6・月30k creditsで、Commercial LicenseとInstant Voice Cloningを含みます。CreatorにはProfessional Voice Cloningが含まれます。ただし、プランだけでなく、使う機能、生成時期、入力素材の権利を一緒に確認します。料金やcreditsは変更されるため、契約前に公式Pricingの現行表示を優先してください。</p></section>

        <section><h2>何が商用利用に当たりやすい？</h2><ul><li>SteamやApp Store、Google Playでゲームを販売する</li><li>広告を表示するゲームやブラウザゲームに音声を入れる</li><li>有料DLC、課金コンテンツ、宣伝動画で音声を使う</li><li>企業やクライアント向けのゲームを納品する</li></ul><p>上は実務上商用として扱うべき代表例です。境界的なケースは自己判断で断定せず、公式Termsと契約条件を確認します。</p></section>
        <section><h2>有料プランなら他人の文章を自由に読ませていい？</h2><p>いいえ。公式Termsは、必要な権利のないInputを提供したりOutputを作成したりしないよう求めています。小説、台本、歌詞、他社ゲームのセリフなど、第三者が権利を持つ文章は、読み上げとゲームへの収録に必要な許諾を別途確認します。</p></section>
        <section><h2>Voice Libraryの声を使う場合は？</h2><p>Libraryで利用できることと、任意の用途で無条件に利用できることは同じではありません。選択した声の表示条件、対象機能の追加条件、Terms、公開先の規約を公開直前に確認してください。</p></section>
        <section><h2>自分の声をクローンする場合</h2><p>自分の声でも、選ぶ方式とプランの条件、本人確認、入力音源に含まれる第三者の音楽や声などを確認します。クローンの品質だけでなく、どのゲーム、配布先、期間で使うかも記録します。</p></section>
        <section><h2>他人の声をクローンしていい？</h2><p>「本人が承知しているはず」で進めてはいけません。方式ごとの公式条件と、声の本人から得た同意・利用範囲を確認します。</p><h3>Instant Voice Cloning</h3><p>作成画面で、対象voiceをcloneする権利と同意があることの確認が求められます。口頭の承諾だけに頼らず、ゲーム名、商用利用、配布先、改変、利用期間を書面で残すのが実務的です。</p><h3>Professional Voice Cloning</h3><p>公式Docsでは、作成できるのは自分自身の声のみで、検証プロセスが必要とされています。他人の声は、本人の同意があっても自分のアカウントでPVCにはできません。本人が自身のアカウントで作成・検証し、私的に共有する手順が案内されています。</p></section>

        <section><h2>声優に依頼する場合は何を決めればいい？</h2><ul className="article-checkpoints"><li>収録音声をVoice Cloningの入力に使うか</li><li>対象ゲーム、宣伝素材、DLCへの利用範囲</li><li>販売・広告・無料配布の別と配布地域</li><li>生成音声の再編集、追加生成、利用期間</li><li>契約終了時のclone・生成物の取り扱い</li></ul><p>同意の記録とElevenLabsの契約は別物です。必要な利用許諾の範囲は依頼書・契約書で明確にします。</p></section>
        <section><h2>商用ゲーム公開前のチェックリスト</h2><ul className="article-checkpoints"><li>音声を生成した時点のプランと日付を記録した</li><li>現行のTerms、Pricing、Service-Specific Termsを確認した</li><li>入力した文章、台本、音源に必要なIP権利がある</li><li>Voice Cloningの権利・同意・検証条件を満たした</li><li>実際のストア、広告、販売条件に合わせて再確認した</li><li>セリフID、生成日、使用声、利用許諾を追跡できる</li></ul></section>
        <section><h2>「有料プラン中に生成 → 後で解約」したらどうなる？</h2><p>公式Helpは、有料subscription期間中に生成したcontentについて、subscription終了後もcommercial licenseを維持して使用できると案内しています。一方、有料期間の前後に生成したcontentは商用に使えないとされています。ファイルは自分で保管し、生成日と当時の契約を記録してください。</p></section>

        <section><h2>自分のケースを判定する</h2><dl className="article-lesson-grid"><div><dt>Case A：非公開の個人練習</dt><dd>Freeの非商用条件と、共有する場合の帰属表示を確認。</dd></div><div><dt>Case B：Steamで有料販売</dt><dd>Paid期間中に生成し、入力IPと使用voiceの権利も確認。</dd></div><div><dt>Case C：広告付き無料ゲーム</dt><dd>無料配布でも収益化があるため、商用前提で判定。</dd></div><div><dt>Case D：自分の声をclone</dt><dd>方式とプラン、本人検証、公開範囲を確認。</dd></div><div><dt>Case E：声優の声をclone</dt><dd>Instantは明示的な権利・同意、Professionalは本人による作成・検証と共有を確認。</dd></div></dl><p>判定できない点が残るなら、音声なしのプロトタイプを先に完成させる選択もあります。音声が不要ならElevenLabsを使う必要はありません。</p></section>

        <section className="article-inline-handoff" aria-labelledby="commercial-plan-check"><p className="section-label">OFFICIAL PLAN CHECK</p><h2 id="commercial-plan-check">商用利用条件を確認してからElevenLabsへ進む</h2><p>ここまでの判定でPaidが必要なケースだと確認できた場合のみ、商用ライセンス、必要なVoice Cloning機能、最新料金を公式画面で確認してください。以下はアフィリエイトリンクです。</p><OutboundLink service={elevenlabs} page="/articles/elevenlabs-commercial-use-game" placement="commercial_plan_check" /></section>
        <section><h2>実際のゲーム用音声を作る</h2><p>権利とプランの確認後は、<Link href="/articles/elevenlabs-game-development-guide/">実際のゲーム用日本語音声を作る手順を見る</Link>で、代表セリフ1〜3本の生成、保存、ゲーム内検品へ進みます。</p></section>
        <section className="article-inline-handoff" aria-labelledby="commercial-project"><p className="section-label">PROJECT HANDOFF</p><h2 id="commercial-project">まだゲームの公開条件が決まっていない場合</h2><p>無料公開、広告、販売、Voice Cloningの有無を先に整理し、必要な権利確認と音声制作を具体的なtaskへ分けます。</p><ArticleProjectLink slug={article.slug} label="Project Generatorで公開条件と音声taskを整理する" placement="article_body_commercial_scope" /></section>
        <section><h2>まとめ</h2><ol><li>Freeで生成できることと、商用に使えることを分ける。</li><li>Paid期間中の生成か、現行のTermsと追加条件に適合するかを確認する。</li><li>文章、台本、声など入力素材のIP権利を別途確認する。</li><li>Voice Cloningは方式ごとの同意・権利・本人検証条件を満たす。</li></ol><p>権利の判定を曖昧にしたまま音声を量産せず、公開条件を決め、確認記録を残し、小さな実装で検品してください。</p></section>
      </div>
    </ArticleFrame>
  );
}
