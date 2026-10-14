# 掲載候補の組込後検証

2026年10月14日。最新main `53f731dee374e0a37a2f644d017064004bd8c895`、既存PRの素材head `555e71aaa8942cbbd57b8e38b8ce9d9d19b4dd9a` をfetchして差分を保持した上で実装しました。

## 技術検査

- lint：成功。新規ゲームデータ・テストに対する最終eslintも成功。
- typecheck：成功。追加テスト修正後の再実行も成功。
- Vitest：50ファイル・386テスト成功。
- データ・記事・ゲーム・sitemap・affiliate検証：成功。ゲームは10件。
- orchestration単体テスト：76件成功。
- quality全体：exit 1。最後の`validate:workflows`で `FileNotFoundError: [Errno 2] No such file or directory: 'ruby'`。環境のRuby不足は未解決で、quality全体の成功とは扱いません。
- production build：PlaywrightのwebServer起動時に `VERCEL_ENV=production npm run build` を実行し成功。新規2ルートをproduction serverでHTTP 200確認。
- diff whitespace：成功。

## 実ブラウザ

ローカルproduction serverとChromiumを使用。外部リクエスト・analyticsは遮断し、本番にはアクセスしていません。

初回の関連E2Eは19/20成功。新規テスト1件が320pxでも円環コントロールを期待し、既存の340px以下一覧表示仕様でタイムアウトしました。アプリは変更せずテストを実仕様へ修正し、新規2件の4テストを再実行して4/4成功。既存ゲーム導線・B3 Homeの16テストは初回実行で成功しています。

作品数の固定値を更新した残りの関連E2Eも7/7成功：旧7作品の画像・カード・sitemap、swipeとfocus、Homeへの戻り文脈（320/375/390/1440）、JS無効の共通shell。

確認項目：新規2紹介、画像の実寸・表示、canonical、OG、VideoGame構造化データ、sitemap、10作品一覧、紹介リンクと外部プレイリンクの分離、次／前／キーボード操作、一覧切替、紹介ページから戻ったカードへのfocus。B3 Homeではタッチ相当・連続入力・reduced motion・JS無効の既存検査を保持しています。

## 画面証拠と限界

`docs/screenshots/swarm-monhero/` に1280/375/320の2紹介、円環カード・一覧、B3 Homeの2作品、320の200% CSS zoomを保存。実装側でdesktop・320の本文、375のカードとHome、200%のfirst viewを現物確認しました。画像はcontain表示で、モンヒロPLAYER IDマスクは表示後も読めません。横スクロール検査も成功しています。

独立レビューは未完了です。これらはChromiumのviewport・CSS zoom検査であり、iPhone/Android実機の操作・ゲーム全編の検査ではありません。作者の実機確認と編集側の公開ゲーム初期画面確認の範囲は本文に区別して記載しています。

本番公開・マージ・デプロイ操作は未実施。PRはdraftのまま独立レビューと明示的なマージ判断を待ちます。

## 独立レビュー後の表示修正

長い画像クレジットでSWARMのカード下枠が切れていたため、Homeのカルーセル領域に全カードの実寸を反映した最小高さを確保しました。画像・クレジット・FULL FRAME表示・厚みのある外枠は保持しています。実寸はResizeObserverで更新し、作品切替による高さの変動はありません。移動・swipe・focus等の処理は変更していません。

モンヒロの紹介見出しは、タイトル文字列を保持したまま語単位で折り返す任意のtitlePartsを使用しました。既存作品は従来の描画のままです。320/375pxで「ヒーロー」が分断せず横にはみ出さないことを画面とブラウザで確認しました。

修正後：lint・型検査・関連Vitest 3ファイル20件・production build成功。関連E2E23/23成功（新規2件、カード外枠の9px層・切替時の高さ固定、B3 Home、既存ゲーム導線）。Homeの1280/375/320、新規紹介の各viewport、モンヒロのfirst viewを更新しました。SWARM375・モンヒロ320/375の修正後画面を実装側でも現物確認しました。

前headのquality CI成功は独立レビューで確認済みという報告を受領しています。今回の修正headへの独立レビュー・CI結果は別途必要です。ローカルRuby不足は解消していないため、以前のquality全体失敗を成功へ置き換えていません。
