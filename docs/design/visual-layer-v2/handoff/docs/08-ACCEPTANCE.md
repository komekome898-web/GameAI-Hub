# 08 受入とPerformance Budget

## 性能設計値（測定結果ではない）
|項目|予算/方式|
|追加runtime JS|背景/素材0。deckのみgzip追加8KB以内目標、第三者carousel libなし|
|追加CSS|gzip8KB以内目標。巨大data URI/全画面filterなし|
|mobile初期背景|WebP <=120KiB目標、320は0。配信候補768|
|desktop背景|<=250KiB目標。配信候補1672|
|thumbnail|480 <=60KiB / 960 <=120KiB目標。表示枚数に応じload|
|GPU|同時transform最大3card。常時rAF、全ページwill-changeなし|
|描画|動かすのはtransform。shadow/filter/background-positionを連続animateしない|
|LCP/INP/CLS|同条件baselineより悪化させない。実測値と環境を記録。field指標合格をlabだけで宣言しない|

Level A CSS：frame、bevel、くぼみ、影、focus、deck transform。
Level B raster/SVG：背景とthumbnail/既存icon。
Level C Canvas / D WebGL：不採用。価値に対してJS/GPU負荷が不要。
能力推定のUA/deviceMemory依存は追加しない。狭幅・motion preference・list選択・機能失敗でflatへ。
高性能desktopでも追加effectは最大depthのみ。低性能端末をwidthで判別したと主張しない。
実測でjankが残る場合、decorative影→角度→背景の順で削減し、必須情報は残す。

## 必須視覚matrix
- 320×844 / 375×844 / 390×844 / desktop1440×900。
- 320px・200%相当reflow、長い日本語/ASCII/URL、展開details、エラー、空状態。
- Home初期CTA、Project current taskとnotice、Tools制約解除、Compare 0〜4候補と差分、記事hub/各本文type。
- Header open/closed、skip link、focusがsticky headerやframeで隠れない。
- body scrollWidth<=clientWidthに加え、実画像で1〜3文字折返し/不自然な空白/操作衝突を確認。
- referenceは物理390×844の検証証拠ではない。実画面で作成し直す。

## 機能回帰
1. Home入力→条件→Project（異なるゲームジャンル、非ブラウザplatform含む）。意図と制約維持。
2. 実current task→copy→既存artifact/workspace→観察可能done→next→recovery。
3. 保存/復元・共有/出力・コード長/エラーは現行機能ごとに確認。
4. Tools task/filter/search/clear→Compare→back/forward→Project return、query保持。
5. Compare criterion-first、semantic table、unknown/source freshness、difference-only。
6. 各記事目次/hash/コード/公式link/広告開示/Project source。portal設置後もDOM順維持。
7. metadata/canonical/JSON-LD/GSC/robots/sitemap、affiliate fallback/rel、測定eligible条件。

## Accessibility
全操作44px以上。文字normal4.5:1、大文字3:1、必須control境界/focus3:1を実際の組合せで検証。
装飾edgeはcontrast判定対象control境界の代わりにならない。stateは文字＋icon。selectedにはchecked/aria-pressed等を現行に合わせる。
画像は装飾alt空、既存意味のある画像はalt保持。live更新はcopy/status/settled articleのみ、重複通知を避ける。
SRとkeyboardで全記事到達、DOM順不変、Tabの最中に裏へ隠れない。前/次Enter/Space、article Enter遷移。
JS無効、reduced-motion、forced-colorsでflat一覧に戻り全内容維持。
物理iPhone/Androidの実タッチ、soft keyboard、pinch zoomは未実施ならUNTESTED。emulationと分ける。

## Analytics/privacy受入
既存計測を装飾のため変更しない。テストでraw idea/code/errorを送信しない。
Production browser確認が別途許可された場合、fresh isolated contextの最初のnetwork navigationを
`https://game-ai-hub.vercel.app/privacy/?gameai_analytics=off` とし、既存の除外表示/タグ不在を確認して同contextで検証。
本実装はPreview/localで検証し、GA4実受信PASSは別証拠。decorative impressionを増やさない。

## 証拠と判定
viewport/zoom/route/state/exact commitを記録したbefore/after screenshot、keyboard結果、機能結果、console/network、bundle/asset量。
独立reviewerがP0/P1/P2/P3を付け、blockingを修正しsecond pass。実装者自己評価と生成mockを証拠にしない。
現時点のZIPは設計受渡しのみ。アプリbuild/QA/実機は全て未実施。

## 円環切替の追加blocking条件
- 初期paint→hydrateのCLSを実測。SSR縦一覧から自動deckで下段が大きく移動するならFAIL。明示切替へ戻す。
- 前/次buttonにfocus中、340px以下へresize / reduced-motionへ変更 / forced-colors / enhancement失敗を発生させる。focusがbodyへ落ちずactive記事へ退避すること。
- 本文や入力にfocus中の同操作でfocusを奪わないこと。
