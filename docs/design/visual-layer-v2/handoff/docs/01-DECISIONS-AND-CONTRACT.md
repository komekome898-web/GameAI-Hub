# 01 採用判断と保護契約

## デザインの目的
明るい近未来の制作アトリエ。ミント色の建築的な曲面と自然光、触れたくなる道具の質感。
白い陶器面、控えめなシャンパンシルバーの縁、薄いセージ色の側面、浅い画像のくぼみを採用。
素材の高級感は記事探索のカードに集中。Projectは最も重要な作業空間として、同じ素材を薄く用いる。
ネオン、背景アニメ、粒子、巨大球、全面ガラス、金箔、革、木目、大理石柄は採用しない。

## 正本と基準SHA
ユーザー指定UX基準：`fd1d9330fa08739168978cd38beeaf55f5d2e1ae`。
2026-09-30にGitHubから確認したmain：`711dcb5df28db7df0b916589c264a97249a661e6`（PR #152、Cloud運用ドキュメント更新）。
両refのblob一致を確認：app/globals.css、app/page.tsx、app/articles/page.tsx、ProjectGeneratorClient、ToolsExplorer、CompareClient。
Header、layout、Foundation、Article系shared、BeginnerGameWorkspaceは指定UX基準refで確認した。
この調査はProductionの再受入ではない。実装開始時は最新origin/mainを再取得し、差分を調べる。古いSHAへreset/巻戻し禁止。
参照： https://github.com/komekome898-web/GameAI-Hub/tree/fd1d9330fa08739168978cd38beeaf55f5d2e1ae
最新運用ルールはAGENTS.md / CODEX_CLOUD_TASK.md / scoped AGENTS.mdを再読する。

## 変更しないもの
- Homeのtask-first、初見理解、入力・primary action。Heroの装飾でCTAを押し下げない。
- Projectのcontext→current task→instruction/artifact→done criteria→next/recovery。
- Projectの分岐、ゲーム意図、生成ロジック、実成果物、保存キー、sandbox、エラー捕捉。
- Toolsのartifact/task→constraints→result→evidence、結果の順位・同条件の公平さ。
- Compareのmobile criterion-first、desktop semantic table、最大候補数・URL状態・差分表示。
- 記事タイトル/更新日/出典/価格/権利/本文/見出しID/広告開示/CTA計測/Projectへのsource。
- Headerの現行ロゴ、実メニューラベル・リンク、focus trap/inert/Escape、Footer3群。
- SEO/canonical/JSON-LD/GSC/robots/sitemap/GA4/privacy/affiliateUrl fallback/rel。

## モックを誤読しない
|画像の要素|扱い|
|陶器・金属縁・画像のくぼみ・円環配置|採用。CSSで意味のある表面だけに適用|
|背景の曲面・自然光・控えめな葉|採用。assetsの背景を1枚使用。新しい装飾objectは足さない|
|英語Project/Tools/Compare中心のメニュー、紙アイコンのロゴ|参考画像の誤差。既存Headerを保持|
|記事タイトル/カテゴリ/日付/下段グループ見出しの省略や不整合|転記禁止。data/articlesと現行groupsを使用|
|モックで消えた更新日・詳細説明・trust/footer|消さない。自然高を許容|
|モックのProjectコード・ゲーム表示button・0/3|サンプル。既存の実状態/操作のみを装飾。新コード生成やpreview機能追加をしない|
|モックのカード左から右の順序|並べ替え指示ではない。現行配列の先頭を中央にする|
|片側だけの矢印|画像の省略。実装は前/次を常に提供|
|凹んだ記事を読む領域|1つのリンク内の視覚的フッター。nested buttonを作らない|
|参考画像の植物・イラスト|装飾。verified/生成成功/実成果物の証拠として使わない|

記事一覧に最初に適用する円環はstart群3件。残りの群は一覧のまま素材を統一。
全文読書・Tools結果・Compareセル・Project手順は円環化しない。
