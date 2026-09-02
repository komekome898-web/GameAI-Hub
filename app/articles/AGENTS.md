# Article-specific Codex rules

These rules apply to files under `app/articles/` and complement the repository root `AGENTS.md`.

## Promotion disclosure

When an article contains affiliate or promotional links:

- Keep the required disclosure clear and visible, but minimal.
- Prefer one concise statement such as: `この記事にはプロモーションを含みます。`
- Do not repeat verbose explanations of referral fees, ranking neutrality, or affiliate mechanics inside the article unless a legal/compliance requirement specifically needs them.
- Do not hide the promotional nature of the content.
- Preserve `rel="sponsored nofollow noopener"` on affiliate links.
- Preserve affiliate click analytics and safe `sub_id` behavior.
- Affiliate status or payout must never affect recommendation ranking, scoring, or editorial conclusions.

## Deploy-safe article publishing

Every pushed commit on an open PR can trigger GitHub Actions and a Vercel Preview deployment. Therefore, never push an intermediate commit in which an article page and `data/articles.ts` disagree.

When adding, renaming, publishing, unpublishing, or deleting an article:

- Treat the article page file and its `data/articles.ts` registry record as one atomic change.
- Do not push a page that calls `getArticle('<slug>')` before the matching registry record exists in the same commit.
- Do not push a registry record for a published article before its route exists in the same commit.
- If multiple articles are being added together, stage all new page files plus the complete registry update and commit them together.
- When using Git locally, use one `git add`/commit for the complete article batch rather than checkpointing page files one by one.
- When editing through the GitHub API or another file-at-a-time interface, build one Git tree/commit containing all related article pages and the registry update, then move the branch ref once. Do not create a sequence of partial content commits on the PR branch.
- Documentation-only or unrelated safe follow-up commits may be separate after the article batch is internally consistent.
- Before pushing the article batch, verify every `getArticle('<slug>')` used by a page has a matching registry entry and every published registry entry has its intended page route.

Reason: partial article commits can make Next.js evaluate `articleMetadata(undefined)` during build, which causes GitHub E2E/quality and Vercel Preview failures even when a later commit would restore consistency. The branch must remain deployable after every pushed commit.
