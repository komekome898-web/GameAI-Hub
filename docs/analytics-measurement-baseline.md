# Growth funnel measurement baseline (Issue #58)

Scope: Measurement baseline only. This inventory distinguishes implementation availability from observation in GA4 or Search Console.

## Before-change audit (`origin/main` at `70352d0`)

| Funnel point | Status / exact name | Firing location and condition | Parameters | Duplicate / privacy / delivery / tests |
| --- | --- | --- | --- | --- |
| Page/article view | Partial: GA4 automatic `page_view`; no article-specific custom event | `GoogleAnalytics` config on Production; article routes had no explicit hook | GA4-managed page fields | Client navigation depended on GA4 history measurement; no custom-event test. Raw idea is excluded from shared URLs. `gtag` initialization exists. |
| Article → Project | Exists: `article_to_project` | `ArticleProjectCta`, on link click | `page`, `placement` | User action only; allowlist drops other keys; component and sanitizer tests; Production can use `gtag`, with `dataLayer` fallback. |
| Project start | Exists: `project_start` | `ProjectIdeaForm`, on valid form submit | `page`, optional validated `source` | User action only; raw idea is stored locally but not passed to `track`; component test; GA4/fallback capable. |
| Project generated | Naming gap: `project_generate` | Both confirmed-plan actions, immediately before/after plan state update | `game_type`, `budget` | User action only; no focused event-name/duplicate test; GA4/fallback capable. |
| First task viewed | Exists but generic: `project_task_viewed` | `BuildChecklist` effect after persisted progress loads and an active task exists | `task` | A ref suppresses rerender/Strict-effect repeats, but the same event also represented later active tasks; no focused test. Task id came from generated configuration; raw content excluded. |
| First task completed | Exists but generic: `project_task_completed` | Completion checkbox transition from incomplete to complete | `task` | Completion control is disabled until all done criteria (and non-beginner evidence) are satisfied. No rapid-repeat ref and no focused event test. |
| Second task reached | Exists: `project_second_task_reached` | Effect when first incomplete index becomes `1` | `task` | Ref suppresses rerender repeats; distinct from completion; no focused test. |
| Second task completed | Representable through `project_task_completed`, but no index | Same completion control | `task` | Could not reliably segment first vs second without mapping task IDs; no focused test. |
| Outbound click | Exists: `outbound_click` | Shared/service/article links on click | `service`, `page`, `placement`, optional `sub_id` | User action only; unit tests; Production `gtag` / `dataLayer` capable. |
| Affiliate click | Exists: `affiliate_click` | Immediately after `outbound_click` only when registry URL is affiliate | `service`, `page`, `placement`, `sub_id` | No URL payload; link and sanitizer tests; Production `gtag` / `dataLayer` capable. Service/stage/source dimensions were incomplete. |

The former sanitizer used per-event key allowlists, but any string value on an allowed key was accepted. Call sites did not pass raw ideas or code, yet value-shape enforcement was incomplete.

## After-change event map

| Event | Trigger | Allowed bounded parameters | Duplicate prevention |
| --- | --- | --- | --- |
| `article_view` | Article client mount | `article_slug`, `route_category=article` | Per-mount ref prevents effect rerender/Strict-effect repeats. Reload/new document is a new view. |
| `article_to_project` | Actual Project CTA click | route-only `page`; tokenized `placement`, `article_slug`, `cta_placement`, `source_context`; finite `route_category` | Click handler only. |
| `project_start` | Valid idea form submission | route-only `page`; validated slug `source`/`article_slug`; bounded context/category | Submit handler only; idea is never included. |
| `project_generated` | Successful standard or beginner plan generation | tokenized `game_type`, `budget`, validated source context | Generation action only, never a render effect. Replaces the pre-baseline `project_generate` name so one canonical generated event exists. |
| `first_task_viewed` | Persisted state has loaded and task index 0 is actually active | tokenized `task`; integer `task_index=0`; finite `task_stage`, context/category | Ref plus index guard prevents rerender/Strict-effect duplicates and prevents later tasks from masquerading as first-task views. |
| `task_completed` | Enabled completion control changes incomplete → complete | tokenized `task`; integer `task_index`; finite `task_stage`, context/category | Criteria gate remains authoritative; completion-event ref prevents repeat dispatch before state commit. Undo allows a later real re-completion event. |
| `next_task_reached` | First task completion causes task index 1 to become active | tokenized `task`; `task_index=1`; finite `task_stage`, context/category | Separate reached ref; not inferred merely from first completion. |
| `outbound_click` | Actual external-link click | legacy safe context plus `service_id`, finite stage/category/context and boolean `affiliate` | Click handler only. |
| `affiliate_click` | Same click, only when affiliate registry state is true | same bounded metadata as outbound; no URL | Existing name and ordering retained; no recommendation/ranking/task logic changed. |

`task_completed` with `task_index=1` is the second-task-completed signal. The finite stage categories are `setup`, `prototype`, `assets`, `audio`, `publish`, `verify`, and `other`.

## Privacy and transport guarantees

- Event-specific key allowlists remain mandatory.
- Token parameters accept only lowercase IDs (`[a-z0-9_-]`) with an 80-character ceiling; pages accept route paths only, never queries or full URLs; arrays/counts/indices are bounded; stages and route categories use finite sets.
- Raw game ideas, free text, HTML/code, prompts, trouble text, runtime errors, URLs/query strings, files, secrets, and personal data are neither supplied by funnel call sites nor accepted as funnel metadata.
- The `gameai:event` browser hook remains available for deterministic tests without real GA4 network calls.
- In Production, `track` calls `window.gtag` when available, otherwise queues the sanitized event in `window.dataLayer`; missing analytics never blocks the user action. Development/test keeps the event hook and uses a console diagnostic.
- GA4 measurement ID remains `G-B9Q283QVER`. Affiliate URL selection, disclosure, `rel`, ordering, scoring, and recommendations are unchanged.

## Observation status and remaining external gaps

Implementation and automated-event-hook evidence do not prove ingestion in the GA4 property. GA4 UI and Search Console require account access and are recorded separately during post-merge acceptance. Provider-side affiliate conversion/commission remains outside first-party click analytics.
