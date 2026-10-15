# 実装受入の記録テンプレート

- base SHA:
- tested head SHA:
- branch / PR:
- environment / browser / versions:
- local / Preview / Production（別判定）:
- viewport / zoom / physical device:
- before/after screenshots path:

|route/state|320|375|390|desktop|keyboard|機能|証拠|
|---|---|---|---|---|---|---|---|
|Home初期/入力/error|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|Project入力/条件/制作/回復/完了|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|Tools通常/filter/empty|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|Compare0〜4/差分/unknown|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|記事hub/list/deck/JSなし|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|記事how-to/実践/商用/料金|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||
|Header/メニュー/Footer/trust|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED|UNTESTED||

## 独立レビュー
reviewer / finding ID / severity / route / evidence / fix commit / second-pass evidence / status。
P0/P1/high-impact P2が0になるまで未完了。物理実機/GA4受信は別記。

## 性能
同条件のbaselineとafter：追加JS gzip / CSS gzip / 初期asset転送量 / LCP / CLS / 操作long task。
画像原本サイズをWeb転送量に混ぜない。cache状態と端末/CPU設定も記録。
