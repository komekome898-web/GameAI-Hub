# Monetization Map

`data/affiliate-programs.json` をaffiliate status・URLのsource of truthとする。commission、cookie期間、対象国、支払条件などregistryにない情報は `unknown` のままとし、サービス評価・表示順・推薦文には使用しない。

| Service | User Intent | Registry status | Commission | CTA | Verification |
|---|---|---|---|---|---|
| GitHub Copilot | IDEでゲームコードを実装 | unknown | unknown | 公式URL | 提携未確認 |
| Cursor | AI中心のコード編集 | inactive | unknown | 公式URL | registry上inactive |
| Scenario | ゲーム向け2Dアセット制作 | pending | unknown | 公式URL | 申請結果未確定 |
| ElevenLabs | キャラクター音声を生成・実装 | active | unknown | `https://try.elevenlabs.io/jlxoxtxe9768` | PartnerStack、2026-08-25承認記録 |
| Suno | ゲームBGMを試作 | unknown | unknown | 公式URL | 提携未確認 |
| Meshy | 3Dアセットを生成 | active | unknown | `https://www.meshy.ai?via=gameaihub` | Meshy Direct、2026-08-25承認記録 |
| Inworld AI | AI NPCを実装 | unknown | unknown | 公式URL | 提携未確認 |
| Rosebud AI | プロンプトからゲームを試作 | inactive | unknown | 公式URL | registry上inactive |

その他のサービスおよび詳細フィールドはregistryと `docs/DATA_SOURCES.md` を参照し、未確認値を補完・推測しない。

## Revenue Funnel

Canonical funnel:

`affiliate_impression → affiliate_click → tool_return（安全かつ信頼できる場合のみ）→ task_completed → provider conversion / commission`

- `affiliate_impression`: CTAの50%以上がviewportに入った初回。同じpage viewの `service_id + page + placement` は重複排除する。
- `affiliate_click`: impressionと同じ安全なcategorical dimensionsを持つ。`outbound_click` の直後に送る既存順序を維持する。
- `tool_return`: 外部タブの利用完了や復帰理由を確実に判定できないため、現在は **UNKNOWN / deferred**。visibility/focusだけから成約や利用を推測しない。
- `task_completed`: first-party上で実際に完了操作が成立したときの既存event。
- provider conversion / commission: ElevenLabs / Meshy reportがsource。browser側に `affiliate_conversion` や `affiliate_revenue` を作らない。

## Provider reconciliation contract

Providerごと・reporting periodごとに、次の列を運営者が外部reportから集計する。private dashboardのscrapingやcredential保存は行わない。

| Field | Source / rule |
|---|---|
| reporting_period | provider reportの期間とtimezoneを併記 |
| service | bounded service ID (`elevenlabs` / `meshy`) |
| affiliate_clicks | first-party analytics。同期間・serviceで集計 |
| provider_conversions | provider reportが公開する場合のみ。なければUNKNOWN |
| approved_conversions | provider reportが区別する場合のみ。なければUNKNOWN |
| commission_amount | provider reportの確定/承認済み定義を明記。なければUNKNOWN |
| currency | provider report記載値。推測・換算しない |
| source_or_sub_id | providerが返す場合のみ照合。粒度や欠損を記録 |
| limitations | attribution window、取消、report遅延、集計粒度など確認できた制約 |

`revenue_per_1000_sessions` 等は、同じ期間・定義のsession denominatorとprovider revenue/currencyが揃う場合のみ算出する。providerがsource/sub-IDを返さない場合、service/期間より細かいplacementやarticleへのconversion帰属は主張しない。クリック数とprovider成果が完全一致するという前提も置かない。
