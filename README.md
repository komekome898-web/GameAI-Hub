# GameAI Hub

GameAI Hubは、日本語のAIゲーム開発ユーザーが「どのAIを使うか」を調べるだけで終わらず、作りたいゲームから次の具体的な制作作業へ進めるためのAIゲーム開発メディア + 実行プロダクトです。

現在のプロジェクト方針は、検索流入・コンテンツ・Project Generator・制作継続・自然な収益化を1つの成長ループとして設計することです。

- **成長戦略 / SEO / コンテンツ / 収益化 / Chat・Work・Codexの役割分担:** [`docs/GROWTH_STRATEGY.md`](docs/GROWTH_STRATEGY.md)
- **Codexの恒久実行ルール:** [`AGENTS.md`](AGENTS.md)
- **運用上の人間作業:** [`OWNER_ACTIONS.md`](OWNER_ACTIONS.md)
- **デプロイ / ロールバック:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

次の大型プロジェクトは **GameAI Hub Content & SEO Engine — Phase 1** です。記事数の量産を先に行わず、SEO監査・キーワードマップ・コンテンツ設計・内部リンク・構造化データ・計測・最初の柱記事群を先に整備します。

```bash
npm install
npm run dev
npm run quality
npm run build
```

## Product direction

中心導線は次です。

> Search / discovery → useful content → Project Generator → guided game-building → production-tool usage → continued progress → sustainable revenue

Trafficだけを成功指標にせず、検索から来たユーザーがProject Generatorを開始し、最初の制作作業を完了し、その後もゲーム完成へ進めることを重視します。

Tools / Compare / Stacks / Guidesは、制作判断を支える根拠面として維持します。初心者の中心体験はProject Generator / Beginner Build Navigatorです。

Affiliateは実際に制作上必要になる文脈でのみ提示し、報酬額を推薦順位・スコア・編集判断へ混入させません。

## Production（Vercel）

Productionは **https://game-ai-hub.vercel.app** で稼働しており、`main`がProduction Branchである。このURLを唯一の本番originとしてcanonical、`og:url`、sitemap、robotsに使用する。Project InterpreterはVercelのNext.jsサーバーランタイムを使い、外部AIが未設定でもローカル判定へフォールバックする。

1. Vercelで **Add New → Project** を選び、このGitHubリポジトリをImportする。
2. Framework Presetを **Next.js**、Root Directoryをリポジトリルートにする。
3. Production環境変数 `NEXT_PUBLIC_SITE_URL` に `https://game-ai-hub.vercel.app`（末尾 `/` なし）を設定する。
4. Build Commandは `npm run build`、Install Commandは `npm ci` とし、Output DirectoryはVercelのNext.js既定値を使用する。
5. Deploy後に本番URLの `/`, `/tools`, `/compare`, `/methodology`, `/affiliate-disclosure`, `/privacy`, `/sitemap.xml`, `/robots.txt` を確認する。

affiliate URLが未設定のサービスは自動的に公式URLへ遷移する。Analyticsプロバイダーは未接続でも動作し、本番では外部送信もconsole出力も行わない。
