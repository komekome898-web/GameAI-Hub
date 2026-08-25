# Owner Actions

Codexで実行できない契約・本人確認・秘密情報・法的最終判断だけをまとめる。

| Priority | Action | Required owner operation |
|---|---|---|
| P0 | GitHub認証と反映 | GitHub CLIだけが未認証。`gh auth login`で`komekome898-web`へ認証後、Codexに再実行を依頼する（repositoryと既存の`main` / `work`は確認済み）。 |
| P0 | Vercel接続と初回公開 | iPhoneのVercelで **Add New → Project → Continue with GitHub → GameAI-Hub → Import**。Framework Presetが **Next.js**、Production Branchが **main** であることを確認し、`NEXT_PUBLIC_SITE_URL=https://<割当予定URL>`を追加して **Deploy**。初回割当URLが入力値と異なる場合は値を実URLへ直してRedeployする。 |
| P0 | 公開URL確認 | `/`, `/tools/`, tool detail, `/compare/`, `/methodology/`, `/affiliate-disclosure/`, `/privacy/`, `/sitemap.xml`, `/robots.txt`を実機（特にmobile）で確認し、公開URLを記録する。 |
| P1 | ElevenLabs Affiliate申請 | 公開URLを用意した後、公式programの最新条件を確認して申請する。承認後のみ`affiliateUrl`を追加する。 |
| P1 | Unity Affiliate申請 | 公開URLを用意した後、公式programの最新条件を確認して申請する。承認後のみ`affiliateUrl`を追加する。 |
| P1 | Search Console | 公開URLのpropertyを追加・所有権確認し、`/sitemap.xml`を送信する。 |
| P1 | Analytics | 事業者・データ所在地・同意要件を決定して接続し、Privacy文書を実構成に合わせて更新する。未接続でもサイトは動作する。 |
| P2 | 独自ドメイン | 必要になった時点で取得・Vercelへ接続し、`NEXT_PUBLIC_SITE_URL`更新後に再Deployする。 |
| P2 | その他Affiliate | `docs/DATA_SOURCES.md`の公式制度を再確認し、優先サービスから申請する。 |
| P2 | 振込・税務情報 | 採用した各programの管理画面で登録し、秘密情報をrepositoryへ保存しない。 |

## 調査制約

2026-08-25時点。Affiliateの条件・可用性は申請時に公式情報だけで再確認する。
