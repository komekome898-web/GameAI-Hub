> 引き継ぎ用コピー。判定本文は元レポートのまま、リンクのみ保持済み画像／JSONへ調整。未保持の一時証跡はその旨を表示。元レポートSHA256: `708edb7dae751fb53bdfc3ef529930fcb2d889e40b6376b1b03604adb05c78f1`。

# B3 共通部品 — 独立描画レビュー・第二パス

## 判定

**今回の独立描画レビュー範囲はPASS。** 第一パスの必須P2、FV-01／02／03を実操作と実画面で解消確認しました。確認した代表画面では、新しいP0／P1／必須P2を観測していません。下記P3を軽微な未解決点として残します。これは全route全行・全ブラウザ・実外部provider・CI・merge-readyの包括的な合格ではありません。今回のmerge／publish禁止も変わりません。

## 固定した対象・方法

- HEAD `e555d81678440a2faa76538b83e22f875ee96e93`、source `/workspace/GameAI-Hub-b3-components`。
- ローカルruntime `http://127.0.0.1:3102`、build `zRTspQ8ojf93LGGMfzTnt`。終了時も同じHEAD／buildで、app／components／data／lib／public／e2eのHEADとの差分は空です。4CSS hashとstatusは [final-pin.json](final-pin.json)。
- AGENTS／UI_ACCEPTANCE／v2 authority／reflow contractに従い、実装担当と別にChromiumの描画を目視しました。既存Playwrightと`/usr/bin/chromium`使用。source／CSS／test／Git／build／serverは変更せず、証拠は`/tmp`へ保存しています。
- 各contextの最初はローカル`/privacy/?gameai_analytics=off`。通常JSの代表contextでexcluded=true／eligible=false／保存値1を記録。同contextを使い計測requestも遮断。本番URLは開いていません。JS無効SSRケースではclient除外flagの実行を主張せず、JavaScript無効と計測request遮断を方法として記録しました。
- 1440×900、375×667、320×667。文字stressはroot150／200、別方法のsynthetic-computed200、独立spacingを区別しています。viewport emulationを実機／OS zoomと呼びません。

## 必須指摘の再現・解消

| 第一パス | 新pinでの実操作と実画面 | 判定 |
|---|---|---|
| FV-01：invalid枠が通常色 | Project／Builder各1440・375・320で監査入力→固有情報をinclude→空白へ編集→Plan作成。通常`1px solid rgb(124,137,109)`からinvalid `2px solid rgb(163,59,53)`へ変化。ARIA true、focus維持。320のinputはy348.67〜427.05、header下のviewport内で、赤枠と緑focus ringを別に読めます。[project-invalid-320.png](../final-e555/project-invalid-320.png)、builder-invalid-375.png（未保持のローカル証跡）。 | 解消 |
| FV-02：include／ignoreの表示差消失 | 同じ6ケースでinclude→ignore→includeを実クリック。選択済みdark/creamと非選択paperが入れ替わりARIAと一致。project-include-375.png（未保持のローカル証跡）、builder-include-1440.png（未保持のローカル証跡）。 | 解消 |
| FV-03：stuck Copyが標準灰色 | Project1440・375・320、Builder375で初心者result→「ここで詰まった」→「相談文をコピー」を実クリック。solid olive枠、paper gradient、inset/edge shadow、高さ45.19〜46px。UA outset／grayが消え、コピーfeedbackも出ます。[project-stuck-320.png](../final-e555/project-stuck-320.png)、project-stuck-1440.png（未保持のローカル証跡）。 | 解消 |
| FV-04：Home375見出しの「ら」だけ改行 | 「作りたいもの／が決まったら」の2行へ調整され、孤立一文字が消えています。入力・CTA・例・出力入口の位置も読めます。[home-form-375.png](../final-e555/home-form-375.png)。 | 解消 |

[actual-state-coverage.json](actual-state-coverage.json)は実入力／選択／invalid／stuckと復旧の根拠です。interpret APIは意図してabortしたlocal fallback。320では無害な監査HTMLをpreviewし、iframeボタンを押し、動いた版を記録、試験用runtime errorを発生させ、「動いた版へ戻す」で監査用ゲームが復旧しました。利用者の実コードや外部provider障害のreset合格に拡張していません。

## fallback追加の副作用・残存UI

provider候補確認は**ローカルmock API応答fixture**を実UIで開いて確認しました。1440／375／320で「この候補を確認」「選択された制作工程を確認」が共通paper control、高さ44px以上。実クリックで確認待ちcontrolが消えました。[provider-candidate-fixture-320.png](../final-e555/provider-candidate-fixture-320.png)。これは実外部providerの成功証拠ではありません。

Privacy controlも3幅で共通paper／solid edgeへ。privacy-control-375.png（未保持のローカル証跡）。計測再開ボタンのpaintを確認し、実環境の計測設定を変更したという意味ではありません。Tools0件panelと、JS無効で実際にserver-renderされたloading fallbackはfirm olive frameへ。[tools-empty-375.png](../final-e555/tools-empty-375.png)、tools-ssr-loading-375.png（未保持のローカル証跡）。DOMで作り物のloading要素を挿入していません。

provenanceは「明記」緑`rgb(49,90,66)`／「確認」青`rgb(39,100,198)`／「未確認」橙`rgb(194,65,12)`、文言と枠の差を保持。色の統一で意味を消していません。[rare-state-coverage.json](rare-state-coverage.json)。新fallbackが主要amber Action、deckのdark control、disabled、code／workspaceを標準grayへ戻した例は、確認した代表画面ではありません。

## 新pinの目視範囲（上・中・下／状態）

