# 七作品の開発端末・実機確認訂正

- 起点：main d83ead397de80cf917faf835a109bae3cd08331d。
- ブランチ：fix/seven-game-iphone-development。
- Saved Environment内の継続委任。本人が最新情報として七作品のスマホ実機動作確認・iPhoneのみでの開発を明示。
- 変更：七作品のカード環境表示・開発項目・実機確認情報、全8記事の「プレイ無料、インストールなし」と料金無料・課金なし、本人訂正の追記記録、関連回帰テスト。
- 保持：元テンプレート、画像の元バイト、作者・URL・ゲーム個別情報、荒野モン動、並行PR175。
- 本人の承認：検証してエラーがなければマージ可。親へ最終コミット・差分を先行報告した後、CI成功を確認してマージ。
- 検証：型・品質・ビルド、七記事とカードのdesktop/375/320/320 CSS zoom 200%、独立レビュー。結果はPRと最終報告に記録。

## ローカル検証結果

- npm run quality：49ファイル・377テスト成功、型・lint・データ・ワークフロー検証成功。用意済みRubyをPATHへ追加して実行。
- production build：Playwright webServerがVERCEL_ENV=production npm run buildを実行して成功。
- 対象E2E：6件成功。七記事1280/375/320、七記事320 CSS zoom 200%、七作品カードと一覧375、Aramon375。
- 原画像7件：保存済みSHA256と一致。
- 独立レビュー：新しい7記事375・代表1280/320/zoom、全7カード2行版、Aramon375を実ピクセルで確認。P0/P1/高影響P2なし。
- 画面証跡：docs/screenshots/game-owner-corrections。viewport確認を実機ゲームプレイ実績とは扱わない。
- PR175は確認時点で未マージ。マージ前に最新mainを再確認し、並行変更を保持する。
