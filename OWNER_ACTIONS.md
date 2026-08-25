# Owner Actions

Codexで実行できない契約・本人確認・秘密情報・法的最終判断だけをまとめる。

| Priority | Action | Required owner operation |
|---|---|---|
| P0 | GitHub接続 | `gh auth login`を実行し、このcloneに正しい`origin`を設定する（現在は認証・remoteとも未設定）。その後`work`をpushし、`main`向けPRをreview/mergeする。 |
| P0 | Vercel接続と初回公開 | VercelへGitHubでログインし、このrepositoryをImportする。Productionの`NEXT_PUBLIC_SITE_URL`を割当URLに設定し、`npm ci` / `npm run build` / `out`でDeployする。 |
| P0 | 公開URL確認 | `/`, `/tools/`, `/compare/`, `/sitemap.xml`, `/robots.txt`を実機（特にmobile）で確認し、公開URLを記録する。 |
| P1 | ElevenLabs Affiliate申請 | 公開URLを用意した後、公式programの最新条件を確認して申請する。承認後のみ`affiliateUrl`を追加する。 |
| P1 | Unity Affiliate申請 | 公開URLを用意した後、公式programの最新条件を確認して申請する。承認後のみ`affiliateUrl`を追加する。 |
| P1 | Search Console | 公開URLのpropertyを追加・所有権確認し、`/sitemap.xml`を送信する。 |
| P1 | Analytics | 事業者・データ所在地・同意要件を決定して接続し、Privacy文書を実構成に合わせて更新する。未接続でもサイトは動作する。 |
| P2 | 独自ドメイン | 必要になった時点で取得・Vercelへ接続し、`NEXT_PUBLIC_SITE_URL`更新後に再Deployする。 |
| P2 | その他Affiliate | `docs/DATA_SOURCES.md`の公式制度を再確認し、優先サービスから申請する。 |
| P2 | 振込・税務情報 | 採用した各programの管理画面で登録し、秘密情報をrepositoryへ保存しない。 |

## 調査制約

2026-08-25時点。Affiliateの条件・可用性は申請時に公式情報だけで再確認する。
