# SWARM FRONT.・モンスターヒーロー — 掲載前下書き

親スレッド `01a10caf-ddc0-72d1-9556-42849e68d031` から委任された2件。既存の `GameRecord` と `/games/[slug]` テンプレートに合わせて原稿を整理しました。`edited-records.json` は加工用下書きで、画像寸法・モンヒロaltは未確認を表す `null` です。そのまま型付き公開データに挿入するファイルではありません。

## 完了した範囲

- 最新mainは `53f731dee374e0a37a2f644d017064004bd8c895`。canonical originのfetch、認証、独立ブランチ `feat/game-intros-swarm-monhero` のremote pushを確認。
- root/scoped AGENTS、Cloud bootstrap、owner-directed operations、UI acceptance、既存7紹介のデータ・ページ・原稿・画像台帳・validator・関連テストを確認。
- 作業ツリーに既存変更なし。並行open PRは #113 `feat/issue-58-chatgpt-cat-tap`（別の制作記事）。
- 原稿を既存紹介項目に整理。確認環境は作者の動作確認と編集側の未確認を区別。iPhone開発という旧7作者向け情報は転用していません。
- SWARMの「横面面」を「横画面」に整理。無料の時点、ソロ登録不要・端末ブラウザ保存、協力の登録条件と追加クレジット未確認を維持。
- モンヒロの無料・課金なし、ゲーム内通貨のみ、端末ごとの記録、登録不要・ランキング用の名前だけという案内を維持。

## 取得・確認のブロッカー

正規Libraryの取得準備は2件とも成功しました。現在のLibraryスキルから取得した正式転送helperを各画像に1回実行したところ、両方 `library file transfer failed: download failed`（exit 1）でした。原本・現物・ハッシュ・寸法は未取得です。画像変換・生成・代用品・公開転送・迂回取得は行っていません。`image-sources.json` にLibrary識別子と作者の条件を保持しています。返された一時URLは保存していません。

公開ゲーム2URLへのHEAD確認も、この実行環境のCONNECT段階でHTTP 403（envoy）となりました。ゲームサーバーの応答・障害とは判定できません。親側からURL到達とモンヒロの初期画面確認を受領し、本文へ反映しました。範囲とモンヒロ画像のPLAYER IDマスク許可は `parent-verification.md` に記録しています。作者提供の実機確認は編集側による確認ではありません。

## 未完了・再開手順

1. 親側で正規取得の問題解消、または正規取得済み原本の承認された作業環境への受け渡しを確認する。制限に遭った取得の無条件再試行は禁止。未加工のモンヒロ原本はPLAYER IDを含むため公開リポジトリに追加しない。
2. 原本保全・SHA-256記録・現物確認の後、モンヒロ派生画像のPLAYER IDだけ不透明にマスクする（本人許可済み）。通常の圧縮／リサイズ後も読めないことを確認。モンヒロの画像altを現物に合わせて記入。
3. 親の独立URL確認は受領済み。画像の現物確認後に`imageChecked`を正直に更新する。親レビュー前に`approved`をtrueにしない。
4. 2件を同一atomic changeで公開データへ統合。既存動的紹介ルート・カード・OG・sitemapを利用し、B3 UI・カード操作を維持する。現時点ではruntimeのデータ・UI・公開一覧を変更していません。
5. 新規2件の事実／掲載条件を検証し、旧7件だけに適用するテストのscopeを維持する。`games`全件に旧7作者のiPhone開発や無料・課金なしを強制する既存テストは新規作者に適用しない。
6. quality/build/関連E2E、desktop・375・320・320の200%相当の画面検査、カードの紹介／遊ぶリンク・前後操作・一覧切替・戻る操作を確認。親がheadを独立レビューする。マージ・公開は別の明示承認まで実施しない。

本番アクセスは未実施。必要になった場合、最初のnavigationは `/privacy/?gameai_analytics=off` とし、除外確認後に進めます。

## この下書きブランチでの検証

`npm run build`は成功。`npm run quality`ではlint・typecheck・Vitest 49ファイル/384テスト・データ／記事／ゲーム／sitemap検証・orchestration 76テストが成功しました。最後の`validate:workflows`は実行環境に`ruby`がなく `FileNotFoundError` で停止（quality全体exit 1）。アプリケーション変更はありません。新規2件の公開ルート・画像・一覧・画面検査は画像取得未完了のためBLOCKEDで、成功とは扱いません。
