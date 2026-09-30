# 07 小さなsliceによる実装

## V0：開始と差分把握
最新AGENTS/CODEX_CLOUD_TASK/環境契約に従う。canonical fetch/push origin、fetch、origin/main SHA、認証、remote保存のgateを先に実施。
新規task＋再利用Environment＋既存Issue/branch/PR/ledgerをresume。NEW_TASKは新branch/PRの意味ではない。
ZIPは本体外で展開・検証、全ファイルをrepo rootへ上書きしない。既存taskがある場合は再開する。
基準before screenshots（390/375/320/desktop）とHome firstview位置、Project完了/recovery、Tools/Compare URL動作を記録。
appとdataの変更が基準SHAからあれば対応表を更新し、後退させない。

## V1：共通素材 + 静的記事カード
assetsのWebP/SVG配置、scoped tokens、背景layer、ceramic素材を通常listのstart記事に導入。
まだcarousel JSなし。Header/Footerは色と境界だけ。既存title/日付/リンク/群を維持。
gate：背景404なし、初期表示/文字contrast/長文/320、機能差分なし。素材見本とカードのframe/光/色を比較。
rollback：v2 modifier/CSS importとasset参照を戻す。旧データ・stateは変更しない。

## V2：Home + Project
Home working plane、current taskの素材と階層。入力/条件確認/制作/完了/詰まり状態を順に確認。
各分岐で既存workspaceのみを装飾。business logicのリファクタリング禁止。
gate：Home390 CTA、320 heading、入力privacy、copy/paste、done/next/recovery、save/load、長いerror、Project intent。
rollback：該当routeのmodifierだけ戻す。ストレージmigrationなし。

## V3：Tools / Compare / Article reading / その他
filter contextとselection tray、flat結果/表、読書面、trust routeを整える。
gate：順位/件数/unknown/差分/URL/backforward/affiliate/sourceとportal/SEO維持。
rollback：route別に新CSS scopeを外せる状態を保つ。

## V4：Creation Deck
startの3件のみenhance。SSR fallbackとlist切替を先に実装し、最後にdrag/回転を追加。
gate：mouse/touch emulation/keyboard/JS無効/reduced motion/320/zoom/長いタイトル/1-4件/横overflow。
このgate完了後、Home featuredへの流用は同じcomponentで独立確認。既存にない関連記事を勝手に追加しない。
rollback：enhancement無効でV1の静的一覧へ。リンクと素材は残る。

## 完了の扱い
同じPR内でもsliceごとにまとまったcommitと証拠を残す。未検証sliceを「完了」にしない。
小さいdiff単位で既存CIを満たす。npm run quality / npm run build / 関連E2E＋独立スクリーンショットレビュー。
実装担当だけの承認は禁止。P0/P1/high-impact P2は修正後に再renderして再レビュー。
今回の依頼はZIP作成であり、この場では実装しない。将来の実装タスクも別途明示がなければmerge/Production変更をしない。
