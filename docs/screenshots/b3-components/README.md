# B3 内部コンポーネント統一の確認資料

採用済みHome B3の深いオリーブの物理的な枠、暖かい紙面、凹んだ作業面、琥珀色の主要操作を、内部カード／フォーム／選択／比較／読書／制作／回復操作へ適用した修正です。明るい本文と、エラー・出典確認・AI抽出などの意味を持つ色は残しています。新しいデザイン提案やProduction反映の記録ではありません。

## コードと証跡の区別

- 修正コードの固定点：`e555d81678440a2faa76538b83e22f875ee96e93`。
- ローカルのproduction-modeビルド：`zRTspQ8ojf93LGGMfzTnt`、Next.js 16.3.2、Chromium。
- 比較元：main `b5f3887d1d5299ed95f2cfbe6acf391e5c047042`。保持した`f05ff0f`のアプリツリーは同一、ビルド`e6kNGqhSIVpfqFLf0m--c`。
- このディレクトリの後続コミットは証跡・報告の追加です。コードの固定点と提出コミットは別に記録します。
- [画像ハッシュと出所](retained-evidence.json)：修正後33枚、比較用4枚。画像は代表的な保持分です。レビューJSONには、保持しなかった一時キャプチャの名前も含まれます。
- 画面幅1440／375／320pxはviewport reflow。root150／200とcomputed200は合成テキスト拡大で、実機やOSの文字拡大ではありません。

## 代表画面

| 対象 | PC／狭い画面・状態 |
|---|---|
| Home・既存の作品ファースト | [1440](final-e555/home-main-1440.png)、[375](final-e555/home-375.png)、[320](final-e555/home-main-320.png) |
| 内部カード | [記事カテゴリ1440](final-e555/articles-category-1440.png)、[Homeカテゴリ375](final-e555/home-category-deck-375.png)、[同一覧](final-e555/home-category-list-375.png)、[ゲーム画像375](final-e555/game-portrait-375.png) |
| Tools・Compare | [絞込320](final-e555/tools-filter-320.png)、[実computed200・320](final-e555/tools-computed200-320.png)、[ツール詳細320](final-e555/tool-detail-320.png)、[比較1440](final-e555/compare-table-1440.png)、[比較375](final-e555/compare-selected-375.png) |
| 読書・下部導線 | [記事1440](final-e555/article-reading-1440.png)、[コピー結果375](final-e555/article-copy-feedback-375.png)、[Home制作フォーム375](final-e555/home-form-375.png)、[footer375](final-e555/footer-375.png) |
| 制作・回復 | [作業面1440](final-e555/project-workspace-1440.png)、[375](final-e555/project-workspace-375.png)、[相談375](final-e555/project-stuck-375.png)、[動いた版へ戻す320](final-e555/project-recovery-320.png) |
| 実状態 | [Project入力エラー320](final-e555/project-invalid-320.png)、[Builderエラーroot200・375](final-e555/e555-builder-invalid-root200-375.png)、[AI候補確認](final-e555/e555-provider-nine-confirm.png)、[能力確認](final-e555/e555-provider-capabilities.png)、[Privacy操作320](final-e555/privacy-control-320.png)、[空結果375](final-e555/tools-empty-375.png)、[出典の意味色](final-e555/e555-provenance-375.png)、[Compare実SSR fallback](final-e555/e555-state-compare-js-off-loading-375.png)、[menu root200・320](final-e555/menu-root200-last-focus-320.png) |
| 比較元 | [カテゴリ1440](before-b5f/articles-categories-1440.png)、[375](before-b5f/articles-categories-375.png)、[Tools375](before-b5f/tools-goal-375.png)、[入力エラー375](before-b5f/project-invalid-375.png) |

## 検証範囲

全76公開UIルート＋404 ×3幅＝231件の到達性・main・幅などの巡回は、全ページの目視承認ではありません。[巡回記録](review/e555-route-manifest.json)と[追加ボタン記録](review/e555-controls-manifest.json)を分けています。

