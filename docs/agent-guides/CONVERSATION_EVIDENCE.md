# Conversation Evidence — 記事内の会話記録コンポーネント

`components/ConversationEvidence.tsx` は、実際に行われた人間（オーナー）と AI（Fable 5.1 / Claude Code）の
やり取りを、記事本文の中に「研究記録」として置くためのコンポーネント。

通常の `blockquote` と使い分ける。

| 使うもの | 用途 |
|---|---|
| `blockquote` | 一方向の引用。誰の発言かが1人で足りる場合 |
| `ConversationEvidence` | 話者が交代する記録。誰がいつ何を言い、その結果どう結論が動いたかを読ませたい場合 |

## 1. 設計の前提

- 左右振り分けの吹き出し（LINE / Messenger 型）にはしない。話者ラベル付きの**縦一列の台帳**として積む。
- Claude / Claude Code のチャット UI をそのまま複製しない。GameAI Hub の editorial component として成立させる。
- カード自体が主役にならないこと。長文記事を読み進めるための visual break として機能させる。
- 紫のグラデーション、発光、強い影は使わない。CSS ブロックには `gradient` / `box-shadow` / `transition` /
  `animation` を一切含めない（`tests/conversation-evidence.test.tsx` で検査している）。

## 2. 話者バリアント

| variant | 常時表示ラベル | 補助ラベル | 左罫 | 面 | バッジ |
|---|---|---|---|---|---|
| `owner` | `OWNER` | `オーナー（人間）` | `#5f827b` | `var(--bg-soft)` | `var(--panel)` + `#22443f` |
| `fable` | `FABLE 5.1` | `Claude Code` | `#b0623a` | `var(--panel)` | `#f5ebe4` + `#7a3a12` |

- 暖色（左罫 `#b0623a`、バッジ `#f5ebe4` + `#7a3a12`）は AI 側だけに、面積を絞って使う。
- **一次アクションの色は使わない。** `.header-cta`（`#d65a20` / `#fff7f2` / `#b9410d`）と `.notice`
  （`#edbfa9` / `#fff6f1` / `#8c3c17`）が「細い暖色枠 + ほぼ白の暖色地 + 濃いオレンジ文字」を既に占めている。
  話者バッジは枠を `var(--line)` に、角を 4px にして、ボタンにも警告にも見えないようにしている。
  テストで `#ea580c` / `#d65a20` / `#c2410c` の混入を検査する。
- `--accent`（teal）は構造と見出しに予約。会話カードのアイブローだけが `--accent-strong` を使う。
- OWNER の面は `--bg-soft`。カード頭と注記の `--panel-2` とは別の値にして、
  OWNER が先頭に来ても頭と発言が地続きに見えないようにしている。

## 3. アクセシビリティ

- 話者は**色だけで判別させない**。`OWNER` / `FABLE 5.1` のラベルと補助ラベルを常時表示し、左罫と面差は補助。
  同じ話者が連続する場合もバッジは毎回出る。
- 各発言の先頭に `.sr-only` の前置き（「発言者は人間のオーナー、」/「発言者はAI、」）を置くので、
  スクリーンリーダーは本文より先に話者を読む。`aria-hidden` は使わない（見えるものと読まれるものを一致させる）。
- `<figure>` + `<figcaption>` + `<ol>` / `<li>`。会話は順序のあるリストなので `ol`。
  `list-style:none` は Safari でリストの意味論を落とすため `role="list"` を明示する
  （jsdom は CSS を見ないので、単体テストだけではこの点の証拠にならない）。
- ラテン文字だけのラベル（`OWNER` / `FABLE 5.1` / `Claude Code` / アイブロー）に `lang="en"` を付け、
  日本語音声で英語綴りを読ませない。日本語ラベルを渡した場合は付かない。
- 見出しは `headingLevel`（2/3/4、既定 3）で記事の階層に合わせる。`aria-labelledby` で figure に結びつく。
  サイト全体では `h1,h2` が明朝 760 になるため、カード見出しは font-family / weight / letter-spacing を
  自前で固定し、階層を変えても字面が変わらないようにしている。
- 本文コントラストは 4.5:1 以上（OWNER 面上で 本文 10.6:1 / `--muted` 5.0:1 / リンク 4.9:1、
  バッジ OWNER 10.7:1 / FABLE 7.3:1）。
- 選択可能なテキストのみ。hover 前提の情報は無い。アニメーションが無いので reduced-motion で失われる情報も無い。

## 4. レスポンシブ

- 記事本文の測り幅を超えない（幅 100%、`max-width:100%`、`min-width:0`）。
- 側パディング: 18–20px → 680px 以下で 13–14px → 400px 以下で 10–11px。
- 本文は全幅で 16px を下回らない。ラベル類は 12.5–12.8px。
- 長い URL・英単語・数値・コードは `overflow-wrap:anywhere` + `word-break:break-word` で折り返す。
- 発言の印（`marker`）は話者ラベルの隣に細い罫で区切って置く。920px の行で右端まで飛ばさない。
  400px 以下では話者ラベルの下に単独行で落とす。
- コードブロックの見た目は記事側の `article.page-shell pre` に従う（他の記事のコード表示と揃える）。
  400px 以下だけ内側パディングを詰める。

## 4-1. カードの長さ（重要）

