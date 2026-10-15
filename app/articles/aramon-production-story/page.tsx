import Image from "next/image";
import { ArticleFrame } from "@/components/ArticleFrame";
import { articleMetadata, getArticle } from "@/data/articles";
import { aramonImages, aramonImagesReady } from "./images";

const article = getArticle("aramon-production-story")!;
export const metadata = {
  ...articleMetadata(article),
  ...(article.publicationStatus !== "published"
    ? { robots: { index: false, follow: false } }
    : {}),
};

function PlayPhoto({ index }: { index: 0 | 1 | 2 }) {
  const photo = aramonImages[index];
  return (
    <figure style={{ margin: "1.5rem 0" }}>
      {aramonImagesReady && (
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 767px) 100vw, 667px"
          style={{ display: "block", width: "100%", maxWidth: 667, height: "auto" }}
        />
      )}
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

export default function AramonProductionStory() {
  return (
    <ArticleFrame article={article}>
      {!aramonImagesReady && (
        <aside aria-label="公開前の準備状況">
          <p>公開前の原稿です。掲載予定の写真3枚は準備中です。</p>
        </aside>
      )}
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">制作の体験談と学び</p>
          <h1>{article.title}</h1>
          <p className="lead">『荒野モン動』は、モンスターを操作して戦う TPS 形式のバトルロイヤルゲームです</p>
          <p>無料プランの Claude チャットで土台を作り、その後は Claude Code で機能を増やしてきました</p>
          <p>今回は制作の流れと技のエフェクト作りを振り返り、実際のゲーム画面も紹介します</p>
        </header>
        <section>
          <h2>Claude のチャットで土台を作り Claude Code で広げる</h2>
          <p>最初に使ったのは、無料プランの Claude のチャットでした</p>
          <p>ここでモンスターの TPS バトルロイヤルという土台を作りました</p>
          <p>その後は、Claude Pro で Claude Code を使って機能を増やしていきました</p>
          <p>追加したのはマルチプレイやリアルマップなどです</p>
          <p>画面デザインも刷新し、ゲームの中身と見た目に手を入れています</p>
          <p>チャットでゲームの土台を作るところから始め、Claude Code で機能を追加していく</p>
          <p>荒野モン動は、そんな流れで制作してきたゲームです</p>
        </section>
        <section>
          <h2>技のエフェクトは何度もゲームで確かめた</h2>
          <p>制作で苦労したのは、技のエフェクトをカッコよくすることでした</p>
          <p>AI に調整を頼み、ゲームに戻って実際の見え方を確かめる</p>
          <p>また AI に戻って直してもらい、ゲームで確認する</p>
          <p>この往復を何度も繰り返しました</p>
          <p>他のゲームをプレイして、エフェクトを考えるときの参考にすることもありました</p>
          <p>自分のゲームで確認することと、ほかのゲームに触れることの両方をしながら、見え方を調整してきました</p>
        </section>
        <section>
          <h2>画像と音には複数の方法を使う</h2>
          <p>画像素材を作るときは、ChatGPT が便利だと感じています</p>
          <p>コードを書くための AI に加えて、画像の制作にも AI を使っています</p>
          <p>音素材は、インターネット上のフリー素材と、Claude に作ってもらったものが中心です</p>
          <p>一部には Suno を使って作られたオリジナル楽曲を提供してもらい、取り入れています</p>
          <p>フリー素材や提供楽曲には、それぞれの利用条件があります</p>
          <p>使う際は、公開範囲や必要なクレジットなどを個別に確認する必要があります</p>
        </section>
        <p>ここからの 3 つの場面は、2026 年 10 月 4 日に記事編集時のプレイ確認として、公開ゲームをスマートフォン横向き相当の表示（667×375）で操作し、撮影したものです</p>
        <section>
          <h2>プレイ確認メモ リアルマップでの TEAM 戦</h2>
          <p>リアルマップ「荒野」の TEAM バトルロイヤルに参加したプレイ画面です</p>
          <p>この場面で使っている技は、TIER 2「火炎連砲」です</p>
          <PlayPhoto index={0} />
          <p>地面の草や岩、奥の山並みが見える 3D のマップで、キャラクターを背後から見ながら操作します</p>
          <p>左側には味方の状態、右上にはミニマップが表示されています</p>
          <p>キャラクターの前方に炎の演出が見えます</p>
          <p>地形や照準、操作ボタンと一緒に見ると、対戦画面の中でエフェクトがどう見えるかを確かめられます</p>
        </section>
        <section>
          <h2>プレイ確認メモ 怨霊ガノン鳥の TIER 3 魔神炎</h2>
          <p>怨霊ガノン鳥の TIER 3 技は「魔神炎」</p>
          <p>技を試す訓練場で選択し、実際に発動した場面がこちらです</p>
          <PlayPhoto index={1} />
          <p>キャラクターの前方へ赤黒い炎が幅広く伸びています</p>
          <p>明るい赤と暗い部分が重なり、炎が手前から奥へ広がる様子を確認できます</p>
          <p>中央には照準と的、画面下には「魔神炎」の技名が表示されています</p>
          <p>プレイ確認では、的への命中とダメージの表示まで確認できました</p>
          <p>この場面を見るときは、炎そのものに加えて、キャラクターや的との位置関係にも注目できます</p>
          <p>エフェクトは背景や操作表示と同じ画面に出るため、ゲームの中でどう見えるかを確かめることも大切です</p>
        </section>
        <section>
          <h2>プレイ確認メモ 能力値を見ながらトレーニングを選ぶ</h2>
          <p>育成のトレーニング画面には、ライフ、ちから、かしこさ、命中、回避、丈夫さの 6 能力が並びます</p>
          <p>それぞれの適正と効果の表示を見ながら、右側のメニューを選べる構成です</p>
          <PlayPhoto index={2} />
          <p>メニューは「ドミノ倒し」「しゃてき」「猛勉強」など 10 種類</p>
          <p>撮影時は「猛勉強」を選び、選択した項目と「トレ実行」ボタンが黄色で示されることを確認しました</p>
          <p>能力の一覧、選んだメニュー、実行ボタンが一つの画面に収まっています</p>
          <p>メニューを選ぶ段階と、チケットを使って実行する段階は分かれています</p>
          <p>今回は選択までを確認し、トレーニングは実行していません</p>
          <p>技を試す訓練場と、この育成画面は別の画面です</p>
          <p>戦闘中の演出に加えて、能力を確認してメニューを選ぶ場面も見ると、荒野モン動の画面づくりを別の角度から見られます</p>
        </section>
        <p>制作してきたゲームは、下のリンクから開けます</p>
        <p><a href="https://komekome898-web.github.io/aramon/index.html" target="_blank" rel="noopener noreferrer">荒野モン動を遊ぶ</a></p>
        <p>著者 おりょう　X <a href="https://x.com/oryoooo_game" target="_blank" rel="noopener noreferrer">@oryoooo_game</a></p>
      </div>
    </ArticleFrame>
  );
}
