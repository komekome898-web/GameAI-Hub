import type { Metadata } from 'next';
import { ArticleFrame } from '@/components/ArticleFrame';
import { articleMetadata, getArticle } from '@/data/articles';

const article=getArticle('ai-completion-claim')!;
export const metadata:Metadata=articleMetadata(article);

export default function AiCompletionClaimArticle(){return <ArticleFrame article={article}><div className="article-content">
  <header className="page-head">
    <p className="eyebrow">FIELD NOTE / QUALITY</p>
    <h1>AIが「完成しました」と言っても信用してはいけない理由</h1>
    <p className="lead">AIは、作業報告をとてもきれいにまとめる。だからこそ危ない。「完成」「修正済み」「問題なし」という言葉を、成果物そのものと取り違えない方がいい。</p>
  </header>

  <section><h2>「終わった」と「使える」は別</h2><p>AIが言う「完成」は、多くの場合「依頼された変更を一通り実行した」という意味に近い。</p><p>しかしユーザーが知りたいのは、「本当に使えるか」「壊れていないか」「目的を達成できるか」だ。この2つは同じではない。</p></section>

  <section><h2>報告書は成果物ではない</h2><p>テスト成功、ビルド成功、レビュー済み。こうした報告は重要だが、それだけで品質は確定しない。</p><p>画面なら実際に見る。ゲームなら実際に遊ぶ。リンクなら実際に押す。保存機能なら更新して戻る。<strong>最終確認は、ユーザーが触るものと同じ形で行う。</strong></p></section>

  <section><h2>AIは検査項目を満たしても、目的を外すことがある</h2><p>横スクロールがない、という条件だけなら、本文を不自然に細くしても達成できる。ボタンが存在する、という条件だけなら、何をするボタンか分からなくても達成できる。</p><p>検査項目は必要だが、検査項目そのものが目的になった瞬間に品質は崩れる。</p></section>

  <section><h2>完成判定をAIの言葉から切り離す</h2><p>私は、完了条件を「AIがそう言ったか」ではなく「外から確認できるか」で考える方が安全だと思っている。</p><p>たとえば、ゲームなら「起動する」「操作できる」「勝敗がつく」「やり直せる」。記事なら「リンク切れがない」「CTAの遷移先が正しい」「スマホで読める」。</p></section>

  <section><h2>一番強いのは、再現できる証拠</h2><p>スクリーンショット、操作手順、テスト結果、URL、コミット。こうした証拠は、別の人や別のAIが後から確認できる。</p><p>「私は確認しました」より、「この状態をこの手順で確認できます」の方がずっと強い。</p></section>

  <section><h2>AIを疑うのではなく、確認を仕組みにする</h2><p>毎回AIの報告を疑って疲れる必要はない。完成判定を仕組みにしてしまえばいい。</p><p><strong>実装 → 実物確認 → 問題分類 → 修正 → 再確認</strong>を工程として固定する。そうすれば「完成しました」という言葉は、最終判断ではなく次の確認へ進む合図になる。</p></section>
</div></ArticleFrame>}
