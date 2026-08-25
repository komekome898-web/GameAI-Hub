# Deployment

## 推奨: Vercel無料枠

`output: 'export'` のNext.jsアプリであり、VercelはGitHub連携、Preview Deploy、HTTPS、Next.jsのbuild設定を最小構成で提供するため初回公開先に適する。GitHub Pagesも`out/`を配信できるが、Project Pagesではrepository名の`basePath`対応やActions workflowが別途必要になるため、現構成ではVercelを優先する。

### Project settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `out` |
| Production Environment | `NEXT_PUBLIC_SITE_URL=https://<production-host>` |

`NEXT_PUBLIC_SITE_URL` は末尾スラッシュなしのHTTPS originにする。この値からcanonical、sitemap、robotsが生成されるため、Vercel URLや独自ドメインを変更した際は値を更新して再buildする。秘密値ではなく、ブラウザへ公開される設定である。

## 公開手順

1. `npm ci && npm run quality && npm run build` を実行する。
2. `out/` を静的ホスティングへ公開する（NodeサーバーやDBは不要）。
3. `NEXT_PUBLIC_SITE_URL` を本番のHTTPS originに設定して再buildする。
4. sitemap、robots、canonical、404を本番URLで確認する。
5. 独自ドメイン・解析はOWNER_ACTIONSの承認後に接続する。

Affiliate未承認のサービスは`affiliateUrl`を空のままにし、`officialUrl` fallbackを使う。Analyticsはイベントをブラウザ内CustomEventとして発火するだけなので、外部adapterやIDがなくても公開を妨げない。

## Rollback

直前の成功コミットの成果物を再デプロイする。構造データはGit履歴にあるためDB復元は不要。
