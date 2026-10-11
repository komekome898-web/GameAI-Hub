# Buildiary HTMLゲーム診断記事

- merge preparation: 親がpublication diffを受理し、exact-head CI/Preview成功後のmergeを承認。既存E2Eの17/5固定値とSTARTリンク一覧を更新。default deck文字計測のbutton typography限界をHANDOFFへ記録。独立レビューPASS。
- integration: PR176 main d83ead397de80cf917faf835a109bae3cd08331dを履歴保持mergeで取り込み。mainの七作品とgamesテストを保護。統合状態でquality・関連E2E・CI/Previewを確認する。

- publication transition: 親の追加指示で草稿表示/noindexを除去しregistry published。PR175のdraft状態は維持し、最終レビューまでmergeしない。
- localized review fix: 未実行編集は切替で消える旨を選択直前に明記、実行済み保存と分けたE2Eを追加。既存#ask-aiへ手動エラーコピーする導線も追加。共有workspaceは変更なし。
- final publication gates / exact SHA: PR175と最終引き継ぎ報告を参照。先行検証を下記に保持。

- 親スレッド: 01a10caf-ddc0-72d1-9556-42849e68d031 / codex_delegation、指定Environment
- scope: 既存部品による1本の実践草稿記事と隔離した実演。元例・復旧UI・サイトCSS・ElevenLabsの別修正は保護。
- branch: research/buildiary-html-game-debug
- original/fetched base: 34911361159699c3967eef63530c7fde290876d8
- earliest verified remote checkpoint: 同上（無変更baseをremote branchへpushしてls-remote照合）
- new route: /articles/ai-html-game-not-working/、registry draft、noindex/nofollow、published一覧・sitemap除外
- research: docs/research/html-game-debug/。初期研究のoriginalsは変更せず、ARTICLE_STAGE.mdに新段階を記録。
- acceptance: original fixture21、layout correction21、new article fixture21。アプリ内7版×3幅と元記事2周目・reloadのE2E。狭幅の実演ボタンは枠内スクロールで確認する。
- review: /root/article_reviewによるsource review・記事1280/375/320画面・新例320見出し確認。最終160px reflow stressと狭幅展開もPASS、P0/P1/high-impact P2なし。対象source SHA89312f15c207d68a91f956e88f3c9f299c14a6e6。
- initial failures: research CommonJSのlint設定を限定修正。先頭へのdraft追加を末尾へ移動。テスト内のiframe絶対位置比較を相対位置へ修正。並行負荷で既存UI unit testsにtimeoutが出たため、最終qualityはブラウザー検査と分けて実行。
- final gates: 最新main a4958ffをrebaseで取り込み、quality PASS（47 files / 370 tests、Python76）、本番build PASS、記事E2E4件PASS（2.2m）、capture PASS。検証の詳細と限界はHANDOFF.md。
- delivery: coherent source commitと最終資料をdraft PRで届け、親へscope/evidence報告。merge前に親へ報告する指示を保持。
- no merge / no production deploy performed
