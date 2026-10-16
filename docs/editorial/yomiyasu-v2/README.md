# yomiyasu v2.0.0 — site prose review

## Scope and preservation

Base: `c7013491dc46f2a316bb4a79094a21f3802041f0`. Dedicated branch `editorial/yomiyasu-v2-all-copy`; PR #113 and #186 are excluded. PR delivery is authorized; merge, production deployment, auth additions, billing and CI changes are not performed.

Reviewed article body/metadata, Home, category/list pages, guides, stacks, tool/service records, Project and Builder forms/prompts, FAQ/help, buttons, errors, empty states, alt/aria labels and shared navigation. Inventory covers 125 tracked source/text files, 89 with Japanese candidates, 5,243 candidate strings/fragments. This is a conservative source inventory, not a count of visible sentences or proof of every runtime state. Internal strings, code examples and quotes also appear; template expressions, concatenation, conditions and English-only UI were inspected in source context. Dynamic generated text is supported by existing unit tests and representative rendered journeys, not exhaustive combinatorial screenshots.

55 text candidates changed across 17 application/data source files. Clear short controls, alt labels, the Home description, privacy/legal/disclosure text, unknown conditions and most article prose remain unchanged. All 29 services were compared structurally; changes in 19 records only remove the redundant word in 「価格額は未登録です」. No current price verification is claimed. Author quotations, reconstructed conversation/history, third-party authored production story, source dates and past audit/progress records remain unchanged. No new facts were supplied.

## Representative changes

| Before | After | Preserved |
|---|---|---|
| 再読み込しても解決しない場合 | 再読み込みしても解決しない場合 | Failure condition and recovery target |
| analyticsへ送信されません / 外部ツールへのCTA | アクセス解析へ送信されません / 外部ツールへの案内ボタン | Negation and required-field visibility condition |
| 外観description（必須） | 見た目の説明（必須） | Required status; generated prompt label updated consistently |
| 不足素材には契約を与える | 不足素材の仕様と差し替え箇所を決める | Existing deliverables and replacement boundary |
| 概要の説明をAPIリクエストの上限なしとは解釈せず、この10個の制限をUIやモデル全体の上限とも扱いません。 | 概要の説明を、APIリクエストにも上限がないという意味では解釈しません。また、この10個の制限をUIやモデル全体の上限とも扱いません。 | Both negations, 10-ID limit and API/UI/model scopes |

All actual candidate differences are in `changes.json`; source/final files and hashes are in `inventory.json`. `source.md` and `final.md` retain the extracted manuscripts, not generated TSX. No corpus text is written back automatically.

## Checks and exact correspondence

- Official tag v2.0.0 pins upstream commit `b8ddf6e5c044d7a3e24ae5db64852465e7bd6cd3`. Scripts/references/MIT and Unicode notices retain upstream bytes; provenance hashes in `.agents/skills/yomiyasu/UPSTREAM.md`.
- Independent source-safety reviewer inspected the four Python scripts before execution. Standard library only; no model/network/dependency installation. check writes only its explicitly selected temporary state directory; no hooks enabled.
- Original lint executed. Initial combined 338,866-character corpus diff hit the upstream 90-second timeout. Recovered by checking every source candidate in 187 source-aligned shards of at most 40 entries. All 187 `run` and all 187 `verify` executions completed (`executed`). Full-corpus timeout is not presented as a passed check.
- `checks.json` preserves executed status lines, shard mapping, final hashes and candidates; `shards.json` maps ranges. Per-shard lint candidates: source 313 / final 313. Counts depend on document boundaries and are review hints, not quality or acceptance scores.
- One meaning-risk candidate: 「決定論的な一致です」→「決まったルールでどれだけ一致するかを示します」 flagged the added ending 「示します」. Independent human comparison retained the deterministic-match explanation and following quality/popularity/legal exclusions; no new promise or condition was introduced. No numeric/negation/hedge alteration was reported by the tool. A zero flag would not establish meaning preservation.
- Final source was re-extracted and compared byte-for-byte with checked shard manuscripts and retained `final.md`. Each retained file hash is recorded; no application text changed after checks.
- `npm run quality`: PASS including lint, typecheck, 50 Vitest files / 386 tests, data/affiliate/sitemap/content validators, 76 Python orchestration tests and workflow validation. Three original exact-copy assertions were updated to the revised Japanese labels and inspection wording without removing checks. Workflow validator initially lacked Ruby; Debian Ruby 3.3.8 runtime was extracted under `/tmp` and used through temporary PATH, without repository/dependency/CI/auth changes; full quality then passed.
- `npm run build`: PASS. Targeted Playwright run rebuilt final source with production settings and passed 6 existing tests covering exact idea/Home attribution, mobile-menu focus/navigation and seven-route overflow at 320/375/390/1440. Logs: `quality.txt`, `build.txt`, `e2e.txt`.

Reproduce locally (requires existing Node dependencies and Python):

```bash
bash scripts/editorial-copy-check.sh c7013491dc46f2a316bb4a79094a21f3802041f0 /tmp/gameai-yomiyasu-recheck
```

The script calls check through CLI and uses temporary snapshots only. Fresh records have new run IDs; compare manuscript hashes, not timestamps. Human source-context and semantic review remain required.

## Independent acceptance and limits

Independent agents `review_scope` and `article_copy_audit` performed read-only source/meaning reviews, compared protected fields and inspected actual rendered screenshots. No P0/P1 or remaining introduced high-impact P2 was found. Review identified a Home heading that incorrectly narrowed mixed article/game categories to articles; the edit was reverted to main before final checks. Meaning review covers the final application diff from the stated base; reviewer source fingerprints are recorded in the handoff.

Local Chromium evidence in `docs/screenshots/yomiyasu-v2/manifest.json`: 12 representative routes at 1280/375/320 (36 default screenshots), three 320px CSS-200% stress screenshots, four additional changed-paragraph screenshots, and 108 successful internal-link GETs. Normal viewport captures have no document overflow. Separate clean changed-paragraph captures disable smooth scrolling and blur focus; earlier masked captures were rejected during independent review. Shared controls, warning/empty-state logic and prompt conditions additionally have existing unit coverage.

Known existing limitation: Home at viewport320 with CSS zoom2 has 8px horizontal overflow and narrow brand/navigation wrapping. Home, Header and CSS are byte-identical to main; this is not fixed in a prose-only PR. It is not marked PASS. Genuine accessibility text zoom, WebKit, physical iPhone/Android interactions and exhaustive runtime/error states are UNTESTED. Other 320 CSS-200% sampled routes had zero document overflow; CSS zoom is not native text zoom or physical-device acceptance.

Production was not visited or deployed. Local analytics requests were blocked by guard (0 attempted); production settings were exercised by targeted E2E's build. If production review is later authorized, first visit `/privacy/?gameai_analytics=off` and verify measurement exclusion. No merge/publication occurred.
