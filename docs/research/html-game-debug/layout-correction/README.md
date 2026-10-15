# 分離した幅修正の追検証

掲載記事、元fixture 7本、元草稿、元resultsとscreenshotsは変更せず、このディレクトリだけに追加しています。サイトのCSSや記事routeは変更していません。

唯一のレイアウト変更は、各コピーの `main { width: min(88%, 360px);` を `main { box-sizing: border-box; width: min(88%, 360px);` に置換することです。JSの3意図的不具合とは独立した共通CSS修正で、各コピーのJSは対応する元fixtureと同一です。manifest.jsonで元コピー／幅修正コピーのSHA256を保存しています。

## 再実行

依存関係をインストールしたリポジトリのルートで:

```sh
BUILDIARY_CHROMIUM=/usr/bin/chromium node docs/research/html-game-debug/layout-correction/verify.cjs
```

今回の環境では別worktreeの依存を参照するため、NODE_PATH=/workspace/GameAI-Hub/node_modulesを指定しました。verify.cjsは元検証スクリプトをコピーし、最初の画面でscrollWidth==viewport widthをassertする検査を追加しただけです。results.jsonは同じ7版×3幅=21ケースPASS。screenshotsは51枚です。

## 横はみ出しの厳密な原因

元CSSは初期値content-box。widthにpaddingとborderが含まれません。左右paddingは24+24=48px、borderは3+3=6px、合計54pxが指定幅の外側に足されます。bodyはgrid・place-items:centerなので、幅の超過は中央を基準に左右へ分配されます。

| viewport | 元content幅 | 元border-box外寸 | 左端 | 右端 | scrollWidth |
| --- | --- | --- | --- | --- | --- |
| 1280 | 360 | 414 | 433 | 847 | 1280 |
| 375 | 330 | 384 | -4.5 | 379.5 | 380 |
| 320 | 281.59375 | 335.59375 | -7.796875 | 327.796875 | 328 |

375幅では外寸が9px超過し、右側の4.5pxが整数scrollWidthに丸められて5pxの差になります。320幅では外寸が15.59375px超過し、右側の7.796875pxが丸められて8pxの差になります。「枠全体が5〜8pxだけ広い」という意味ではありません。

border-box化後は外寸が375幅で330px（左22.5／右352.5）、320幅で281.59375px（左19.203125／右300.796875）。scrollWidthは各viewportと一致しました。desktop外寸も414→360pxとなるため、枠幅が少し狭くなります。box-model.jsonに実ブラウザー測定値を保存しています。

目視では文字と操作ボタンが見え、375pxは横並び、320pxはボタンが縦並びになります。320pxの見出しは末尾の「ル」が次行になり、整った見出し組みにはなっていません。今回は横はみ出しの最小修正に限定し、文字サイズや見出しの改行は変更しません。responsive UI全体の合格、実機モバイル合格ではありません。

box-model測定の初回はfile://で開こうとしましたが、環境ポリシーのERR_BLOCKED_BY_ADMINISTRATORで阻止されました。保護設定を変えずローカルHTTPへ切り替えて測定しました。module実験やfile://成功の主張はありません。

## ソース同一性

元記事app/articles/ai-browser-game-how-to/page.tsx SHA256:
840263a4985e7facbeb1f489823a576715611320bdff7d5757da9ae2dd1ff6eb

元抽出HTML fixtures/original.html SHA256:
c1a84cf73a313bda6131c9a8335ead8985086fee9d953fb0fd5ccde2d3045bd3

基準Git SHA: 34911361159699c3967eef63530c7fde290876d8。

全7元fixtureをmanifestのSHA256と照合、記事ソースSHA256も照合し、未変更を確認しました。元worktreeもcleanなworkブランチのままです。push、PR、公開、main変更なし。layout-correction/draft-ja-layout-reviewed.mdは追検証内容を加えた別草稿です。
