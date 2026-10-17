# ビルダイアリー成長分析ツール

Codexが[専用Skill](../../.agents/skills/buildiary-growth/SKILL.md)から使う、追加認証・モデルAPI不要のオフライン診断です。Python標準ライブラリで原値を検査・再集計し、出典、期間、欠測、page/queryの取得範囲を保持したJSONを生成します。戦略の意味的な採否は、実際の本文・検索結果・原資料を使ったレビューで決めます。

## すぐ動かす（合成データ）

```bash
python scripts/growth/analyze.py scripts/growth/example.synthetic.json --brief scripts/growth/brief.synthetic.json
python -m unittest discover -s tests/growth -v
```

このfixtureは架空の教材であり、サイトの性能・流入を表しません。テストは欠測/0、重み付き順位、異なる期間/出典/集計単位、page×queryの誤結合、原表合計の不一致、履歴PVの誤読、CLI再現性、私的出力の分離を確認します。

## 実データを使う

このrepoはpublicです。**GA/GSCの原値・私的会話・診断・戦略の私的根拠はrepo外**に置きます。CLIは非合成入力について、入力・brief・出力のrepo内配置を拒否し、出力先の明示を要求します。合成を装って実データへ`synthetic: true`を付けないでください。CIでは合成fixtureだけを使います。

```bash
python scripts/growth/analyze.py /owner-only/observations.json \
  --brief /owner-only/brief.json --output /owner-only/diagnostics.json
```

実データの取得自体は、既存の正規アクセスがあるread-only手段で行います。このツールは認証・外部送信・設定変更・投稿・公開をしません。新しい観測を追加する際は、古い観測を上書きせず出典/取得時点を分けます。

入力契約（実例は合成fixture）：

- `version: 1`、`site`、`sources`、`periods`、`observations`。
- sourceごとに`locator`、`retrieved_at`、`method`、`coverage`。UI転記と原exportを区別する。
- periodごとに`start`/`end`、`timezone`。未検証ならその状態を文字で残す。
- observationごとに一意`id`、`source`、`period`、`scope`、`dimensions`、`metrics`、`quality`。
- `sc_page`はpage、`sc_query`はquery、`sc_page_query`は**実際に同時取得したpageとquery両方**。別集計を組み合わせて作らない。
- `sc_page_total`/`sc_query_total`は独立した取得総計。`sc_property_total`はサイト単位でありページ合計と照合しない。`clicks`/`impressions`/`position`を明示し、不明は`null`。CTRは原値から計算する。
- GA scopeは`ga_site`/`ga_article_total`/`ga_hub`/`ga_home`/`ga_page`/`ga_event`/`ga_source_report`。usersは非加算。source表の列名未確認なら`sessions`と命名せず`reported_count`で保持する。
- qualityに`history_changes`、`unreconciled_testing`を指定すると注意対象になる。観測0は0、未取得はnull、未掲載行は行なしのまま保持する。

追加の`opportunities`は原資料を使った診断の入力です。各候補に`id`、`target_url`、`reader_question`、`current_location`、`finding`、`proposed_change`、`evidence`、`coverage`（blocked/missing/mismatch/complete/unknown）、`finding_status`（verified/hypothesis）、`change_size`（section/article/redesign）を残します。verifiedは作業者の主張なので、独立レビューで該当箇所と照合します。

コードは、観測がつながるアクセス障害→未完タスク→意図不一致の順で、同じ区分なら実観測page×query→page、その次に小さい変更を先にします。これは公開された編集方針であり、効果の点数化ではありません。既に満たす要素はretain、未検証やAPI失敗/遅延/null/0表示しかない候補はinvestigateへ戻します。同じ流入合計でも原資料の診断が変われば推薦actionが変わること、既存実装の反例を与えると追加推薦を消すことをテストしています。新規獲得は既存の検索母数に閉じません。`acquisition_evidence`にreader_demand/owned_asset/incremental_value/distribution_routeの4項目を設け、それぞれの出典IDを付けます。さらに`delta_status`（verified/duplicates_existing/unverified）と`delta_description`で既存本文・既存配布先と新素材の実差分を明示します。自サイトに未掲載でも、既存の本人noteに同じ答えがあれば新規価値の証拠にはしません。全項目が揃い、実差分と未解決価値がverifiedの候補を`acquisition_experiments`へ出し、一つなら`primary_experiment`として分離します。複数なら自動で勝手に一つへ決めず、原資料と工数を比較して選びます。既に同じ価値を満たす反例でcoverageがcompleteになれば主実験候補から外れます。既存入口の改善は`first_action`として別に保持します。候補自体を発見する専門調査と、最後の施策採否は人が原資料を照合する工程です。

出力は入力SHA256、出典・期間、ページ別CTR、実観測page×query、出典別の原表合計照合、警告を含みます。異なる取得元/期間を混ぜません。0クリック時のbinomial感度値は独立同分布という仮定を明記した説明補助で、効果予測にもtitle診断にも使いません。

`--brief`は実行案の必須フィールドと証拠IDを検査します。`target_url`、`reader_problem`、`changes`、`reader_value`、`effort`、`mechanism`、3つ以上の`alternatives`（option/decision/reason/evidence）、`observation_plan`、`reversal_condition`、`evidence`を含めます。無根拠の予測値を入れないため`effect_estimate`はnull。contract passは構造チェックであり、成果の正しさを採点する機能ではありません。

## 改善の一巡

1. 原値を取り込み診断し、本文/検索結果/一次資料の不足調査を埋める。
2. 検索、導線、新記事、チャネル、技術の案を比較し、読者が完了できるタスクを根拠に一つ選ぶ。
3. URL・変更本文/適用可能patch・工数・対案・観測計画を揃え、独立レビューで原資料と照合する。
4. 公開は別途の指示に従う。採用後のSHA・日時と計測を対応させ、次回の判断材料と専門資料を更新する。
