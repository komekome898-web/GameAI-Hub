# 親レビューで不足した系統の追加画像

親スレッドの2026-10-13追送依頼に従い、以前の保持画像だけでは確認できなかった内部画面を追加しました。アプリ・テスト・データを変えない証拠追加です。以前の231巡回／独立目視の件数を増やすものではありません。

- 描画コード：`e555d81678440a2faa76538b83e22f875ee96e93`。撮影時のHEAD／CI対象：`7e8d8313fce958e83104a89e864471d72b6fa262`。両者のruntime/test範囲は差分なし。
- ローカルbuild：`zRTspQ8ojf93LGGMfzTnt`、Chromium、1440×900／375×667／320×667。
- 8代表ルートとその表示状態、46PNG。[個別URL・幅・scroll・open状態・SHA256](manifest.json)。通常root16px。viewport画像と、実viewportでのelement全体キャプチャ2枚を区別しています。
- 最初に各contextの`/privacy/?gameai_analytics=off`で保存された除外値1を確認。同contextでlocalhost以外を遮断。実機・Production・外部ゲーム／ツールの証拠ではありません。
- Guideの実summaryクリックで閉じ、Enterで開く操作、Guidesの段階選択と解除、Compare実checkboxの選択解除と復元を行いました。全記事一覧は実18項目、Toolsは実29件の表示です。ページerror／各保持時のdocument overflowは0。
- この追加撮影は実装担当による補足です。[独立した追加目視](independent-review.md)は46枚中22枚を確認し、新しいP0／P1／必須高影響P2なし。軽微P3としてMeshy見出し、Stack CTA、320の記事本数の末尾改行を記録しています。前の独立レビューを46枚すべての新規独立目視承認と扱いません。親側の画像評価とCI結果は別の記録です。

| 系統 | 上部／内部・状態／下部 |
|---|---|
| Guides一覧 | 上部：[1440](guides-upper-1440.png)・[375](guides-upper-375.png)。[実段階選択375](guides-selected-375.png)・[resource行375](guides-resources-375.png)。下部：[1440](guides-lower-1440.png)・[375](guides-lower-375.png) |
| Guide詳細 | 上部：[1440](guide-detail-upper-1440.png)・[375](guide-detail-upper-375.png)。[閉じた状態375](guide-detail-closed-375.png)。実Enterで開いた状態：[1440](guide-detail-open-1440.png)・[375](guide-detail-open-375.png)・[320](guide-detail-open-320.png)。[375の開いたカード全体（element capture）](guide-open-card-375.png)。下部：[1440](guide-detail-lower-1440.png)・[375](guide-detail-lower-375.png)・[320](guide-detail-lower-320.png) |
| Stack一覧 | 実カード：[1440](stacks-cards-1440.png)・[375](stacks-cards-375.png) |
| Stack詳細 | 上部：[1440](stack-detail-upper-1440.png)・[375](stack-detail-upper-375.png)。内部tool card：[1440](stack-detail-tools-1440.png)・[375](stack-detail-tools-375.png)・[320](stack-detail-tools-320.png)。[375のカード全体（element capture）](stack-tool-card-375.png)。下部：[1440](stack-detail-lower-1440.png)・[375](stack-detail-lower-375.png)・[320](stack-detail-lower-320.png) |
| Articles START | 実記事カード：[1440](articles-start-card-1440.png)・[375](articles-start-card-375.png)・[320](articles-start-card-320.png) |
| 全記事一覧 | 「すべての記事（18本）」と実一覧：[1440](articles-all-list-1440.png)・[375](articles-all-list-375.png)・[320](articles-all-list-320.png)。一覧全18項目の存在を確認、画像は表示先頭部分です。全18本文を監査した意味ではありません。 |
| Compare | 選択トレイ：[1440](compare-selection-tray-1440.png)・[375](compare-selection-tray-375.png)・[320](compare-selection-tray-320.png)。選択済みcheckbox：[1440](compare-checked-candidate-1440.png)・[375](compare-checked-candidate-375.png)・[320](compare-checked-candidate-320.png)。[実解除したcheckbox375](compare-unchecked-candidate-375.png)。その後チェックを復元しています。 |
| Tools候補あり | 実29件の結果とrow：[1440](tools-populated-rows-1440.png)・[375](tools-populated-rows-375.png)・[320](tools-populated-rows-320.png) |
| Meshy適合／不適合 | [GOOD／POOR FIT両パネル1440](meshy-good-fit-1440.png)、[GOOD FIT375](meshy-good-fit-375.png)、[POOR FIT375](meshy-poor-fit-375.png) |

最初の撮影helperは除外storage keyを誤記して待機に失敗しました。アプリ変更はなく、実装の正しいkey `gameai:analytics-excluded`へ診断だけ修正して全追加撮影を再実行しました。採用画像は再実行後のものです。

実機、Safari、OS文字拡大、実外部応答・エラー境界resetは引き続き未検査です。Stackにはこの実ルート内の開閉UIがなく、開閉状態を作り足していません。