| route・family | 新pinで目視した区画・状態 | 主な証拠 |
|---|---|---|
| Home `/` | 上部：作品画像first view、カードの厚みと主操作。中部：カテゴリdeck／一覧。下部：制作入力・例・出力入口。 | `home-main-1440/320.png`、`home-category-deck-375.png`、`home-category-list-320.png`、`home-form-375.png` |
| Articles `/articles/#categories/#start/#all/#games` | カテゴリ、記事deck、全18一覧、8作品list、紹介と遊ぶ。375で次へ＋一覧を実クリック。320で静的一覧。 | `articles-category-1440/320.png`、`articles-all-375.png`、`article-start-deck-375.png`、`article-game-list-320.png` |
| Reading `/articles/ai-browser-game-how-to/` | 上部h1／lead／更新／contract、本文紙面、記事内Workspaceとcode入力、Copy feedback、下部Project CTA。 | `article-reading-1440/320.png`、`article-workspace-spacing.png`、`article-copy-feedback-375.png`、`article-handoff-375.png` |
| Tools `/tools/`／0件query／`/tools/meshy/` | 上・中：goal選択、field、empty／loading。detailのfacts／主要Action。文字stress。 | `tools-filter-1440/320.png`、`tools-empty-375.png`、`tool-detail-1440/320.png`、`tools-computed200-320.png` |
| Guides `/guides/`、Stack `/stacks/2d-rpg/` | stage入口／下のresource、Stack内tool／factsの代表。 | `guides-375.png`、`stack-detail-1440/320.png` |
| Compare `?ids=meshy,elevenlabs` | 選択tray／decision、desktop table、mobile criteria、spacing。 | `compare-selected-1440/375.png`、`compare-table-1440/320.png`、`compare-criteria-spacing.png` |
| Project／Builder | 条件確認の実selected／invalid／provenance、初心者resultのworkspace、下のstuck／copy、試験用iframe error→restore。 | 両`*-include/invalid-*.png`、`project-workspace-1440/320.png`、`project-recovery-320.png` |
| Games `/games/create-monsters/` | 縦画像の作品detail、タイトル・無料／インストール不要。画像は自然な縦長表示、viewport下へ続くことをcropと混同しません。 | `game-portrait-375.png` |
| Shared | header、320 root200 menu最終focus、Escape、3幅footer、Privacy操作、404。 | `menu-root200-last-focus-320.png`、`footer-1440/375/320.png`、`not-found-375.png` |

明るいreading paper、Workspace内の入力／版の区別、local code region、作品画像の尊重は保たれています。カード/listの操作が見え、材料変更だけで全内容を暗い厚枠へ押し込めていません。

## coverageと方法の区別

- **新版e555：** 17代表surface×3幅＝51訪問、代表PNG26点＋focused states。selector missing=0、document overflow=0、pageerror=0。[route-state-coverage.json](route-state-coverage.json)。目視区画は上表で、51全ケースの全行を個別目視したという意味ではありません。
- **旧0419第一パス：** 全76UI route×3幅＝228訪問のHTTP／H1／overflow／error／共有family property sweepは旧buildの補助証拠です。新版e555で全76×3を再実行したという意味ではありません。第一パスの全route sweepを新pinの目視合格へ付け替えていません。
- root150／200はカテゴリ375、Tools320、Project320。Toolsのroot法ではbody／field／choiceの16→32pxを実測。synthetic-computed200は基準computed fontを同時snapshotして2倍にし、root200と別方法。短い日本語choiceは幅230px・font32pxで1行、長い「アニメーション」は幅を使った2行で、以前の1〜2字縦積みはありません。
- spacingはline-height1.5／letter-spacing.12em／word-spacing.16em／paragraph margin2emを記事Workspace320とCompare mobile320へ独立適用。文字／controlの衝突、clipping、document overflowを観測していません。
- 320 root200 menuは最後のPrivacyまでfocusが届き、dialog内focus、Escape後triggerへ戻ります。header矢印boxのclient／scrollHeightは65／65px。[reflow-interaction-coverage.json](reflow-interaction-coverage.json)。
- 通常375のカテゴリ／記事／作品はnext／一覧を実クリック、5／6／8件。320と375 reduced-motionは静的一覧。通常font16pxを別contextで確認して再captureした [cards-normal-recheck.json](cards-normal-recheck.json) が最終証拠です。
- 検査helperの最初のcard部分はsame-document hash移動でroot200を継承しました。その記録を通常375としてPASSにせず、supersededを付けてfont16pxの別contextで再検査・同PNGを更新済みです。provider helperも閉じた「条件を自分で変更する」を開く実操作を補い、空／hidden controlのPASSにしていません。

## 未解決・未検査

**SV-01、P3（軽微、未解決）：** Project stuck320の「できたもの・次に作るもの」が末尾「の」だけ次行へ改行します。[project-stuck-320.png](../final-e555/project-stuck-320.png)。主要操作は見え、読める幅とtargetを維持しています。見出しのbalanced wrap等で磨けますが、今回のblocking failureとは扱いません。

- 実機iPhone／Android、Safari、OS zoom／OS text／soft keyboard／touch、実native file picker／Downloads：UNTESTED。
- 本番／deployment、実外部provider成功／timeout／rate limit、利用者の実際のエラーからのreset／外部provider障害復旧：UNTESTED。mock API候補controlと試験用local iframe restoreだけを確認しています。
- storage／Clipboard拒否、file読込失敗、forced-colors、すべての長いASCII／URL／本文組合せ、全route全行の個別目視：UNTESTED。
- 全handoff query／Hub return／pricing事実／SEO／analyticsの完全機能検証、CI／quality／buildの実行：別担当の範囲。本レビュー単独でそれらのPASSやmerge許可を付けません。

新pinの必須visual指摘は解消確認済み。以後sourceを変更した場合、その変更範囲を再評価し、このe555レビューを別HEADの合格証拠へ転用しないでください。
