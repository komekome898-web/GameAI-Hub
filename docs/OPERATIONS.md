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

External interpretation is disabled unless `PROJECT_INTERPRETER_PROVIDER=cloudflare` and all server-only Cloudflare values are configured. Before enabling it, the owner must configure provider spending/quota limits and a durable Vercel-side rate limit for `POST /api/project/interpret`. The application also applies an anonymous global limit of 10 provider calls per minute per server instance; over-limit requests still receive a deterministic result and never call Cloudflare. This in-memory guard does not read or retain IP addresses, ideas, or user identifiers and is explicitly not a distributed limit across Vercel instances. The handler rejects non-JSON and bodies over 5 KB even without a `Content-Length` header, bounds ideas to 1,200 characters, uses a hard timeout, and falls back to deterministic rules. Never add provider secrets to `NEXT_PUBLIC_*` variables.
