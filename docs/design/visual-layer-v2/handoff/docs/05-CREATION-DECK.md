# 05 円環型記事カード — Creation Deck

## 方針
円環は選べる記事の奥行きを表す。無限ランキングではない。全画面3D engine不要。
V4で初めて行うbehavior変更。まずCSS素材だけを通常一覧に載せて受入する。
新componentは記事のtitle/description/updatedAt/category/hrefを既存データから受ける。データ複製禁止。

## SSRとDOM
SSRは現行順のol/li/a（全件）と群H2/description。JSなしでは縦一覧で全リンクへ到達できる。
hydrate成功・幅>340・motion許可の後だけ同じli群をdeck表示へ切替。
logical orderは常に元の配列。clone、DOM回転、重複link/id、aria-hiddenの中のfocusableは禁止。
必要な状態はmode=list/deck、activeIndex、dragOffset、settledIndex、measuredHeight。
button群はenhancement成立後だけ表示。初期化失敗はlist。`一覧で見る`は同じデータの表示切替、二重DOMを作らない。
listに切替時はtriggerを維持し、focusを消さない。deckへ戻すbuttonも44px。
listの選択をsession内で保持してよいが新しいanalyticsやstorage schemaは追加しない。

## 幾何
active 0deg、scale1。隣接はY軸±8deg mobile/±12deg desktop、scale .94/.92、translateY8px。
perspective 1200px（deck stageだけ）。見えるのは中央と左右隣接の最大3枚。
位置distanceはwrapされた最短距離で計算し、同距離時は元順を安定的に採用。
3枚未満：0件は既存empty、1件はflat card/no矢印、2件は重複で3枚にせず2枚rail/flat。
4件以上の展開は任意。画面外のliもDOMに保持し、focusinでそのindexを即座に中央へ出す。focusでの移動はanimationなし。
非activeをinertやtabindex=-1で安易に消さない。Tabは元順に巡り、対象が隠れる前に見える位置へ出す。
実装上それを保証できなければdeckはfocus-within時にflat listへ縮退する。hidden focusを許容しない。
absolute配置する場合、全カードの自然高から最大heightを測りstageに予約する。SSR→hydrateで大きなCLSを出さないよう、最初はlistのまま計測しdeck予約領域の設計を見直す。heightを下げるためtitle/dateをclampしない。

## 入力の決定仕様
- 前/次native button：min44×44、gap8、aria-label「前の記事」「次の記事」。focusはbuttonに残す。
- active更新後は短いpolite status「3件中2件目、記事タイトル」。毎pixel読み上げない。
- 端はwrapする（最後→先頭）。count表示は元順index+1/N。端の瞬間移動で全カードを横断させない。
- 左右キーはdeckの専用操作領域にfocusがある時だけ。page全体やinput、記事linkのEnterを奪わない。
- タッチ：touch-action:pan-y pinch-zoom。横移動が10px以上かつabs(dx)>abs(dy)*1.3でdrag扱い。縦優勢はそのままpage scroll。
- release：abs(dx)>min(64px,cardWidth*.18)なら1件移動、それ以外は元位置へ。1gesture=1件、速度依存の多段飛びなし。
- pointercancel/multi-touch/resize/visibilitychangeでdrag中断・元位置へ。初動からpreventDefaultしない。
- 実dragが成立した時だけ続くclickを抑制し誤遷移を防ぐ。通常tapはa遷移。左右カードも通常tapなら記事を開く（選択だけの二度tapにしない）。
- pointer captureはdrag認定後。keyboard/anchor/selectionを壊さない。pointermoveはrAF最大1回、CSS transformのみ更新。
- auto rotate、scrollによる勝手な回転、device tilt、音、振動、drag中のprefetchは追加しない。

## 縮退
width<=340 / reduced-motion / forced-colors / JSなし / initialization error：同じolを縦一覧、transformなし、全件可視。
375/390は小さい角度、文字面はactiveで正面。全体高さが長い端末でも縦scrollを許可。
zoomによる有効幅減少は上記media queryで縮退。320 at200%で日本語が1〜3字の列になる実装は不可。
ボタン・一覧切替はring外の平面。常に読めるfocusと操作面を確保。

## SEO / analytics
全リンクをSSRに含める。carouselをcanvas画像にしない。canonical/schemaは変更しない。
装飾画像はalt=""（隣接タイトルと重複）。表紙の絵に学習成果を約束させない。
deck操作は既存affiliate click/impressionと無関係。新しい計測eventは追加しない。
回転のためにAffiliate CTAを複製・remountしない。

## 独立レビュー反映：初期描画とfocus退避（優先規則）
自動deck化は、初期paintからの領域予約とJSなしでの全一覧を両立し、実測でCLS非悪化を示せる場合のみ許可する。
上記の「hydrate後だけdeck」は自動切替の無条件許可ではない。縦一覧から1枚高へ縮めて下の群が大きく動く場合、初期は一覧を維持し、ユーザーの「円環で見る」操作で切り替える。
opacity:0、長時間skeleton、リンクの非表示でCLSを隠すことは禁止。自動化のためSSRリンクを欠落させない。
強制flat化（幅、motion、forced-colors、初期化後error）で操作buttonを消す前に、そのbutton群内にfocusがある時だけactive記事linkへfocusを移す。
既に記事linkにfocusがあれば維持。本文・別input・メニューからfocusを奪わない。pointercancel後も同規則。
手動のlist/deck切替は同じtoggle buttonを保持しfocusを残す。focus退避後の記事をscrollIntoViewする場合は即時・最小移動。
