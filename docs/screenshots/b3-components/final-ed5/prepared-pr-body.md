採用済み Home B3 に対して残っていた内部カード、フォーム、選択・比較、読書、制作・回復の旧装飾を統一します。既存4CSS内で深いオリーブの物理的な枠、暖かい紙面、凹んだ作業面、琥珀色の主要操作を共有し、明るい本文とエラー・出典などの意味色を保持しました。実際の入力エラー枠と include／ignore の選択表示も修復しています。

アプリの TSX／JS／データ／画像／依存／設定は変更していません。カードの物理動作、URL／Back／focus、比較、Project／Builder、sandbox、コピー／保存、本文・権利・価格、SEO／計測／アフィリエイトを保護します。

### コードと確認資料

- 現行 runtime／test 固定点：`ed5fd95902de06fe9cc1e54a50882c69842d7bb5`、local production-mode build `0am_yq1bZC1fJIszJq00d`。初期の独立全体確認は `e555d81678440a2faa76538b83e22f875ee96e93`／build `zRTspQ8ojf93LGGMfzTnt`。その後の runtime 差分は、既存警告リストの末尾余白 `.5em` のみです。
- [画像・コード対応、失敗原因と再実行、未検査範囲](https://github.com/komekome898-web/GameAI-Hub/blob/ed5fd95902de06fe9cc1e54a50882c69842d7bb5/docs/screenshots/b3-components/README.md)。初期37画像と追加46画像は旧撮影時点を保持し、変更後 Godot の開いた警告は新ビルドの独立証拠を別に保全済みです。375はLI client/scroll145/145（旧145/152）、320は102/102、両幅の可視クリップ・横はみ出し0。44px summaryの実Tabフォーカスも確認済みです。
- [Guides／Stack 上部・中身・開閉・下部、START 実記事／全一覧、Compare チェック／トレイ、Tools 結果行、Meshy GOOD／POOR](https://github.com/komekome898-web/GameAI-Hub/blob/ed5fd95902de06fe9cc1e54a50882c69842d7bb5/docs/screenshots/b3-components/review-supplement/README.md)。比較元375の旧ファイル名 `articles-categories` は実体が Aramon 作品カードで、カテゴリ before／after とは扱いません。
- 独立2担当が必須6種類の修正を確認。231 route／幅の property 巡回は全ページ目視承認ではありません。目視は17代表×3幅＋状態、別担当の14画像／16実フロー／6 keyboard など、追加画像は22/46の別目視確認です。
- strict deck／B3 CSS gzip は新ビルドでも browser8153／8192byte、Node8157。予算緩和・分割除外なし。

### ゲートと前回失敗

- 最新 branch source `ed5fd95` の [quality／build CI](https://github.com/komekome898-web/GameAI-Hub/actions/runs/38363660354) 成功。実 checkout は `12303aa3e1b21560640e51d3a3c1d05a7868cc00`（ed5 + main b5f の merge ref）です。49ファイル／384テスト＋Python76件、workflow validator、production build が成功しました。
- [全 E2E と final cross-route reconciliation](https://github.com/komekome898-web/GameAI-Hub/actions/runs/38363660415) は成功。全体287/287（23.8分）、続く最終reconciliation1/1（30.5秒）で、flaky表記なしです。実checkoutは上記merge ref12303aa3。旧 PR183 の結果を今回の合格として扱いません。
- 新ビルドの対象6/6と、実際の Godot native 開閉を追加した Project1/1 が成功。初期 e555 対象22/22、初心者コピー／進捗1、音声素材1も別の実行記録として保持しています。

0419 の19/21は、保存された Hub 表示を取り違えた fixture と実 invalid 枠 specificity の2失敗でした。明示カテゴリと赤2px枠へ修正し、両方を含む22件が再実行成功しました。

初回全 CI の285通過／1失敗は Issue157 WORKSPACE だけでした（merge ref `e1d6f5d`、最終 reconciliation 未実行）。独立診断で、閉じた非描画内容13件をクリップとして数えた測定不整合を確認し、描画可視性を測定条件に追加しました。開いた内容・閉じた summary の実クリップを引き続き拒否する native 回帰も追加しています。別途、実際に開いた375px警告の末尾括弧7pxの境界超過を末尾余白で修正し、実 native 開閉を strict WORKSPACE の観測へ追加しました。manual PASS／判定上書き／必須 variant 除外はありません。

ローカル最終 quality は環境再開後の Ruby 不在で workflow validator だけ実行できませんでした。このゲートを省略せず、Ruby のある上記 CI で全 quality 成功を確認しています。

軽微P3は320pxの一部見出し末尾の単独行（相談「の」、Meshy「件」、Stack「る」、全記事件数「本）」）。実機／Safari／OS文字拡大・Files／実外部 provider／実 error-boundary reset は未検査です。provider は local API fixture、iframe 回復は無害な HTML fixture の実操作です。

Draft での引き継ぎです。マージ／Production公開は実施していません。
