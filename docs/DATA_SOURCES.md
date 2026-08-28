# Data Sources / Monetization Research

調査日: 2026-08-25 UTC。製品情報は各詳細ページの公式リンクを起点に確認した。アフィリエイト検索はネットワーク認証エラーにより完了できず、推測を避けた。

| name | category | official_url | affiliate_program_url | affiliate_available | commission | recurring_commission | cookie_duration | eligible_products | target_country | application_required | website_required | payout_conditions | terms_url | last_verified | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GitHub Copilot | AI coding | https://github.com/features/copilot | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features | 2026-08-25 | Official product/plans/terms pages |
| Cursor | AI coding | https://www.cursor.com/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://www.cursor.com/terms-of-service | 2026-08-25 | Official product/pricing/terms pages |
| Scenario | AI image | https://www.scenario.com/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://www.scenario.com/terms | 2026-08-25 | Official product/pricing/terms pages |
| ElevenLabs | AI voice | https://elevenlabs.io/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://elevenlabs.io/terms-of-use | 2026-08-25 | Official product/pricing/terms pages |
| Suno | AI music | https://suno.com/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://suno.com/terms | 2026-08-25 | Official product/pricing/terms pages |
| Meshy | AI 3D | https://www.meshy.ai/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://www.meshy.ai/terms | 2026-08-25 | Official product/pricing/terms pages |
| Inworld AI | AI NPC | https://inworld.ai/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://inworld.ai/terms | 2026-08-25 | Official product/docs/terms pages |
| Rosebud AI | AI game generation | https://rosebud.ai/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://rosebud.ai/terms | 2026-08-25 | Official product/terms pages; partial verification |
| DeepL API | AI localization | https://developers.deepl.com/docs | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://www.deepl.com/en/pro-license | 2026-08-26 | Official API docs/plans/license pages |
| modl.ai | AI game testing | https://modl.ai/ | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | https://modl.ai/terms-of-service/ | 2026-08-26 | Official product/terms pages; pricing, API and engine support remain unknown |

## Capability coverage workflow

`capabilities` は自由記述カテゴリではなく `lib/schema.ts` の列挙値を使う。各能力には、掲載済みの `sources` と同じ公式URL、確認状態、限定的な説明を必須とする。

1. Project Planで不足している工程を先に特定し、掲載数を増やす目的だけで候補を追加しない。
2. 公式製品ページまたは公式ドキュメントで工程との適合を確認する。第三者レビューだけを能力根拠にしない。
3. 料金、無料枠、API、対応エンジン、商用条件を個別に確認し、確認できない値は `unknown` または空配列のまま残す。
4. `capabilities[].sourceUrl` を `sources[].url` にも登録する。`npm run validate:data` は未掲載ソース、能力の重複、基本的な出典不足を拒否する。
5. 推薦ルールへの追加は別判断とする。サービス掲載やアフィリエイト状態だけでは推薦対象にしない。

## Research backlog

1. 各社公式サイトで affiliate / partner / referral の規約ページを再探索する。
2. 公式プログラムが見つかった場合だけ料率・Cookie・対象国・sub ID可否を登録する。
3. 価格や商用条件は短い要約に留め、法的判断は公式規約を優先する。

## Issue #18: catalog and project-fit method (2026-08-28)

The catalog uses the closed `serviceCategoryIds` taxonomy in `lib/schema.ts`; validation fails when any production category has no candidate. New general-model and specialist entries were checked from the official product and terms URLs recorded on each entry. A homepage confirms only the narrowly worded capability attached to that URL. It does not prove game-output quality, engine compatibility, commercial permission, or pricing. Those facts remain `unknown` unless their own official evidence is recorded.

Project fit is deterministic and uses 5-point increments: a verified stage capability contributes 40; an explicit input rule contributes 25; a recorded selected-engine relationship, free-plan match, verified API requirement, or recorded commercial-use match contributes at most 10 each; a beginner/no-code match contributes 5. Scores are capped at 100 and sorted by score, rule priority, then slug. `75–100` is `strong`, `50–70` is `good`, and lower values are review-only. A required production stage contributes 10 because that stage is derived from the project input. A primary also requires a stage-relevant `verified` capability with a listed official feature or documentation source; explicit rules are bonuses, not eligibility gates. Free-only projects without a confirmed free plan, API-required projects without confirmed API access, and commercial projects with `no` or `unknown` commercial state are separated as manual-review candidates. Conditional commercial use always produces a warning and terms check.

The score means project-condition fit against recorded fields, not output quality, popularity, a review rating, legal clearance, or a universal ranking. Platform strings describe how a service is accessed and are never scored as game export support. Affiliate URL and availability are not read by the scoring function and cannot add points, change selection, ordering, or explanation copy.
