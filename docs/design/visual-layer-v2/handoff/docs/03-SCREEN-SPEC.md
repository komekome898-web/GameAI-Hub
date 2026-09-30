# 03 画面ごとの移行仕様

全画面：header/main/footer、DOM順、現行link、注意書きを維持。背景は上部だけ、下はcanvasへfade。
全体をモック1枚にして貼る実装は禁止。文字は必ずHTML。

## Home /
H1：作りたいゲームから、次の1作業を決める。
390×844：現行compact Header→eyebrow→H1→何が得られるか→既存ProjectIdeaForm（label/input/help/privacy/error/button/入力例）→完成例link。
通常初期表示で開始button全体がviewport内に入ること。目安y620〜720以内だが固定heightで達成しない。通知/error/200%拡大時は自然に伸ばし、不要な画像を先に削る。
desktop：既存copy/input側を約2/3、output cueを約1/3。同じworking planeの薄い境界でまとめる。入力UIの移動は最小限。
first viewの次：home-example→home-paths→home-continuation→home-featured→example-projects→home-trust-note→Footer。全節維持。
Homeの円環採用はV4任意：home-featuredの現行3件をその位置のまま。Heroへ移動しない。
platformer thumbnailは制作イメージで、実際の初回生成成果物を約束しない。Home initial output cueは現行の文字だけでもよい。

## Project /project
入力H1：ゲームのアイデアを実行計画へ。条件確認H1：読み取った条件を確認してください。
制作H1：実際のprojectName（モンスター収集ゲームへ固定しない）。
390：Header→context/step/intent/保存等notice→current task→現在の指示→該当分岐で提供するworkspace/artifact→done criteria→next/recovery→成果物progress→今日queue→roadmap→詳細/出力/share→Footer。
current taskだけ薄い陶器working frame。チェックや進捗は現行stateを使用。完了していないtaskのfill/チェックを描かない。
desktop：contextの下に1枚のworking plane。現行workspaceが存在する分岐だけ指示とworkspaceを2列（minmax(0,1fr)）。それ以外は1列。見出しや操作を分断するためのDOM再配置をしない。
Roadmapをside navigationへ引き上げず下部に保持。既存anchorとreturn先ID保持。
現在の保存/復元/HTML貼付/実行/ダウンロード/エラー/回復があれば全て残す。モックに見えないことを理由に削除禁止。
「作業空間が組み上がる」感覚は実際のcompletedラベルと薄い線の変化だけ。新報酬、レベル、confetti、生成アニメなし。

## Tools /tools
H1：何を作りたいですか？
390：Header→Project戻り文脈→H1→goal-groups 3群→検索→追加条件details→適用中filterと解除→件数→tool-rows→evidence→Footer。
desktop：同順序、条件領域を薄い作業trayに。結果は現行rowのまま。採用カード風に全結果を浮かせない。
verified/unknown/staleは現行テキスト/日付/根拠にiconを添える程度。unknownも十分なcontrast。
検索・URL・back/forward・filter解除・Project return・Compare追加を保持。affiliate有無でframe、影、面積を変えない。

## Compare /compare
H1：候補を、根拠から比べる。
390：Header→context→H1→selection tray→既存decision summary/picker→differences-only→criterionごとに候補の値を並べる→公式根拠→次action→Footer。
desktop：同じ上部→semantic table。th/scope/caption/スクロールownerを保持。セルは白いflat面でborderのみ。
selection trayだけ低い陶器面。候補slotは同等、remove44px。空/1/2/3/4件と長名を確認。
unknownは?＋不明＋確認link。差分ゼロ状態の説明も保持。背景でtableを透かさない。

## Articles hub /articles
H1：今の制作課題から、次に読む手順を選ぶ。
390：Header→現行eyebrow/H1/lead→既存3つのintent anchor→#startのH2/description→円環→前/次/位置/一覧切替→#voice→#3d→#practice→hub-project-cta→Footer。
desktopも同順。start3件だけstageを広く取り、中央平面・左右回転。構図のためにH2や更新日を消さない。
初期activeはstart配列0番。mockの中央が1番という情報順を維持し、左右の仮テキストを転記しない。
voice/3d/practice群は現行orderの陶器調compact rows。Home/関連記事へは別sliceで検証後展開。

## 記事本文 /articles/[既存slug]
390：Header→breadcrumbs→H1→lead→更新/確認日/広告開示→要約/目次→既存本文→検証/回復→Project CTA→出典/関連→Footer（実際の既存記事順を正本とする）。
desktop：既存reading widthの白い読書面、外側余白だけ淡いatrium。段落や表ごとに金属frameを付けない。
how-to：コード/手順/観察可能な完了条件が主役。browser記事は1対1バトルを教えるのでplatformerを実成果物として掲載しない。
tool実践：実際の説明画像/素材/手順を維持。新しい抽象サムネイルで実操作画像を置換しない。
commercial/pricing：答え/制約/確認日/一次資料/tableを優先。新しいHero画像・円環料金表・強い購入CTAは追加しない。
関連記事に既存リストがある場合のみV4でdeckを検討。本文途中の関連記事新設は今回対象外。

## 残りの画面と状態
Tools詳細、Guides、Methodology、Privacy、Affiliate disclosure、既存404/loading/errorも共通canvas・borderだけ整合。
各routeのH1、本文、anchor、form、trust表示は現行どおり。Privacy/信頼ページは背景画像なしの読書面でよい。
新しいrouteや機能は作らない。loading時にcard画像を先に出して結果を装わない。errorはtextとrecoveryを前面に。
