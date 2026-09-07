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

| variant | 常時表示ラベル | 補助ラベル | 左罫 | 面 |
|---|---|---|---|---|
| `owner` | `OWNER` | `オーナー（人間）` | `#6f8f89` | `#f4f8f7` |
| `fable` | `FABLE 5.1` | `Claude Code` | `#c2652f` | `var(--panel)` |

暖色（`#c2652f` / バッジ `#fcf1e9` + `#8a3f14`）は AI 側だけに、面積を絞って使う。
`--accent`（teal）は構造と見出しに、`#ea580c`（CTA オレンジ）は一次アクションに予約されているので、
会話カードでは使わない。

## 3. アクセシビリティ

- 話者は**色だけで判別させない**。`OWNER` / `FABLE 5.1` のラベルと補助ラベルを常時表示し、左罫と面差は補助。
- 各発言の先頭に `.sr-only` の前置き（「発言者は人間のオーナー、」/「発言者はAI、」）を置くので、
  スクリーンリーダーは本文より先に話者を読む。`aria-hidden` は使わない（見えるものと読まれるものを一致させる）。
- `<figure>` + `<figcaption>` + `<ol>` / `<li>`。会話は順序のあるリストなので `ol`。
- 見出しは `headingLevel`（2/3/4、既定 3）で記事の階層に合わせる。`aria-labelledby` で figure に結びつく。
- 本文コントラストは 4.5:1 以上（本文 11.3:1、`--muted` の meta 5.4:1、バッジ OWNER 7.7:1 / FABLE 6.7:1）。
- 選択可能なテキストのみ。hover 前提の情報は無い。アニメーションが無いので reduced-motion で失われる情報も無い。

## 4. レスポンシブ

- 記事本文の測り幅を超えない（幅 100%、`max-width:100%`、`min-width:0`）。
- 側パディング: 18–20px → 680px 以下で 13–14px → 400px 以下で 10–11px。
- 本文は全幅で 16px を下回らない。ラベル類は 12.5–12.8px。
- 長い URL・英単語・数値・コードは `overflow-wrap:anywhere` + `word-break:break-word` で折り返す。
  320px でも document 横スクロールを起こさない（`docs/screenshots/conversation-evidence/` に実測の証跡）。
- コードブロックの見た目は記事側の `article.page-shell pre` に従う（他の記事のコード表示と揃える）。
  400px 以下だけ内側パディングを詰める。

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
| `turns` | ○ | `{speaker:'owner'\|'fable', marker?, body}` の配列。空配列なら何も描画しない |
| `headingLevel` | | `2` / `3` / `4`。既定 `3` |
| `label` | | アイブロー。既定 `CONVERSATION EVIDENCE` |
| `context` | | 会話の前提を短く。要旨・抜粋であることの断りにも使う |
| `source` | | `{label, href?}`。引用元の記録 |
| `recordedAt` | | `YYYY-MM-DD`。`<time>` で出力 |
| `annotation` | | `{label?, question?, answer}`。既定ラベルは `RESEARCH NOTE` |

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
  （1280 / 768 / 375 / 320px、長い URL・英単語・数値・コードの耐性ケースを含む）
- 320px での document 横オーバーフロー: 実測 0px、はみ出し要素 0 件。
- 実機（iPhone / Android の実タッチ・文字拡大）は UNTESTED。
