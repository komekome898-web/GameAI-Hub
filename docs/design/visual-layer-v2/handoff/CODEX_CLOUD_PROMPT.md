# Codex Cloud実装依頼 — GameAI-Hub Visual Layer v2

添付の `GameAI-Hub_Visual-Layer-v2_Handoff.zip` を正本として、採用されたMint Atrium / Crafted Ceramicの外観を実装してください。
目的は既存Issue #137 UX Contractを保ったVisual Layer追加です。画面の作り直しや機能削減ではありません。

Repository: https://github.com/komekome898-web/GameAI-Hub
UX基準SHA: fd1d9330fa08739168978cd38beeaf55f5d2e1ae
パッケージ作成時確認main: 711dcb5df28db7df0b916589c264a97249a661e6
必ず最新origin/mainを再取得。上記SHAへ巻き戻さない。

## 開始条件
1. ZIPが実ファイルとして取得できるか確認。SHA256SUMSを検証。取得不能ならその一点を報告し、想像で実装しない。
2. 最新AGENTS.md、CODEX_CLOUD_TASK.md、scoped AGENTS、UI_ACCEPTANCE.md、GAMEAI_UI_UX_REDESIGN.md、環境契約を読む。
3. 最新運用ルールのhard gateを実施。canonical originのfetch/push両URL、fetch、origin/main、認証/remote保存経路を検証。secret非表示。
4. fresh task＋再利用Environment＋既存branch/PR/ledgerのresumeを標準とする。同じタスクの有効なPRがあれば新PRを作らない。
5. ZIP docs/01〜08を読み、現行実装との差分を独立に精査。設計に回帰要因があれば最小修正案をledgerへ記録してから進める。

## 実装内容
docs/07に沿ってV1素材/静的記事→V2 Home/Project→V3 Tools/Compare/記事→V4円環を順に実装。
採用外観はreference/01。その他mockはレイアウト参考。画像のメニュー・略された本文・仮の価格/日付/コードを転記禁止。
design/material-reference.cssは素材設計サンプルで、アプリへそのまま一括importする完成patchではない。既存computed styleとscoped ruleで統合する。
背景/サムネイルはassetsのWebPを使用。全画面を画像化しない。カードframe/影/くぼみはCSSで作る。
article title/meta/orderは現行dataから。start3件だけ円環、SSR全リンク・JSなし一覧・前次44px・keyboard・一覧切替・reduced-motion・320flatを必須とする。
Projectは実current task最優先、既存workspace分岐だけ装飾。架空ゲーム生成/新AI呼出/新iframe/自動実行禁止。
Toolsはtask-firstと順位を、Compareはmobile criterion-firstとdesktop semantic tableを維持。
記事本文・広告開示・公式根拠・SEO・GA4/privacy・affiliate neutrality・intentを保持。
新依存は原則追加しない。Canvas/WebGL/Three.js/GSAP不要。新しい計測eventなし。

## 検証と提出
320/375/390×844、desktop1440×900、200%相当、長文/empty/error、JS無効、motion低減、focus、前後移動を確認。
実際のrender screenshotを独立reviewerに渡し、P0/P1/high-impact P2を修正してsecond pass。
quality/build/関連E2E必須。testsが通っても視覚acceptanceの代用にしない。
PRにはexact head、before/after、viewport、残件、bundle/asset増分、機能回帰結果を残す。
physical-device、Production、GA4実受信は未検証なら分けてUNTESTED。
実装とPR提出まで。明示的な追加指示なしにmerge/Production変更/Issue closeをしない。
