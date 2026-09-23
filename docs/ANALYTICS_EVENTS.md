# Analytics Events

個人情報を含めず、`lib/analytics.ts` を唯一の送信境界とする。全環境でsanitized DOM診断イベントを発火する。公開Productionの正規hostで除外されていない場合だけ、before-interactive bootstrapが用意した単一の`gtag`経路へ送信する。

| Event | Trigger | Properties |
|---|---|---|
| tool_view | 詳細表示 | service, page |
| stack_view | Stack詳細表示 | stack, page |
| stack_to_builder | StackからBuilderへ遷移 | stack, page |
| compare_start | 比較リンク選択 | services, page |
| compare_view | 比較表表示 | services, page |
| builder_start | Builderで最初の操作 | page |
| builder_step | 各stepを完了（`step`は1〜4） | step, page |
| builder_complete | 構成生成 | page, game_type, budget |
| outbound_click | 外部CTA | service, page, placement, sub_id |
| affiliate_impression | affiliate CTAの50%以上がviewportに入った初回（同一service_id + page + placementは重複排除） | service_id, page, placement, production_stage, source_context, route_category, affiliate=true, article_slug / task_stage / task_index（安全に確定済みの場合のみ） |
| affiliate_click | affiliateUrl CTA | service_id, page, placement, production_stage, source_context, route_category, affiliate=true, article_slug / task_stage / task_index（安全に確定済みの場合のみ）, sub_id |
| calculator_start / complete | P1計算機 | category（予定） |
| diagnosis_start / complete | P2診断 | rule_version（予定） |

主要ファネルは `landing → builder_start → builder_step → builder_complete → compare → outbound`。Stack経由は`stack_view → stack_to_builder`で確認する。収益ファネルは `affiliate_impression → affiliate_click → tool_return（安全かつ信頼できる場合のみ）→ task_completed → provider conversion / commission` とする。`tool_return` は外部タブからの復帰と制作継続の因果を信頼できる形で判定できないため、現時点では **UNKNOWN / deferred** でありイベントを実装しない。conversion/approved revenueはブラウザで推測せず、provider側の成果を許可されたsub IDと照合する。プログラム別規約を確認するまでURLへsub IDを自動付与しない。

初回のページ閲覧はGA4の既存`gtag('config', ...)`が送信する。アプリ側から独自の`page_view`は重複送信せず、SPA遷移の計測範囲はGAプロパティのEnhanced Measurement設定を運営者がRealtimeで確認する。イベントプロパティは`lib/analytics.ts`のイベント別allowlistを通り、未定義キーは送信前に破棄される。

`affiliate_impression` と `affiliate_click` は `service_id`, `page`, `placement`, `production_stage`, `source_context`, `route_category`, `affiliate` を共通比較軸とする。記事slugやProject task属性は、route/taskから既に安全なカテゴリ値として確定できる場合だけ追加する。URL、query、任意入力、prompt/code/error等は送らない。クリック固有の `sub_id` は既存の安全な生成規則を維持する。

## Transport eligibility and owner/QA exclusion (Issue #132)

Real GA transport uses one fail-closed policy evaluated before hydration: Vercel's
server-only `VERCEL_ENV` must equal `production`, the browser hostname must equal
`game-ai-hub.vercel.app` exactly, and the browser must not be excluded. Missing
or unknown deployment state, localhost/loopback, CI, Preview, branch and lookalike
hosts retain the sanitized `gameai:event` diagnostic only; they neither load the
Google tag nor retain a GA queue.

The privacy page control reloads through the bounded `gameai_analytics=off|on`
entry parameter. The before-interactive bootstrap persists the choice locally,
removes the parameter from the visible URL before GA config, and applies it before
the initial automatic page view. Exclusion is browser-local, not account-wide or
cross-device. Storage failure still honors `off` for the current document. Enabling
measurement starts a new document and never replays excluded events.

The bootstrap uses Google's supported `dataLayer.push(arguments)` command format.
It initializes/configures once per document; application events use that same gtag
function and do not maintain a second replay queue. Automatic GA page-view/history
behavior remains unchanged.

### Reporting configuration checklist (permission-dependent)

Receiver-side configuration was not changed by this repository task. An authorized
GA administrator must verify event-scoped custom dimensions for `service_id`,
`placement`, and `article_slug` (and only add missing definitions), while using
built-in page/hostname dimensions where possible. Verify native Realtime/DebugView
receipt separately from connector/report visibility; a browser attempt or HTTP 204
is not evidence of GA receipt. No filter status is inferred from connector fields.
