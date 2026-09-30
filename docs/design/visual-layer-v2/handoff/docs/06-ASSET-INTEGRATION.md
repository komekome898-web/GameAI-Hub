# 06 素材と配置

## 背景
`assets/backgrounds/mint-atrium-master.png`は原本。768/1280/1672.webpは同一構図の軽量書出し（縦横比維持）。
装飾画像をWeb背景として1ページ1枚だけ。繰り返しなし、background-attachment:scroll。下端はCSSでcanvasへfade。
mobileは上部約540〜660pxの領域、画像自体はaspect ratioを保持してcover、position:right topを初期値とする。
desktopはmain上部約800px、width全体、下端15〜25%でfade。article本文では外側余白に限定、本文面は不透明白。
320は画像を読み込まないCSS media query。mobile用画像とdesktop用画像を同時にpreloadしない。
backgroundは意味を持たないのでCSSでよい。image要素ならalt空/aria-hidden=true/pointer-events:none。
Headerや全画面overlayの祖先へfilter/transformを加えない。decorative layerのz-indexは局所的に0、本文は1。負のzでbody裏へ消さない。
本assetsは採用モックから作った独立素材。モック背景のピクセル完全切り抜きではない。crop位置は実画面で調整する。

## サムネイル
|slug/用途|asset basename|規則|
|ai-browser-game-how-to / 一般的な制作イメージ|game-creation|一覧の装飾表紙限定。記事で作れるゲームの実スクリーンショットと表示しない|
|before-asking-ai-build-game|planning|チェックリストの装飾。verified stateには使わない|
|github-beginner-game-development|development|ブランドロゴなしの開発環境イメージ。GitHub公式素材を装わない|
|音声関連記事の小型fallback|icons/voice.svg|本物のサービスロゴや生成結果ではない|
|3D関連記事の小型fallback|icons/model.svg|形状の汎用icon。Meshy生成成功を意味しない|

各PNG masterと480/960.webpを同梱。カード画像はwidth/height属性とaspect-ratio:3/2で場所を予約。
sizesはmobile約304px、desktop352pxを基準。srcset 480/960。本文の既存操作画像は置換しない。
初期画面で必要なthumbnailだけ通常load、それ以外lazy。背景をpriorityにしてHome入力を遅らせない。
装飾thumbnailのload errorは同じratioの淡色fallback。タイトルとlinkは消さない。
将来記事へ無関係な表紙を全件割当しない。画像のないrowは画像なしで成立させる。

## 配置先
`public/visual-v2/backgrounds/`にWebP、`public/visual-v2/thumbnails/`にWebP、`public/visual-v2/icons/`にSVG。
参照URL例：`/visual-v2/backgrounds/mint-atrium-768.webp`。
master PNGとreferenceはdocs/asset-source等の非publicへ保管。WebページからZIP/reference画像をロードしない。
SVGはscript/external resourceなし。全てローカル配信、外部画像CDN依存なし。

## 出自と利用上の区別
背景/thumbnail原本は本会話の採用モックを参照して生成した素材。SVGは本パッケージ用の単純なオリジナル図形。
実製品スクリーンショット、公式ロゴ、生成品質の証拠ではない。商標・第三者の承認を示す文言を添えない。
新規素材の著作権独占性や法的適合性を保証する書類ではない。
キャラクターを展開する場合は同梱game-creation-masterを参照し、顔/体型/色を変更しない。
