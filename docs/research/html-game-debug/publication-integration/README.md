# 公開前の統合検証（2026-10-11）

main29a3d65331235cafeb4a36f90944ba51589a6484（PR177）を履歴保持mergeで取り込んだ。ゲームのdata、紹介、route、global CSSと最新ゲーム検査はmainと同じ。article追加による件数だけがゲームunitに差分として残る。元how-toと共有workspaceも保持。

- 統合7f3a1cbのquality:49 files /377 tests、Python76、lint・型・validator PASS。
- 375px記事、6件summary復元、150% label/date、最新7作品と8カード:関連11件中9PASS。V3のviewport-only hub snapshotでdeck button再生成のidentity違反が1件あり、serialのV4は未実行。この初回結果をintegrated-initial-e2e.txtに保持。
- f84b7dfのV3/V4再検査:2PASS（3.6分）、production buildもPASS。viewport-only hub測定は安定した本文と非deck buttonを測り、全controlsのsurface/focus検査を維持。共有identity guardは変更していない。
- 4種類のbutton間隔は永続CSSで再生成後も適用し、summary全文復元後とfocus/surface操作後にlive computed stylesを検査。v4-dynamic-spacing-*-controls.jsonに全対象のfontPx/valuePxを保存。synthetic font拡大のbutton coverageを追加したという主張ではない。
- START固定5はregistry件数6へ整合し、summary復元とlabel/date測定で全6件を保証。≥1.49とoverlap検査は維持。
- 新記事E2Eの既定証拠出力はignored test-results/html-game-debugへ移した。追跡済み研究PNGを上書きせず、既存clean-source検査を維持。summary→記事375→V3の3ケースもPASS（evidence-isolation-e2e.txt）。
- 各狭い差分とmain統合は独立レビュー済み、blocking findingsなし。exact-head CI/Previewの成功がmerge条件。

検証環境はChromium151、Linux、headless/local HTTP。実機・Safari/Firefox・本番表示検査の結果ではない。