カードは記事の visual break であって、記事そのものではない。320px では 5 発言のカードで約 1,850px
＝スマートフォンの 3 画面弱になる。長さの見当がつくよう、カード頭に `発言 N 件` を常時表示している。

- **1 カードは 3〜5 発言まで。** それを超える会話は、論点ごとに複数カードへ分け、それぞれに `title` を付けて
  間に本文の地の文を挟む。
- 会話を `<details>` で畳むことはしない。証跡を既定で隠すとコンポーネントの目的（記録を読ませる）と矛盾し、
  テキスト選択・検索・印刷も壊れるため。長さの制御は分割で行う。

## 5. 使い方

```tsx
import { ConversationEvidence } from '@/components/ConversationEvidence';

<ConversationEvidence
  title="AUC 0.82 と「実運用では使えない」が同時に出たとき"
  context="前兆の検出力を、運用時の警報回数に翻訳しようとした場面。数値はどちらも正しく計算されていた。"
  source={{label:'docs/POSTMORTEM_2026-09-04_tp_precursor.md'}}
  recordedAt="2026-09-04"
  turns={[
    {speaker:'fable',marker:'第2段の設計',body:<p>AUC 0.82 は「バースト前と静かな時を並べれば見分けられる」という意味です。</p>},
    {speaker:'owner',marker:'第1の指摘',body:<p>なぜ絶対水準で評価したのかわかりません。</p>},
  ]}
  annotation={{question:'この時点で何が間違っていた？',answer:<p>元の研究と実運用評価で、対象となる母集団が変わっていた。</p>}}
/>
```

### props

| prop | 必須 | 内容 |
|---|---|---|
| `title` | ○ | 何のやり取りかを一文で。figure の見出しになる |
| `source` | ○ | `{label, href?}`。引用元の記録。`href` を付けると `↗` と「新しいタブで開く」が付く |
| `recordedAt` | ○ | `YYYY-MM-DD`。`<time>` で出力 |
| `turns` | ○ | `{speaker:'owner'\|'fable', marker?, body}` の配列。空配列なら何も描画しない |
| `id` | | 同じ `title` のカードを1ページに複数置く場合の明示 id |
| `headingLevel` | | `2` / `3` / `4`。既定 `3`。字面は変わらない |
| `label` | | アイブロー。既定 `CONVERSATION EVIDENCE` |
| `context` | | 会話の前提を短く。要旨・抜粋であることの断りにも使う |
| `annotation` | | `{label?, question?, answer}`。既定ラベルは `RESEARCH NOTE` |

`source` と `recordedAt` は必須。出典と日付のない「証跡」を型で作れないようにしている
（AGENTS.md §4 source transparency / §10 verified sources）。
`turns` が空のときは何も描画しない — データ側の取り違えが無言のコンテンツ欠落になるので、
記事を追加したら必ずレンダリングを確認すること。

`body` と `annotation.answer` は `ReactNode`。`<p>` / `<ul>` / `<code>` / `<pre>` をそのまま渡せる。

## 6. 編集上の規律

- **逐語を変えない。** 要約する場合は `context` にその旨を書く（例: 「長い議論の要旨」）。
  発言を短くするために意味を変えない。
- **AI の自己申告を事実として書かない。** AI が自分の限界や原因を語った箇所は、`context` か `annotation` で
  「AI 側の自己申告であり、第三者の検証を経た事実ではない」と明示する（AGENTS.md §4 factual integrity）。
- `annotation` は警告ではない。「何が間違っていたか」を静かに置く研究ノートとして書く。
  煽り、断定的な優劣、未検証の一般化を書かない。
- 引用元は `source` に実在するパス／URL を書く。確認できない出典は載せない。

## 7. 検証

- 単体: `tests/conversation-evidence.test.tsx`（意味付け・話者ラベル・注記の任意性・CSS 禁止事項）
- レンダリング証跡: `docs/screenshots/conversation-evidence/`
  - `card*-*.png` … カード単体。5 ケース（通常 / 要旨 / 短い記録 / 長トークン耐性 / 同一話者連続）
  - `context-*.png` … 記事の地の文の中に置いた状態（本文からの浮き方を見る用）
  - 幅: 1280 / 768 / 480 / 375 / 320 / 160（= 320px を 200% 拡大したときのレイアウト等価幅）
- document 横オーバーフロー実測（ビルド済みアプリ、全カード同一ページ）:

  | 幅 | document overflow | はみ出し要素 |
  |---|---|---|
  | 1280 / 768 / 480 / 375 / 320 / 160 px | 0px | 0 件 |

- 実機（iPhone / Android の実タッチ、OS の文字拡大、長押し選択）は **UNTESTED**。
  上記はビューポート再現による responsive の証跡であり、実機受け入れではない。

## 8. 既知の制限

- コードブロックの見た目は `article.page-shell pre` に依存する。記事シェルの外で使うと
  背景・パディング・コードチップの体裁が外れる（400px 以下の内側パディングだけ自前で持っている）。
- 同一ページに同じ `title` のカードを複数置く場合は `id` を明示する（既定 id は title のハッシュ）。
- ページ全体の測り幅は `.article-shell{max-width:900px}` に従う。日本語としてはやや長い行になるが、
  これはサイト共通の設定であり、このコンポーネントの範囲では変更しない。
