# Deployment

## Production

Production DeploymentはVercelで完了している。本番URLは **https://game-ai-hub.vercel.app**、Production Branchは **main** である。このURLを唯一の本番originとして扱う。`output: 'export'` のNext.jsアプリであり、成果物は静的に配信される。

### Project settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `out` |
| Production Branch | `main` |
| Production Environment | `NEXT_PUBLIC_SITE_URL=https://game-ai-hub.vercel.app` |

`NEXT_PUBLIC_SITE_URL` は末尾スラッシュなしのHTTPS originにする。この値からcanonical、sitemap、robotsが生成されるため、Vercel URLや独自ドメインを変更した際は値を更新して再buildする。秘密値ではなく、ブラウザへ公開される設定である。

## 公開手順

1. `npm ci && npm run quality && NEXT_PUBLIC_SITE_URL=https://game-ai-hub.vercel.app npm run build` を実行する。
2. `out/` を静的ホスティングへ公開する（NodeサーバーやDBは不要）。
3. `NEXT_PUBLIC_SITE_URL=https://game-ai-hub.vercel.app` をProduction環境に設定してbuildする。
4. sitemap、robots、canonical、404を本番URLで確認する。
5. 独自ドメイン・解析はOWNER_ACTIONSの承認後に接続する。

Affiliate未承認のサービスは`affiliateUrl`を空のままにし、`officialUrl` fallbackを使う。Analyticsはブラウザ内CustomEventに加え、productionではGA4へ送る。`gtag`初期化前のイベントは`dataLayer`へqueueされる。

## 公開後QA

- `/`, `/builder`, `/stacks`, `/tools`, `/compare`, `/methodology`, `/affiliate-disclosure`, `/privacy`, `/sitemap.xml`, `/robots.txt` が200で表示される。
- 8件すべての `/tools/[slug]` が200で表示され、一次情報、確認日、CTAを確認できる。
- 各HTMLのcanonicalと`og:url`が `https://game-ai-hub.vercel.app` の自己参照URLである。
- `/sitemap.xml` の公開canonical URLがProduction originと末尾スラッシュを使い、noindexの`/compare`を含まず、`/robots.txt`が同じoriginのsitemapを参照する。
- 未承認サービスのCTAは`officialUrl`へ遷移し、架空または未承認のaffiliate URLがない。
- HTTPS、404ページ、外部リンクの遷移、desktop/mobileの主要導線を実機で確認する。

## Rollback

直前の成功コミットの成果物を再デプロイする。構造データはGit履歴にあるためDB復元は不要。
