# 04 現行コンポーネント → Visual Layer v2

現行codeはNext16.3.2 / React19.2.4 / plain globals.css。新UI framework・Three.js・GSAPは不要。
新しいCSSを全てglobal selectorで上書きする方式は避け、追加するroute modifier/data属性で段階的に有効化する。
既存globals.cssには旧dark→light→Issue137の複数層がある。冒頭のrootだけを編集せずcomputed styleと末尾の契約を確認する。

|現行実体|付与する表現|保持するもの|
|app/globals.css|専用--v2-* tokens、必要なscoped rule|既存responsive/layout/scroll owner/focusルール|
|components/Header.tsx / .site-header|不透明な薄いivory境界|brand SVG/副表記/日本語nav/CTA/dialog/inert/focus|
|app/layout.tsx内.site-footer|flat canvas、細いseparator|3群の全link、GoogleAnalytics配置、metadata/font|
|app/page.tsx .home-execution-hero|atrium＋入力working plane|H1/ProjectIdeaForm、firstviewport、下部節順|
|.home-output-cue / .home-task-preview|recessed補助面|文字による成果説明、実例の意図|
|ProjectGeneratorClient ProjectIdeaForm|ラベル付きflat fieldと低いframe|validation/入力例/privacy/submit/intent|
|ProjectGeneratorClient .project-result-top|低いcontext面|projectName/条件/notice/実progress|
|BuildChecklist .beginner-action|raised working plane|current taskの優先順位/anchor/分岐|
|.action-prompt / .beginner-workspace-panel|flat inset領域|copy status、details、workspace順序|
|BeginnerGameWorkspace|薄いinset frame|HTML入力、preview sandbox/CSP、save/load、error/実行の現行実装|
|.beginner-action-buttons / .stuck-panel|押下可能な操作とrecovery|完了条件のgateとfocus、実状態|
|.today-queue / .build-roadmap / .artifact-progress|背景寄りのseparator|既存文字/進捗/リンク。低contrastにしない|
|ToolsExplorer .goal-groups / .active-filter-summary|working context tray|fieldset/legend/選択/URL/解除|
|.tool-rows|flat evidence rows|全provider同じ規則/現行sort/official evidence|
|CompareClient .compare-selection-tray|低いceramic tray|候補名/削除/件数/long wrap|
|.compare-criteria-groups / .compare-scroll|flat criteria / semantic table|mobile/desktop分岐/差分/見出し/出典|
|app/articles/page.tsx .article-cluster-list|startだけCreationDeckに漸進拡張|groups/slugs/getArticleの順番と全meta|
|ArticleFrame / ArticleHeader|外周だけcanvas、本文白|JSON-LD/breadcrumbs/meta/disclosure|
|ArticleReadingGuide|flat目次|.article-content直下.page-headとsection>h2探索、portal mount、hash|
|ArticleProjectCta|薄いworking edge|source query/track/event/同じゲームへの導線|
|ArticleAffiliateCtas|既存plain commercial案内|portal探索位置/広告開示/rel/impression/URL fallback|
|components/ui/Foundation.tsx|既存actionClass/Field等の外観|aria-describedby/error/live/ScrollRegion/CodeBlock/table semantics|

## 新規ファイル候補（実装タスクで作成）
- `app/visual-layer-v2.css`：scoped CSS。globalsより後に読み、影響範囲を明示。
- `components/CreationDeck.tsx`：狭いclient island。全pageをuse clientにしない。
- `lib/article-visuals.ts`：slug→asset相対pathだけ。title/date/rank/priceのコピーを置かない。
- `public/visual-v2/`：配信するWebP/SVGのみ。PNG原本とreferenceはpublicに置かない。
- `docs/design/visual-layer-v2/`：採用仕様/変更理由/asset manifest。
- `docs/codex-progress/visual-layer-v2.md`：slice、exact SHA、check、証拠、残件。

## 統合上の落とし穴
ArticleReadingGuideは直接子selectorを用いる。記事headerやsectionの周りにdecorative divを追加しない。
ArticleAffiliateCtasにもDOM依存探索がある。本文外枠に疑似要素かCSS背景を使い、mount順を変えない。
Headerやmain全体の祖先にtransform/filter/perspectiveを適用しない。fixed dialog・sticky・focusを壊す。
overflow:hiddenをbody/mainに追加して横overflowを隠さない。carouselのstage内部だけclipし、focus paddingを確保する。
CSSのbaseを@layerへ入れる場合は既存unlayered ruleが優先することに注意。単純な追記合戦ではなくscoped selectorを整理する。
