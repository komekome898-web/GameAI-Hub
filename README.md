# GameAI Hub

日本語のAIゲーム開発ユーザーが、条件と一次情報からツールを比較し、公式サイトへ進むための静的MVP。

```bash
npm install
npm run dev
npm run quality
npm run build
```

Phase 1はJSON + Zodの8サービス、詳細、最大4件比較、中央CTA、匿名イベント抽象化、SEO基盤を含む。調査制約と人間作業は `OWNER_ACTIONS.md` を参照。

## Deploy（Vercel無料枠）

このアプリはNext.jsの静的exportで、DBやNode.jsランタイムを必要としない。Next.jsとの統合、Preview URL、HTTPS、GitHub連携を追加設定なしで利用しやすいため、初回公開先はVercelを推奨する。

1. Vercelで **Add New → Project** を選び、このGitHubリポジトリをImportする。
2. Framework Presetを **Next.js**、Root Directoryをリポジトリルートにする。
3. Production環境変数 `NEXT_PUBLIC_SITE_URL` に、割り当てられた本番URL（例: `https://gameai-hub.vercel.app`、末尾 `/` なし）を設定する。
4. Build Commandは `npm run build`、Install Commandは `npm ci`、Output Directoryは `out` を使用する。
5. Deploy後に本番URLの `/`, `/tools/`, `/compare/`, `/sitemap.xml`, `/robots.txt` を確認する。URLを変更した場合は環境変数を更新して再Deployする。

affiliate URLが未設定のサービスは自動的に公式URLへ遷移する。Analyticsプロバイダーは未接続でも動作し、本番では外部送信もconsole出力も行わない。詳細とロールバックは [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) を参照。
