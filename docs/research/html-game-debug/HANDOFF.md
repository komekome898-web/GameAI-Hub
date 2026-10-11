# 草稿記事の最終引き継ぎ

2026-10-11。実装ソースの独立レビュー対象は89312f15c207d68a91f956e88f3c9f299c14a6e6、取り込んだmainはa4958ff758db02dfddba90f501a844091d7e75ad（ElevenLabs修正 #174）。後続commitは検証結果と資料の更新です。

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
