# 警告余白修正後の確認

この資料は branch source `ed5fd95902de06fe9cc1e54a50882c69842d7bb5`、local production-mode build `0am_yq1bZC1fJIszJq00d`、`http://127.0.0.1:3102` の証拠です。旧 e555／7e8・build zRT の全体画像を新コードでの撮影に読み替えません。

旧撮影以後の runtime 差分は、元の Globals 警告リストに追加した `.phase-warning li{padding-inline-end:.5em}` のみです。測定では閉じた非描画内容を除き、実際に見えるクリップを引き続き拒否します。native 回帰と、元の初心者／Godot の secondary-plan で外側から summary をクリックして fit 警告まで開く観測を追加しました。manual PASS や必須 variant の除外はしていません。

## ローカル実行

- [対象6/6](targeted-six.txt)：Issue157Project＋B3 components5件、3.1分。runtime は現在と同じ3d source、追加の開いた Godot 観測だけは後の ed5 です。
- [native Godot 観測を追加した Project1/1](native-godot-project.txt)：ed5 source、2.2分。[375px全体画像](project-no-workspace-fit-open.png)、[元の自動測定 record](native-godot-record.json)。可視クリップ、document／unowned overflow、44px未満の対象は0、focus reachable／visibleはtrueです。自動PASSを人の目視承認と扱いません。
- [ローカル build](build.txt)：成功。[CSS予算](css-budget.json)：Home／記事で同じcompiled deck／B3 CSS、browser8153／8192byte、Node8157。
- ローカル最終qualityでは384件＋Python76件が通過後、環境再開でRubyがなくworkflow validatorだけ実行不可でした。validatorを省略せず、[CI quality／build](https://github.com/komekome898-web/GameAI-Hub/actions/runs/38363660354)の完全成功で確認しています。[CI要点](quality-ci-excerpt.txt)。実checkoutはmerge ref `12303aa3e1b21560640e51d3a3c1d05a7868cc00`（ed5＋main b5f）です。
- [全E2E CI38363660415](https://github.com/komekome898-web/GameAI-Hub/actions/runs/38363660415)：287/287成功、23.8分。その後に最終cross-route reconciliation1/1成功、30.5秒。flaky表記なし。[公式ログの要点](full-e2e-ci-excerpt.txt)。検査対象は上記merge ref、branch sourceはed5です。後続の資料専用コミットをCI実行済みSHAとして扱いません。

自動Project emitterの`target.baseUrl`は元から3100固定です。ローカル再実行は[設定](local-playwright.config.ts.txt)で3102へ向けています。この不一致を元recordの書換えで隠さず、実origin／buildをwrapperへ記録しました。独立した再撮影も3102を明記します。

実機、Safari、OS文字拡大、外部providerの実応答は未検査です。APIはローカルfixture、native detailsは実ブラウザ操作です。

## 独立した変更箇所の再確認

[限定レビュー](independent/review-ed5.md)、[6画像と原本hash](independent/deliverables-ed5.json)、[計測](independent/observations-ed5.json)、[コード・build・旧R7不変性](independent/source-build-hashes-ed5.json)を保全しました。レビュー原本とhashは変更していません。原本のCI pendingはレビュー時点の記述で、上の公式CI結果が後続の確認です。

| 375px | 320px |
|---|---|
| [全文の警告](independent/ed5-godot-warning-375.png)・[実viewport](independent/ed5-godot-warning-viewport-375.png) | [全文の警告](independent/ed5-godot-warning-320.png)・[実viewport](independent/ed5-godot-warning-viewport-320.png) |

375pxはLI client／scrollが旧145／152から145／145へ、320pxは102／102です。可視glyphの外側超過、strict fit probeのクリップ、document／unowned overflowは両幅0。祖先detailsを実summaryクリックで外側から開き、ShiftTab→Tabでsummaryが可視、44px高、green3px outline／3pxoffsetを確認しました。warning本文のcontrast12.07:1、focus7.40:1は実取得色からの合成計算です。

fit-open画像は文脈用です。特に[375のfit部分](independent/ed5-godot-fit-open-375.png)はviewport端で下部が切れた部分キャプチャで、全文の証拠は上表です。1440／拡大文字／全条件・全サイトの再目視をこの限定レビューから推定しません。未変更の各ページには旧画像が対応し、変わった警告にはこの新画像が対応します。
