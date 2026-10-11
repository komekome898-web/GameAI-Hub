# 草稿記事の最終引き継ぎ

## 公開切り替えの追加指示（2026-10-11）

親レビュー後の追加指示で、記事の草稿表示とexplicit noindex/nofollowを除き、registryをpublishedへ切り替える差分をPR175に準備した。以下の草稿状態・一覧除外・検証結果は先行段階の記録であり、現在の公開設定はpageとregistryを参照する。

独立レビューの指摘に対応し、実演の選択欄の直前に未実行の編集が消えること、切り替える前に実行し、ファイルを残すにはHTMLを保存することを明記した。aria-describedbyで選択欄にも関連付けた。保存できる場合に戻るのは前に実行したコードであり、毎入力の保存とは説明しない。共有workspaceを変更せず、未実行編集の切替と実行済み編集の復元をE2Eで分けて確認する。

共有表示内の「ここで詰まった」はこのページにないため、実演の直前にエラーを手動コピーして既存の#ask-ai相談例に添える案内を追加。新しい相談frameworkは追加していない。

公開一覧・sitemap掲載、indexable metadata、既存カテゴリ順序・公開件数18を検査する。最新main a4958ffと別のseven-introduction作業は変更しない。公開設定への変更はmerge・production deployの実行ではなく、親の最終レビューまでPRをdraftのまま保留する。最終HEADとgate結果はPR175と親への引き継ぎ報告を参照。

公開切替後の保存証拠: article-browser/results-{1280,375,320}.jsonはpublishedIncludedInListingAndSitemap=true、E2E4件PASS（1.8m）、本番build PASS。publication-demo-320.pngは追加注意文と相談案内の目視用。captureの4幅も横はみ出しなし、通常wheelでリセットへ届く。既存公開件数の期待値を18へ更新し、対象unit14件PASS。保存証拠をcommitした後、同じ最終HEADで全qualityとE2Eを再実行して親へ報告する。再検査のE2E出力はBUILDIARY_EVIDENCE_DIRで/tmpに分け、保存済み証拠への無関係な再描画差分を避ける。

草稿段階（2026-10-11）の実装ソースの独立レビュー対象は89312f15c207d68a91f956e88f3c9f299c14a6e6、取り込んだmainはa4958ff758db02dfddba90f501a844091d7e75ad（ElevenLabs修正 #174）。草稿段階の後続commitは検証結果と資料の更新です。

## 成果物

- 記事: app/articles/ai-html-game-not-working/page.tsx。草稿、noindex/nofollow、公開一覧・sitemapから除外。
- 単一の切替式実演: components/HtmlGameDebugDemo.tsx、data/html-game-debug-examples.ts。既存部品を使用。
- 独立HTML: article-demonstrations/fixtures/*.html。元HTMLの検証資料はfixtures/、狭幅のbox-model検証はlayout-correction/。
- 再実行: generate-fixtures.cjs、verify.cjs、generate-article-examples.mjs、article-demonstrations/verify.cjs、capture-article.mjs。
- 結果: results.json、layout-correction/results.json、article-demonstrations/results.json、article-browser/results-{1280,375,320}.json、original-article-results.json、visual-metrics.json。
- PNG: 各screenshots/、article-browser/。原典と比較した日本語研究稿はdraft-ja.md、実装との差はARTICLE_STAGE.md。

## 実測結果

Chromium 151.0.7922.173、Linux、ローカルHTTP。元コードはHP 24/18から20/12、16/6、16/0で3回目に勝利。勝利時に攻撃を無効化し、通常のリセットで有効化して2周目も勝利する。

1. constの値欠落: SyntaxErrorで初期化停止。静的HTML・HP・ボタンは残り、敵名の初期化が行われない。
2. #fightを#attackと誤指定: nullへの操作でTypeError。セレクタの最小修正で回復。
3. reset内の再有効化だけを欠落: 1回目の勝利は成功。例外は出ず、リセット後も攻撃がdisabled。再有効化を戻すと2周目も成功。

各破損版はJSの不具合1個。修正版のJSは元版と同一。終了時のdisabledは維持し、disabledボタンは通常マウスクリックで無反応を検証。force-clickは使用していない。

新実演だけborder-boxと語単位の見出し改行を適用。元記事・共有BeginnerGameWorkspace・app/globals.css・ElevenLabs記事とテストにはmainとの差分がない。320pxで末尾1文字だけの見出し折り返しを解消。375/320/160pxでは通常wheelで枠内のリセットへ届く。160px/DPR2はreflow stressであり、ネイティブzoomや実機の検証ではない。

## 品質チェック

- 元fixture21ケース、layout correction21ケース、新実演fixture21ケース: PASS（各7版×1280/375/320px）。
- PATH=/tmp/buildiary-ruby/bin:$PATH VITEST_MAX_WORKERS=1 npm run quality: PASS。47 test files / 370 tests、Python76 tests、lint・型・記事・ゲーム・workflow等の検査を完了。
- Ruby不在は署名済みDebianパッケージを/tmpへ展開したRuby 3.3.8で補った。システムへのinstallは行っていない。
- デフォルト並列の既存project-generator-clientテストに5秒timeoutが1件あったため、テストを変更せず標準worker環境変数で直列実行。対象11件も単独PASS。
- PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test e2e/html-game-debug-article.spec.ts --workers=1: PASS、4件（2.2m）。webServerがVERCEL_ENV=production npm run buildを実行し、本番buildもPASS。最新main取り込み後に再実行。
- BUILDIARY_LOCAL_URL=http://127.0.0.1:3109 node docs/research/html-game-debug/capture-article.mjs: PASS。hydrationとfonts.readyを待って保存。1280/375/320/160pxでhost/frame横はみ出しなし、通常wheelでresetReachableByOrdinaryWheel=true。320px PNGも目視確認。
- 独立レビュー: INDEPENDENT_REVIEW.md。P0/P1/high-impact P2なし。

## 限界と取り扱い

Safari/Firefox・実機・file://外部moduleは未検証。既存workspace由来のnavigate-to CSP未対応警告は元記事にも再現し、今回の意図的JS例外と区別して記録した。未知のゲーム全般の修復を保証する結果ではない。

相談テンプレートは最初の関連エラーと最小限のHTML/JS、期待値・実際の挙動を共有し、keys/tokens/cookies/private pathsを除く。診断サービス、アカウント、課金呼び出しは追加していない。

草稿の最終scope・証拠を親スレッドへ報告してからmerge判断へ進む。mainへのpush、merge、公開、production deployは行っていない。
