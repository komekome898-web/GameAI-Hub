# 成長分析で使う専門資料

公開一次資料の確認日：2026-10-17。以下は各出典の短い要約と、このサイトでの使い方。

| 問い | 一次資料 | 実際に使う方法 | 適用の境界 |
|---|---|---|---|
| PVが増えたのは読者増か | [Google: enhanced measurement](https://support.google.com/analytics/answer/9216061) | 読込に加えpushState/replaceState等を確認し、実装の履歴操作と突合。記事本文のrouteと要約カードを区別する | PVを訪問者や本文読了に読み替えない |
| クリックされない原因は何か | [Search Console metrics](https://support.google.com/webmasters/answer/7576553) | query×page×deviceの表示/クリック/順位を取得し、意図、公式への直行、競合の回答形式を比較 | 現在の検索結果は時点・地域・端末等で変わる。pageとquery別集計は結合にならない |
| 検索結果に出るだけの量産か | [Google: helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | 読者が作れる成果物・実行/復旧・出典を確認し、未完タスクを一つ埋める | 記事数や文字数の増加を効果としない |
| 流入減の調査順は | [Google: traffic drops](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) | 計測、技術、検索需要、query/page分布を分けて調べ、施策対象を絞る | 計測変更と検証流入を未分離の前後比から実読者の減少を断定しない |
| 保存したHTMLを公開できるか | [GitHub: create site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) | 保存branchと公開source branch/folder、entry file、公開範囲、Visit siteを合わせる | 単一HTMLの手順をサーバー処理が必要なゲームへ一般化しない。設定操作・公開は実行者の許可が必要 |

## 指標から施策へ進むときの分岐

検索表示あり・click低い → titleだけでなく意図/競合/検索結果の回答完結性を調べる → 本文が既に満たすなら差分価値を先に確定。

一覧PVが多い・記事PVが少ない → 履歴計測/セッション/実リンクを調べる → 直接のUI障害があれば直す。履歴PVだけで大規模導線変更しない。

外部referralあり → 対象URL、engaged sessions、既知テストを確認 → 送客先と投稿内容を合わせた一つの検証案を作る。投稿は自動で行わない。

記事の途中に未完タスクあり → 既存読者が次に必要な手順を一節で補う → 検索需要の量を捏造せず、読者価値と獲得の仮説を別々に示す。

## 実読者の観測

`article_view`はmountイベント。GA active usersも人間/外部読者の証明にはならない。既存GAで記事route、engaged sessions、source/medium、既知テストを分けた数値をreader proxyとして表示する。hub履歴PVは独立記事PVと分離。計測を追加するなら、可視状態での能動滞在と本文到達を条件として定義し、イベント重複/タブ非表示/再訪をテストする。数値目標を設定するときは事業上の採用基準と統計的な効果推定を分ける。

## 現在の検索露出を超える獲得機会

既存GSCの表示数は現在の露出であり、市場需要の上限ではない。入口の小修正と並べて、未到達の読者の具体的な問いを調べる。公開コミュニティの本人コメントは関心の存在の根拠にはなるが、日本語市場規模や予想PVには変換しない。

獲得実験を選ぶときは、(1)読者の未解決の問い、(2)見せられる自分の作品/検証、(3)今の自サイトにも競合にも既にある要素との差分、(4)既存の配布経路からその価値へ届く方法、の四つを出典付きで揃える。『実作』『スマホ』『失敗談』という属性だけで独自性と呼ばず、実際の操作・具体場面・持ち帰る道具の対応を確認する。

当時のprompt原文、後から編集した再現例、現在のプレイ写真、修正前後の実証を別にする。クラウド編集を端末内処理と説明しない。生成AI機能の現行条件は[公式のクラウド利用案内](https://code.claude.com/docs/en/claude-code-on-the-web)等で確認し、作者が制作時に使った条件とは分ける。

配布を決める際は、既存投稿の本文・添付素材・着地先、読者本人の質問、見せられる実物を照合する。既にリンク済みなら、新たに得られる作業と到達先の価値が変わるかを調べる。比較表には「形式／誰のどの疑問／冒頭の約束／見せる具体場面／原資料／採否理由」を記す。短文は手順や条件、完成物画像は出来上がり、実操作は操作と結果のつながり、前後比較は症状と修正の違いをどこまで示せるかを評価する。これらを固定の優劣にはしない。実際の素材が示す範囲と読者の疑問が合う形式を選び、原資料と対案比較に基づく実見本まで作る。全形式を作る必要はない。前後条件が対応しない映像を修正効果の実証に使わない。選定根拠と配信効果の観測は分け、数値がない形式の効果を予測しない。投稿は別権限の実行段階。内部リンクにはUTMを付けず、外部の承認済みキャンペーンだけをsource/medium/campaignで分ける。
