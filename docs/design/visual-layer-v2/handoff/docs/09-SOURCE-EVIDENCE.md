# 09 設計の調査範囲

ユーザー指定基準：fd1d9330fa08739168978cd38beeaf55f5d2e1ae。
取得先：https://github.com/komekome898-web/GameAI-Hub
2026-09-30取得main：711dcb5df28db7df0b916589c264a97249a661e6。

## GitHub sourceを読んだ対象
AGENTS.md、UI_ACCEPTANCE.md、GAMEAI_UI_UX_REDESIGN.md、globals.css、Header、layout内Footer、Home、ProjectGeneratorClient、BeginnerGameWorkspace、ToolsExplorer、CompareClient、Articles hub、ArticleFrame/Header/ReadingGuide/ProjectCta/AffiliateCtas、Foundation、package.json、CODEX_CLOUD_TASK。
Header/shared等は基準ref。main再確認した6主要UIファイルはdocs/01の通りblob一致。
現在mainでの運用ドキュメント更新を確認したため、Cloud用promptは最新運用正本への参照を採用し古い手順を複製しない。

## 今回の検証範囲
設計文書・実ファイル対応・画像素材の独立化・WebP書出し・SVG構造・相対参照・token配色contrast・ZIP完全性。
静的HTML素材見本のbrowser描画は実行環境のChromium実体不足で未検証。HTMLは補助見本で採用画像と仕様が正本。
Productionの新たな受入、アプリ実装、npm quality/build、モバイル/実機の動作検証は行っていない。
