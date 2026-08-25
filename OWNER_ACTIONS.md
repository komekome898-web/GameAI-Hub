# Owner Actions

Codexで実行できない契約・本人確認・秘密情報・法的最終判断だけをまとめる。

| Action | Reason | URL | Cost | Required Now | Blocking | Exact Steps |
|---|---|---|---|---|---|---|
| 公開先と独自ドメインを決定 | 検索流入を得る本番originが必要 | 任意の静的ホスト/レジストラ | 無料枠〜（要確認） | Yes | 公開にはBlocking | 1. ホストを選ぶ 2. ドメインを購入/接続 3. `NEXT_PUBLIC_SITE_URL`を設定 4. build/deploy |
| Search Console所有権確認 | Organic Clickを測る | https://search.google.com/search-console/ | 無料 | 公開直後 | No | 1. プロパティ追加 2. DNSまたはHTMLで確認 3. sitemap送信 |
| Analytics接続を承認 | 匿名ファネル実測 | 未選定 | 無料候補あり | 公開直後 | No | 1. 事業者/データ所在地を選定 2. アカウント作成 3. IDをsecretとして登録 4. privacy更新 |
| 公式アフィリエイト制度を再調査・申請 | 初回affiliate click/conversion検証 | `docs/DATA_SOURCES.md`記載の各公式サイト | 通常無料（要規約確認） | Yes | 収益化にはBlocking | 1. 公式partner/referralページ確認 2. 条件を記録 3. 優先P0へ申請 4. 本人確認/口座登録 5. 承認URLのみaffiliateUrlへ追加 |
| 銀行・税務情報登録 | 報酬受取に必要 | 採用ASP管理画面 | unknown | 承認後 | 売上受取にはBlocking | ASPの本人確認手順に従い、リポジトリへ情報を保存しない |
| 公開文書の法的最終確認 | 運営主体・地域・解析構成に合わせる | 専門家または社内担当 | unknown | 公開前推奨 | リスク判断はOwner | privacy/広告開示/商用利用免責を確認し、運営者情報を追加 |
| Git remote設定とpush | 現在remote未設定 | 利用するGitホスト | 無料候補あり | Yes | デプロイ方法次第 | 1. repository作成 2. remote追加 3. 認証設定 4. `git push -u origin work` |

## 調査制約

2026-08-25、Web検索APIは401 Unauthorizedだったためアフィリエイト条件は全件unknown。ネットワーク回復後も公式情報だけで確定する。
