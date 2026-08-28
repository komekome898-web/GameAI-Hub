# Operations

## Release checklist

- `npm run quality` と `npm run build`
- `npm run check:links`（ネットワーク利用可能時）
- 新規/変更サービスの一次情報、確認日、unknownをレビュー
- CTA文言と無料枠が一致することを確認
- 360px幅で home → tool → compare → outbound を確認
- affiliateUrl追加時は開示、rel、公式プログラム、sub ID規約を確認

## Cadence

- 週次: リンク、unknown、イベントファネルを確認
- 30日: 料金・無料枠・商用条件を再確認
- 60日: API、エンジン、プラットフォームを再確認
- 変更検出だけで規約解釈を自動公開しない

## First experiment

比較ページへの到達があるのに外部CTRが低い場合、CTA直前の「向く条件/注意点」の理解度を改善する。サンプル不足では勝敗を断定しない。

## Project Interpreter provider guardrails

External interpretation is disabled unless `PROJECT_INTERPRETER_PROVIDER=cloudflare` and all server-only Cloudflare values are configured. Before enabling it, the owner must configure provider spending/quota limits and a Vercel-side rate limit for `POST /api/project/interpret`; the repository does not pretend an in-memory limiter is durable across serverless instances. The handler rejects non-JSON, declared bodies over 5 KB, and ideas over 1,200 characters, uses a hard timeout, and falls back to deterministic rules. Never add provider secrets to `NEXT_PUBLIC_*` variables.
