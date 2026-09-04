import Link from "next/link";
import { ArticleFrame } from "@/components/ArticleFrame";
import { getArticle, articleMetadata } from "@/data/articles";
import { safeProjectReturn } from "@/lib/safe-project-return";
const article = getArticle("github-beginner-game-development")!;
export const metadata = articleMetadata(article);
const Success = ({ children }: { children: React.ReactNode }) => (
  <p className="article-success">
    <strong>成功：</strong>
    {children}
  </p>
);
function ReturnToProject({ returnTo }: { returnTo: string | null }) {
  return (
    <section
      className="article-return-to-project"
      aria-labelledby="return-to-project-title"
    >
      <p className="eyebrow">RETURN TO YOUR TASK</p>
      <h2 id="return-to-project-title">元のGameAI Hubタブへ戻る</h2>
      <p>
        <strong>このタブを閉じて、元のGameAI Hubタブへ戻ってください。</strong>{" "}
        それがゲーム案・task・進捗を保つ最優先の戻り方です。ブラウザから別タブを確実に選択する操作は、このページから自動化できません。
      </p>
      {returnTo ? (
        <>
          <p>元のタブを閉じた場合だけ、次の補助リンクを使えます。</p>
          <Link className="button ghost" href={returnTo}>
            元のProjectを開く
          </Link>
        </>
      ) : (
        <>
          <p>
            この記事を単独で開き、元のProjectタブがない場合だけ新しいProjectを開いてください。
          </p>
          <Link className="button ghost" href="/project">
            Project Generatorを開く
          </Link>
        </>
      )}
    </section>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const returnTo = safeProjectReturn((await searchParams).returnTo);
  return (
    <ArticleFrame article={article} showProjectCta={false}>
      <div className="article-content">
        <header className="page-head">
          <p className="eyebrow">GITHUB FOR FIRST GAME</p>
          <h1>{article.title}</h1>
          <p className="lead">
            Gitやコマンドを先に覚えず、Web画面で1つの <code>index.html</code>{" "}
            を残すまでを案内します。画面名はGitHub公式Docsで確認し、ログイン後の所有者画面は実アカウントでの通し実測をしていません。
          </p>
        </header>
        <section className="article-contract">
          <h2>今すぐGitHubは必要？</h2>
          <p>
            <strong>
              Copilotで最初のHTMLを作るだけなら、GitHubアカウントは必要ですがrepositoryはまだ不要です。
            </strong>
            まず元のGameAI Hubのtaskへ戻ってゲームを動かして構いません。
          </p>
          <dl>
            <div>
              <dt>GitHub account</dt>
              <dd>GitHubを使う本人のアカウント</dd>
            </div>
            <div>
              <dt>repository</dt>
              <dd>ゲームのファイルと変更履歴を置く場所</dd>
            </div>
            <div>
              <dt>GitHub Copilot</dt>
              <dd>AIによる制作支援サービス</dd>
            </div>
            <div>
              <dt>GitHub Pages</dt>
              <dd>HTMLなどをWeb公開する方法</dd>
            </div>
          </dl>
          <p>
            全部を最初に設定する必要はありません。保存するときにrepository、公開するときにPagesへ進みます。
          </p>
          <p>
            <strong>Projectから別タブで開いた場合：</strong>
            このタブを閉じ、元のGameAI Hubタブへ切り替えると同じtaskが残ります。
          </p>
        </section>
        <section>
          <h2>1. GitHubとは</h2>
          <p>
            <strong>見る：</strong>GitHubのWebサイト。<strong>押す：</strong>
            右上の登録またはログイン。<strong>入力：</strong>本人の情報。
            <strong>なぜ：</strong>
            ゲームの版をオンラインに残すため。Gitは変更を記録する仕組み、GitHubはその記録とファイルを置けるサービスで、同じものではありません。
          </p>
          <Success>
            自分のプロフィールへ移動できれば、アカウントでログインできています。
          </Success>
        </section>
        <section>
          <h2>2. アカウントを作る</h2>
          <ol>
            <li>
              <a
                href="https://github.com/signup"
                target="_blank"
                rel="noopener"
              >
                GitHubのSign up
              </a>
              を開く。
            </li>
            <li>
              画面の案内に沿ってメールアドレス、パスワード、usernameを入力する。
            </li>
            <li>本人確認とメール確認を画面の案内どおり完了する。</li>
          </ol>
          <p>
            表示項目や本人確認方法は変わる場合があります。ここでは登録完了を実測済みとはしていません。
          </p>
          <Success>
            ログイン後、自分のアイコンとusernameを確認できる状態。
          </Success>
        </section>
        <section>
          <h2>3. ログイン後はどこを見る？</h2>
          <p>
            <strong>見る：</strong>
            右上のプロフィール画像と、左側または上部のrepository一覧。
            <strong>押す：</strong>プロフィールメニューの「Your repositories」。
            <strong>なぜ：</strong>自分がOwnerの保存場所を見つけるため。
          </p>
          <Success>
            自分のusernameとrepository一覧が表示される。配置が違う場合はGitHub内検索ではなくプロフィールメニューから辿ります。
          </Success>
        </section>
        <section>
          <h2>4. repositoryとは</h2>
          <p>
            ゲームの <code>index.html</code>{" "}
            と、その変更履歴をまとめる箱です。アカウントそのものでもCopilotでもありません。最初はゲーム1つにつきrepository
            1つで十分です。
          </p>
          <Success>
            「アカウント＝本人」「repository＝ファイル置き場」を言い分けられる。
          </Success>
        </section>
        <section>
          <h2>5. 最初のrepositoryを作る</h2>
          <ol>
            <li>
              右上の <strong>+</strong> または <strong>New repository</strong>{" "}
              を押す。
            </li>
            <li>
              <strong>Owner</strong> が自分のusernameか確認する。
            </li>
            <li>
              <strong>Repository name</strong> に例として{" "}
              <code>my-first-browser-game</code> を入力する。
            </li>
            <li>
              公開範囲を自分で選び、必要ならREADME追加を選ぶ。意味が分からない設定は公式説明を確認する。
            </li>
            <li>
              <strong>Create repository</strong> を押す。
            </li>
          </ol>
          <Success>
            上部に <code>username / my-first-browser-game</code> と表示される。
          </Success>
        </section>
        <section>
          <h2>6. Code画面の見方</h2>
          <p>
            <strong>Code</strong>{" "}
            タブにはファイル一覧、branch名、最新の変更が表示されます。緑色の「Code」ボタンはダウンロード等のメニューで、ファイルを追加する操作とは別です。
          </p>
          <Success>
            repository名、現在のbranch、ファイル一覧の3点を見つけられる。
          </Success>
        </section>
        <section>
          <h2>7. index.htmlをWeb画面から追加する</h2>
          <h3>文字を貼って新規作成</h3>
          <ol>
            <li>
              <strong>Add file → Create new file</strong> を押す。
            </li>
            <li>
              ファイル名へ <code>index.html</code> と入力する。
            </li>
            <li>GameAI Hubで動いたコード全文を編集欄へ貼る。</li>
            <li>
              <strong>Commit changes...</strong> を押し、短い説明（例：
              <code>Add first playable game</code>）を入力して確定する。
            </li>
          </ol>
          <h3>端末に保存したファイルをupload</h3>
          <p>
            <strong>Add file → Upload files</strong> を押し、ファイル選択から{" "}
            <code>index.html</code>{" "}
            を選び、同様にcommitします。PCのドラッグ操作は必須ではありません。
          </p>
          <Success>
            Code画面の一覧に <code>index.html</code>{" "}
            があり、押すとコードが見える。
          </Success>
        </section>
        <section>
          <h2>8. commitとは</h2>
          <p>
            その時点の変更を、説明付きで履歴へ残す操作です。ゲーム内のセーブデータではありません。変更前へ戻る手掛かりになるため、「何を変えたか」を短く書きます。
          </p>
          <Success>
            repositoryの履歴に自分の説明と更新時刻が表示される。
          </Success>
        </section>
        <section>
          <h2>9. Copilotはrepositoryとは別</h2>
          <p>
            GitHub
            CopilotはAI支援サービスです。GitHubアカウントで利用しますが、一般的なCopilot
            Web
            Chatを開く前にゲームrepositoryを作る必要はありません。利用可否やプランは固定数値で覚えず、現在のCopilot画面と公式プランを確認してください。
          </p>
          <Success>
            Copilotだけ使うなら、元のProject taskへ戻って指示を送れる。
          </Success>
        </section>
        <section>
          <h2>10. Pagesは公開するときだけ</h2>
          <p>
            GitHub
            Pagesはrepository内のHTML等をWebサイトとして公開する機能です。保存だけなら設定不要です。公開範囲や利用条件を確認してから、後の公開手順で設定します。
          </p>
          <Success>
            今は保存までならPagesを有効にせず、Code画面にindex.htmlが残っている。
          </Success>
        </section>
        <section>
          <h2>11. よくあるつまずき</h2>
          <ul>
            <li>
              <strong>Sign inに戻る：</strong>メール確認とログイン状態を確認。
            </li>
            <li>
              <strong>Newが見つからない：</strong>Your
              repositoriesを開き、Newを探す。
            </li>
            <li>
              <strong>Add fileがない：</strong>
              自分に書き込み権限があるrepositoryか、Codeタブか確認。
            </li>
            <li>
              <strong>index.html.txtになった：</strong>
              ファイル名をCode画面で確認し、正確にindex.htmlへ直す。
            </li>
            <li>
              <strong>commitできない：</strong>
              変更内容があるか、必須の説明欄が表示されていないか確認。
            </li>
            <li>
              <strong>スマホ：</strong>
              長押しでコピー／ペーストし、iPhoneはSafariのタブ一覧とFiles/Downloads、AndroidはChromeのタブ一覧とDownloadsから元のHubやファイルを探します。実機での成功保証ではありません。
            </li>
          </ul>
        </section>
        <section>
          <h2>12. 元のGameAI Hub作業へ戻る</h2>
          <p>
            新しいProjectは作りません。Safari／Chrome／PCブラウザのタブ一覧から、開いたままのGameAI
            Hubを選びます。指示をCopilotへ送り、返った <code>index.html</code>{" "}
            全文をHubへ貼って「ゲームを表示」します。
          </p>
          <Success>
            同じtask、ゲーム案、完了条件が残った画面へ戻れている。
          </Success>
        </section>
        <ReturnToProject returnTo={returnTo} />
      </div>
    </ArticleFrame>
  );
}
