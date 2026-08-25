# Owner Actions

Codexで実行できない契約・本人確認・秘密情報・法的最終判断だけをまとめる。

| Priority | Action | Required owner operation |
|---|---|---|
| P0 | GitHub認証と反映 | GitHub CLIだけが未認証。`gh auth login`で`komekome898-web`へ認証後、Codexに再実行を依頼する（repositoryと既存の`main` / `work`は確認済み）。 |
| P0 | 公開後QA | 稼働中の **https://game-ai-hub.vercel.app** でdesktop/mobile表示、404、外部リンク、および8件すべてのtool detailを実機確認する。Production Branchは`main`、本番originは同URLに設定済み。 |
| P1 | ElevenLabs Affiliate運用確認 | Registryではactive登録済み。管理画面で契約状態・リンクの有効性・支払先情報を定期確認し、秘密情報はrepositoryへ保存しない。 |
| P1 | Meshy Affiliate運用確認 | Registryではactive登録済み。管理画面で契約状態・リンクの有効性・支払先情報を定期確認し、秘密情報はrepositoryへ保存しない。 |
| P1 | Unity Affiliate申請 | 公開URLを用意した後、公式programの最新条件を確認して申請する。承認後のみ`affiliateUrl`を追加する。 |
| P1 | Search Console | 公開URLのpropertyを追加・所有権確認し、`/sitemap.xml`を送信する。 |
| P1 | Analytics運用確認 | GA4（`G-B9Q283QVER`）はproductionでコード接続済み。公開後にRealtimeでpage viewと主要eventを確認し、GAプロパティのデータ保持期間を決定・記録する。Privacy文書と実設定の一致、および対象地域ごとの同意取得要否を継続レビューする。 |
| P2 | その他Affiliate | `docs/DATA_SOURCES.md`の公式制度を再確認し、優先サービスから申請する。 |
| P2 | 振込・税務情報 | 採用した各programの管理画面で登録し、秘密情報をrepositoryへ保存しない。 |

## 調査制約

2026-08-25時点。Affiliateの条件・可用性は申請時に公式情報だけで再確認する。
