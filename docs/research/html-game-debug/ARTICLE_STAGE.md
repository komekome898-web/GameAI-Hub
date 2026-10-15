# 実装段階の範囲と証拠

2026-10-11の追加指示により、研究資料から1本の実践記事を実装する段階へ進みました。README.md、draft-ja.md、元fixture・結果・スクリーンショットとlayout-correctionは先行研究時点の記録として維持しています。それらの「サイト変更なし」「quality/build対象外」「no push/PR」は先行段階の範囲であり、今回の実装段階の状態を表すものではありません。

## 今回の実装

- 新規route: /articles/ai-html-game-not-working/。既存ArticleFrame、ArticleHeader、CopyTextButton、BeginnerGameWorkspaceを利用。
- レジストリはdraft、route metadataはnoindex/nofollow。公開記事の一覧とsitemapには追加しない。
- 症状リンク、元ファイル保護、最初の関連エラー、3実例、単一の切替式実演欄、安全な相談例、2周目の確認リスト。
- 実演だけのコピーにborder-boxを適用。見出しは1.25remと語単位span/wbrで末尾1文字だけの改行を回避。保存HTML用のviewport metaも追加。JSは対応する先行fixtureとbyte同一。
- 元の作り方記事、既存復旧UI、共有の表示枠、サイトCSS、ElevenLabs記事を変更しない。
- ESLint設定はこの資料内のNode CommonJS runnerだけrequire-importsを許可し、他のlintを維持。先行検証スクリプトを変更せず検査できるようにするため。

## 保存先と再実行

article-demonstrations/fixturesは新しい実演HTML 7本。data/html-game-debug-examples.tsと同じHTMLです。

```sh
node docs/research/html-game-debug/generate-article-examples.mjs
node docs/research/html-game-debug/article-demonstrations/verify.cjs
```

結果と51枚のスクリーンショットはarticle-demonstrations/results.jsonとscreenshots。アプリ内の表示枠・実行版切替・エラー表示・2周目と記事画面の証拠はarticle-browser/へ保存します。

## Git/GitHub

originはcanonical URL、fetch成功。実装開始時のorigin/mainは34911361159699c3967eef63530c7fde290876d8。認証setupとrepository API read成功。新たに許可されたdraft PR準備のため、research/buildiary-html-game-debugを同じbase SHAでpushし、ls-remoteでremote refとSHAを照合しました。最初のremote checkpointは34911361159699c3967eef63530c7fde290876d8。

この時点ではmainへの変更、merge、production deployを行っていません。pageとregistryは同一commitで届け、親スレッドへscope/evidenceを報告してからmerge判断へ進む指示です。実装・quality/build・ブラウザー検証・独立レビューの最終結果はHANDOFF.mdへ記録します。
