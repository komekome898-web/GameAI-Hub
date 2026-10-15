# GameAI-Hub Visual Layer v2 — 実装ハンドオフ v1.0

採用：Mint Atrium / Crafted Ceramic Cards。作成日：2026-09-30（日本時間）。
このZIPは設計書・素材・CSS設計サンプルです。アプリ実装・PR・本番反映は含みません。

## 最初に読む順番
1. `docs/01-DECISIONS-AND-CONTRACT.md` — 採用範囲・変更禁止・画像の誤読防止
2. `docs/02-VISUAL-SYSTEM.md` — 素材、寸法、色、光、レスポンシブ
3. `docs/03-SCREEN-SPEC.md` — 全ルート種別の移行設計
4. `docs/04-COMPONENT-MIGRATION.md` — 現行ファイル/クラスとの対応
5. `docs/05-CREATION-DECK.md` — 円環カードの操作・DOM・縮退
6. `docs/06-ASSET-INTEGRATION.md` — 配置先、読み込み、画像対応
7. `docs/07-PHASES-AND-ROLLBACK.md` — V1〜V4の小さいslice
8. `docs/08-ACCEPTANCE.md` — 機能、視覚、アクセシビリティ、負荷
9. `CODEX_CLOUD_PROMPT.md` — Codex Cloudへ渡す実装依頼

## 重要な正本
- UX：Issue #137 / `docs/design/GAMEAI_UI_UX_REDESIGN.md` と実装開始時の現行コード。
- 本ZIPの採用判断：`docs/01`、数値と操作仕様：`docs/02`〜`08`。
- カード素材と背景の見た目：`reference/01-approved-card-material-desktop-mobile.png`。
- その他referenceはレイアウト参考。タイトル/ロゴ/メニュー/状態/価格の正本ではない。
- 過去チャットの別案や古い設計MDは同梱しない。矛盾した仕様の同時実装を防ぐ。

## Codexへの受け渡し
ZIPをタスクがアクセスできる場所へ添付/配置し、`CODEX_CLOUD_PROMPT.md`を渡す。
ChatGPTのsandboxリンクがCodex Cloudから読めるとは仮定しない。開始時にZIPの実ファイルとSHA256SUMSの検証を必須とする。
ファイルを取得できない場合、記憶や画像の想像で実装を開始しない。
このターンではGitHubへのアップロード・コメント投稿・タスク起動をしていない。

## 内容
- `assets/`：背景・記事サムネイルのPNG原本と軽量WebP、SVG補助アイコン。
- `design/`：トークンJSON、CSS素材見本（未統合）、ローカルで開ける素材見本HTML。
- `reference/`：採用画像と各画面参考画像。Web配信禁止。
- `qa/`：証拠テンプレート、独立設計レビュー、パッケージ検証結果。
- `ASSET_MANIFEST.json`：寸法、容量、用途とhash。
- `SHA256SUMS`：同梱ファイルの完全性確認用。

本パッケージは実装後の受入PASSを意味しない。320/375/390、実機、スワイプ、メニュー、GA4は実装タスクで検証する。
