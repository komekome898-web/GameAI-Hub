# Analytics Events

個人情報を含めず、`lib/analytics.ts` を唯一の送信境界とする。現在はDOMイベントと開発console adapterのみ。

| Event | Trigger | Properties |
|---|---|---|
| page_view | 将来のadapterがルート遷移を検知 | page |
| tool_view | 詳細表示 | service, page |
| compare_start | 比較リンク選択 | services, page |
| compare_view | 比較表表示 | services, page |
| outbound_click | 外部CTA | service, page, placement, sub_id |
| affiliate_click | affiliateUrl CTA | service, page, placement, sub_id |
| calculator_start / complete | P1計算機 | category（予定） |
| diagnosis_start / complete | P2診断 | rule_version（予定） |

ファネルは `landing → tool → compare → outbound → affiliate → conversion`。conversion/approved revenueはASP側の成果を、許可されたsub IDと照合する。プログラム別規約を確認するまでURLへsub IDを自動付与しない。
