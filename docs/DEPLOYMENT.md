# Deployment

## 無料での静的公開

1. `npm ci && npm run quality && npm run build` を実行する。
2. `out/` を静的ホスティングへ公開する（NodeサーバーやDBは不要）。
3. `NEXT_PUBLIC_SITE_URL` を本番のHTTPS originに設定して再buildする。
4. sitemap、robots、canonical、404を本番URLで確認する。
5. 独自ドメイン・解析はOWNER_ACTIONSの承認後に接続する。

## Rollback

直前の成功コミットの成果物を再デプロイする。構造データはGit履歴にあるためDB復元は不要。