独立した目視／実操作は`visual_mobile_review`と`sitewide_route_review`が担当しました。[描画担当の最終レビュー](review/independent-visual.md)、[状態・ルート担当の最終レビュー](review/independent-route.md)は修正6種類を解消確認し、確認範囲で新しいP0／P1／必須P2なしとしています。代表ページの上部・内容・下部、共有するカード／フォーム／比較／制作／回復／メニューと実状態を確認しました。視覚担当の第二パスは17代表×3幅＝51訪問と追加状態です。ソース／ルート担当は231巡回に加え、修正6種類、16実フロー、6キーボード記録とカード操作を確認しました。[代表画面の記録](review/route-state-coverage.json)、[拡大・操作の記録](review/reflow-interaction-coverage.json)、[稀な状態の記録](review/rare-state-coverage.json)、[実フロー記録](review/e555-flow-manifest.json)、[キーボード記録](review/e555-keyboard-manifest.json)を参照してください。

初回レビューで見つかった6種類の必須P2は、入力エラー枠、include／ignoreの選択表示、候補確認／回復のUAボタン、Privacyの44px未満、空結果／SSR fallback、出典色の平坦化でした。第二パスは修正コードの同一固定点で実操作を再現しています。[修正確認](review/e555-fixes-manifest.json)、[SSR状態](review/e555-ssr-state-manifest.json)。未解決の軽微P3として、[相談320](final-e555/project-stuck-320.png)の「できたもの・次に作るもの」の末尾「の」が単独行になる箇所を残しています。主要操作の阻害としては観測されていません。

## テスト結果と前回失敗

| 固定点・ゲート | 結果／記録 |
|---|---|
| e555 quality | 49ファイル・384テスト＋Python76件PASS。[ログ](review/quality-e555.log) |
| e555 production-mode build | PASS。[ログ](review/build-e555.log) |
| e555 対象E2E | 旧対象21件＋provider確認1件＝22/22 PASS、9.0分。[ログ](review/e2e-e555.log) |
| e555 実回復操作 | 初心者Aフロー（相談文コピー、3作業、進捗）1件PASS。[ログ](review/recovery-a-e555.log) |
| e555 音声素材フロー | 1件PASS。[ログ](review/recovery-e555.log) |
| e555 deck/B3 CSS gzip | browser CompressionStream8153／8192byte、Node zlib8157。既存4CSS内で測定、移動・分割による測定除外なし。[記録](review/e555-css-budget.json) |

0419の対象E2Eは19/21件でした。[初回ログ](review/e2e-0419.log)。1件目は前の幅で保存されたHubのgames表示を、テストがcategoriesと仮定したfixtureの問題です。実際の永続化を保持し、明示的な`#categories`を使って対象状態を指定しました。2件目は実際のCSS優先順位の不具合で、`aria-invalid`とfocusは正しくても通常の緑1px枠が残っていました。通常フィールドとinvalidのspecificityを揃え、後段の赤2px枠を有効にしました。両方ともe555の22件に含めて再実行PASS。入力エラーはProject／Builderの両入口で再現しています。

独立診断の折りたたみラベル待ちも、診断が実ラベル「概要を閉じる」を誤指定したfixtureの失敗です。診断のみ修正し、実UIのTab→展開→Enter→閉じるfocusまで再検査しました。製品側のラベルや挙動は変更していません。

全E2Eと最終cross-route reconciliationはDraft PRの最終コミットで別途CI結果を記録します。旧PR183の結果を今回の結果として扱いません。

## 未検査とプレビュー

実機iPhone／Android、Safari、OS文字拡大、ソフトキーボード、長押し貼付、OSのFiles／Downloads／タブ切替、実プロバイダーの全応答・拒否・障害、実error boundaryのresetはUNTESTEDです。外部ツール／ゲームは実行していません。provider状態はローカルAPI fixture、ゲームの回復は無害なHTML fixtureを実iframeに渡した操作です。JS無効のSSR fallback、生成済みDirectoryStateの一時描画、実ネットワーク・境界障害は区別しています。全18記事・29ツールの各本文行／事実を新規監査したとは主張しません。

ローカル再現：ブランチを取得し、依存を揃えて`npm run build`、`npm run start -- -H 127.0.0.1 -p 3102`。最初に`http://127.0.0.1:3102/privacy/?gameai_analytics=off`で除外状態を確認し、同じbrowser contextを使います。親スレッドからlocalhostは見えないため、上のコミット済み画像と報告が引き継ぎ資料です。Productionへのmerge／公開操作は実施していません。
