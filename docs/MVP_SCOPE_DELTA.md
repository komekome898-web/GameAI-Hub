# PROJECT_PLAN 収益化優先差分

初期計画の品質原則（一次情報、報酬と推薦の分離、説明可能性）は維持し、公開順だけを変更する。

| 項目 | 旧計画 | Phase 1 判断 |
|---|---|---|
| 掲載数 | 20〜30 | 制作工程をカバーする8件 |
| データ基盤 | PostgreSQL/Drizzle | Git管理JSON + Zod。UIはアクセス関数のみ参照 |
| 公開時期 | 診断・計算後 | 詳細・比較・計測・SEO完了時点 |
| 診断 | MVP必須 | P2へ延期 |
| 計算機 | MVP必須 | P1へ延期（誤った価格統一を避ける） |
| 計測 | 後半 | 初日からイベント抽象化 |
| コンテンツ | 3〜5本 | 実測前は量産せず、P0ページを先にindex |

## Architecture Decision

Next.js App Router + TypeScript strict + 静的出力を採用する。8件ではDB運用コストが価値を上回るためJSONを選択し、`lib/services.ts` をデータアクセス境界にする。履歴・複数編集者・ASP同期が必要になった時点でPostgreSQLへ移行する。
