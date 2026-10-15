# 02 Visual System — Mint Atrium / Crafted Ceramic

## 色と素材
|用途|値|規則|
|Canvas|#F2F6F2|背景失敗時も成立するベース|
|陶器の表面|#FAF8F2|不透明、本文はこの面上。透過で読ませない|
|読書面|#FFFFFF|記事本文と比較表。素材ノイズなし|
|くぼみ|#EEF1E9|画像well/補助操作面、selectedの代用にしない|
|文字|#142D2B|bodyとtitle|
|補助文字|#52645E|日時・説明にも十分なcontrast|
|Primary emerald|#0B6855|白文字。hover #075440、active #064638|
|金属縁|#A59E8E|装飾限定。フォーム境界には#78877Fを使用|
|側面|#BFC8BC|薄いセージ、画面外へはみ出させない|
|highlight|#FFFFFF|上/左の幅1pxのみ|
|success|#17633B|check＋確認済み|
|warning|#7C4A08|三角icon＋要確認|
|error|#A32935|error文とfield連携|
|info|#275B7B|info iconと説明|
|unknown|#52645E|?＋不明、価格0円や緑checkに置換禁止|

現行emerald/mint identityを維持。採用モックに合わせprimary操作は深緑に統一する設計判断。
既存オレンジは警告・補助用途へ限定し、意味のある既存statusは保持。CTA変更は同じslice内で主要routeを確認。
light only。新規dark mode/ユーザー色設定を追加しない。

## 面の階層
|層|用途|奥行き|
|0 background|atrium画像|非操作、1枚、scroll追従/parallaxなし|
|1 context|project条件、roadmap、filter概要|影なし、線と余白|
|2 working|Current Task、Home入力、Tools条件、Compare選択tray|1px線＋低い影。回転なし|
|3 collectible|記事deckカードのみ|陶器面＋2〜3px frame＋側面＋接地影|
|4 controls|primary action、focus|凹凸は1px以下。状態は文字/iconで示す|

## Cardを安っぽくしない寸法
- desktop deck 328〜352px幅、角10px、frame 3px、faceのinset 2px、本文padding18px。
- 375/390ではframe 2px、角8px、本文padding14〜16px。320はflatで角6px/1px線。
- 大きい丸角、太い白枠、強いgloss、3本以上の多重輪郭を避ける。
- 正面には均一な陶器色。gradientは金属の薄い周囲と操作部の1本だけ。
- 上左光：top inset 1px白、bottom側1px muted metal。影は0 2px 3px rgba(27,45,36,.12)と0 12px 24px rgba(27,45,36,.10)。mobileは後者を0 6px 12px/.08へ。
- 画像wellは3:2、inner radius6px、inset影0 1px 2px/.16。画像上に装飾反射は重ねない。
- labelはflat emerald白文字14px。更新日14px。タイトル18〜20px/1.5、全文表示。ellipsis/line-clamp禁止。
- カード全体は一つのa。読む領域はリンク内span、44px高。カテゴリtabは非操作。
- 小型一覧カードはframe1px、影1つのみ。カード全体に金属gradientを敷かない。

## Typography / geometry
現行Noto Sans JPとNoto Serif JPを再利用、新fontなし。作業見出しのみsans。記事の見出し/本文は現行typographyを維持。
body16px/1.75、小文字14px/1.5。mobile H1 28px/1.35、320では26px。desktop36〜40px/1.3。
Current Task22〜26px/mobile、28px/desktop。長い記事H1は現行値を優先し、短いHomeと同じ固定heightにしない。
space 4/8/12/16/24/32/48。本文/フォームのmin-width:0。通常日本語はword-break:normal、URL/code領域のみ局所wrap/scroll。
max-widthは現行--content-max/--reading-maxを維持。これらを巨大heroに合わせて広げない。

## Responsive
|viewport|page gutter|deck|背景|working surface|
|320×844|12px|通常の縦一覧、回転0、影なし|flat色、背景画像なし|1px境界、装飾側面なし|
|375×844|16px|active幅約288px、左右peek、rotateY±7degまで|768 asset、上部だけ|浅い影1つ|
|390×844|16px|active幅約304px、左右peek、rotateY±8degまで|768 asset、上部だけ|浅い影1つ|
|681〜1023|24px|railか浅いdeck、読みやすい幅優先|1280 asset|読書は1列|
|1024以上|現行gutter|active352px、左右±12deg、perspective1200px|1672 asset|Project必要時のみ2列|

ブレークポイントは既存680/681等を尊重し、340以下のみdeck縮退を追加。viewportは性能推定ではない。
高さ不足/拡大/長文でdeckが操作を隠す場合は一覧表示を提供。カードheightは文字量から測定、固定pxでclipしない。

## Motion
自動回転なし。hover対応pointerのみ読む領域の影/色を120ms、card上昇最大2px（任意）。
deckのsnap220ms ease-out、連続操作でqueueを積まない。focusは即時、ring3px #0B6855＋白2pxの間隔。
prefers-reduced-motionはdeckを静的一覧、transition:none。forced-colorsも静的一覧とsystem border/focus。
focusリングは金属縁と別。影やdepthはstateを伝える唯一の手段にしない。
