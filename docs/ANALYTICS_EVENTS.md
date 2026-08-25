# Analytics Events

個人情報を含めず、`lib/analytics.ts` を唯一の送信境界とする。全環境でDOMイベントを発火し、開発環境ではconsole、productionでは既存`gtag`または初期化前の`dataLayer` queueへ送信する。

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
| affiliate_click | affiliateUrl CTA | service, page, placement, sub_id |
| calculator_start / complete | P1計算機 | category（予定） |
| diagnosis_start / complete | P2診断 | rule_version（予定） |

主要ファネルは `landing → builder_start → builder_step → builder_complete → compare → outbound`。Stack経由は`stack_view → stack_to_builder`で確認する。conversion/approved revenueはASP側の成果を、許可されたsub IDと照合する。プログラム別規約を確認するまでURLへsub IDを自動付与しない。

初回のページ閲覧はGA4の既存`gtag('config', ...)`が送信する。アプリ側から独自の`page_view`は重複送信せず、SPA遷移の計測範囲はGAプロパティのEnhanced Measurement設定を運営者がRealtimeで確認する。イベントプロパティは`lib/analytics.ts`のイベント別allowlistを通り、未定義キーは送信前に破棄される。
