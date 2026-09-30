# 独立設計レビュー — 2026-09-30
対象：docs/01〜08、CODEX_CLOUD_PROMPT.md。実装やProduction受入ではない。
独立reviewer：design_review。

## 初回所見
04対応表、06素材の区別、Project機能維持にblockingな不足なし。
D-01：SSR一覧から自動deck化時のCLS条件不足。
D-02：強制flat縮退時に消える操作buttonからfocus退避が未定義。

## 反映
D-01：docs/05末尾で自動化に実測条件を付け、成立しない場合は一覧初期表示＋明示「円環で見る」。opacityで隠す解法禁止。
D-02：操作群にfocusがある場合だけactive articleへ退避。本文/inputのfocusを奪わない。
docs/08へ両方の受入ケースを追加。

実アプリのrender、機能、性能、実機は未検証。将来のCodexタスクで必須。

## Second pass
同日、独立reviewerが修正後の実ファイルを再確認。
D-01/D-02は設計上解消、両件のblocking残件なし。
この結果は実装・ブラウザ動作のPASSを意味しない。
