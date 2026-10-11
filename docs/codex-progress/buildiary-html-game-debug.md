# Buildiary HTMLゲーム診断記事

- 親スレッド: 01a10caf-ddc0-72d1-9556-42849e68d031 / codex_delegation、指定Environment
- scope: 既存部品による1本の実践草稿記事と隔離した実演。元例・復旧UI・サイトCSS・ElevenLabsの別修正は保護。
- branch: research/buildiary-html-game-debug
- original/fetched base: 34911361159699c3967eef63530c7fde290876d8
- earliest verified remote checkpoint: 同上（無変更baseをremote branchへpushしてls-remote照合）
- new route: /articles/ai-html-game-not-working/、registry draft、noindex/nofollow、published一覧・sitemap除外
- research: docs/research/html-game-debug/。初期研究のoriginalsは変更せず、ARTICLE_STAGE.mdに新段階を記録。
- acceptance: original fixture21、layout correction21、new article fixture21。アプリ内7版×3幅と元記事2周目・reloadのE2E。狭幅の実演ボタンは枠内スクロールで確認する。
- review: /root/article_reviewによるsource review・記事1280/375/320画面・新例320見出し確認。最終160px reflow stressと狭幅展開の再レビュー待ち。
- initial failures: research CommonJSのlint設定を限定修正。先頭へのdraft追加を末尾へ移動。テスト内のiframe絶対位置比較を相対位置へ修正。並行負荷で既存UI unit testsにtimeoutが出たため、最終qualityはブラウザー検査と分けて実行。
- current work: 最終quality/build/E2E、最新main照合、draft PR、親へscope/evidence報告。merge前に親へ報告する指示を保持。
- no merge / no production deploy performed
