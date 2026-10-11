# HTMLゲーム不具合の実証資料

承認済みの調査「AIで作ったHTMLゲームが動かないときの直し方」のローカル成果物。公開記事、診断サービス、サイトUIは変更していません。

## 実行と成果物

リポジトリルートから、依存関係 `@playwright/test` とChromiumを使って実行します。

```sh
node docs/research/html-game-debug/generate-fixtures.cjs
BUILDIARY_CHROMIUM=/usr/bin/chromium node docs/research/html-game-debug/verify.cjs
```

生成は掲載例のテンプレート文字列からHTMLを抽出します。各破損版の置換対象が1か所であること、逆の修正で元のHTMLと完全一致することを検査します。修正版も独立したファイルです。fixtureを変更してからverifyだけ実行すれば、その編集を検査できます。generateはfixtureを再生成するので編集を上書きします。

- `fixtures/original.html`: 元の掲載例
- `fixtures/syntax-broken.html` / `syntax-repaired.html`: const値の欠落と修復
- `fixtures/selector-broken.html` / `selector-repaired.html`: 攻撃ボタンのセレクター誤りと修復
- `fixtures/reset-broken.html` / `reset-repaired.html`: リセットの再有効化欠落と修復
- `manifest.json`: 変更前後の文字列、SHA256、出典SHA
- `verify.cjs`: 実ブラウザー検証と一時ローカルHTTPサーバー。127.0.0.1でのみ待ち受け、終了時に停止
- `results.json`: 21ケースの全状態、例外、Console error、幅、ブラウザー版
- `screenshots/`: 初期画面、初回／2周目の勝利、リセット不具合の画面
- `draft-ja.md`: 観測に基づく日本語草稿とMDN参照

## 結果

2026-10-11、Linux、実Chromium 151.0.7922.173、headless、Playwright、ローカルHTTP。1280×800、375×800、320×800で計21ケースが機能面の期待どおりでした。実機モバイルの結果ではありません。

| 版 | 起動／初回 | リセット／2周目 | 例外 |
| --- | --- | --- | --- |
| 元版・3修正版 | 24/18 → 20/12 → 16/6 → 16/0、勝利、攻撃無効 | 24/18へ戻り攻撃可能、2周目も勝利、再リセット可能 | なし |
| 構文不具合 | 静的見出し・HP・ボタンは残る。敵名は空。攻撃・リセットが無反応 | 起動時に処理未登録 | SyntaxError: Unexpected token ';' |
| セレクター不具合 | 敵名まで設定。#attackはnull。攻撃・リセットが無反応 | リセット登録より前に停止 | TypeError: Cannot read properties of null (reading 'addEventListener') |
| リセット不具合 | 初回は勝利し攻撃無効 | HPと文言は戻るがdisabled=trueのまま。通常クリックで変化なし | なし |

全版をreloadして初期HPを確認。構文／セレクター不具合は同じ例外が再発。リセット不具合はreloadで攻撃可能に戻り、最初の攻撃で20/12。元版・修正版もreload後の最初の攻撃を確認。破損版の例外配列には初期ロードとreloadの各1件があります。JavaScriptの未処理例外はPlaywrightのpageerrorで取得し、console errorイベントとは別記しています。

勝利後はdisabledを保持したまま、ボタン位置を通常のmouse clickで操作してHP不変を確認しました。force click、DOMイベントの強制送出、状態の強制書き換えは使っていません。リセット破損版は2周目を実行できないこと自体を検証しています。

## 表示上の制限と未検証

保存PNGを目視確認しました。デスクトップでは中央のゲーム枠に敵名・HP・操作が表示されています。狭幅でも文字とボタンは読めますが、元HTMLから全版共通の横はみ出しがあります。375pxでscrollWidth=380、320pxで328。CSSのcontent-box幅88%にpaddingとborderが加わることと整合します。元例のCSSは変更していません。無効なfightボタンも背景が緑のままで、見た目だけでは有効状態と区別しづらいです。機能検証PASSはresponsive UI合格を意味しません。

元HTMLにviewport metaはありません。この検証は幅変更であり、mobile device emulationや実機ではありません。200%相当ズーム、Safari、Firefox、実機タッチ、ファイルピッカー、ダウンロード、GameBuildiary iframe内のエラー転送はUNTESTED。file://と外部moduleの比較は未実施です。掲載例が外部moduleを使わないため、別の実験を増やさずMDNの注意事項だけを草稿に明示しました。

初回の検証実行ではHTTPサーバーのfavicon 404がconsole errorに出てテストを停止しました。サーバー側でfaviconに204を返すよう修正し、全ケースを再実行した最終結果がresults.jsonです。Playwright既定のブラウザーは未インストールだったため、既存の/usr/bin/chromiumを使用しました。ブラウザーの保護設定変更はしていません。

## 既存復旧節との差分

既存記事の第6節はHTML先頭末尾／Markdown除去、表示枠エラーと最初のConsoleエラー、動いた版へ戻す、保存、相談4点を説明しています。新稿はこの一般的な復旧案内を繰り返すことを主目的にせず、(1) 静的HTMLが残る解析失敗、(2) nullと処理の実行順、(3) 例外が出ないリセット不具合、(4) 勝利停止を保った2周目の回帰確認を具体的な実証で補います。既存作り方記事へ入口としてリンクし、新記事では診断の例と最小修正を中心にする想定です。

## リポジトリと検証範囲

canonical origin: https://github.com/komekome898-web/GameAI-Hub.git 。fetch成功、origin/main・作業元SHA: 34911361159699c3967eef63530c7fde290876d8。GitHub auth statusとrepository API read成功。global git configがread-onlyだったため、認証設定検査には/tmp内の専用configを使用しました。元の/workspace/GameAI-Hubはworkブランチのままです。

隔離worktree: /workspace/GameAI-Hub-debug、ローカルブランチ: research/buildiary-html-game-debug。起動経路: 親スレッド01a10caf-ddc0-72d1-9556-42849e68d031からのcodex_delegation、指定Environment。Issue指定なし。明示されたno-push/local-onlyが規約のremote checkpointより優先。push／PR／deploy／main変更／課金呼び出し／アカウント作成なし。リモート書き込みの証明は未実施で、ローカル資料としての引き渡しです。

対象は隔離HTMLと調査草稿のみのため、サイト全体のquality/buildは実行対象外。実行済み検査: fixture単一変更・完全修復の検査、実ブラウザー21ケース、保存PNG目視、git diff --check。実装者による確認であり、独立レビューや公開前acceptanceの代わりにはしません。
