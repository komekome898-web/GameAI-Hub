# Affiliate automation

`data/affiliate-programs.json` is the source of truth for affiliate program state.

## Status model

- `active`: approved and usable; requires an HTTPS `affiliateUrl`
- `pending`: application/review in progress
- `rejected`: application rejected
- `inactive`: referral/affiliate program unavailable or intentionally not used
- `unknown`: not yet verified

`npm run affiliate:sync` synchronizes every listed service into `data/services.json`:

- active + URL -> `affiliateAvailable: "yes"` and the referral URL
- rejected/inactive -> `affiliateAvailable: "no"` and `affiliateUrl: null`
- pending/unknown -> `affiliateAvailable: "unknown"` and `affiliateUrl: null`

The public CTA already falls back to `officialUrl` whenever no affiliate URL is active.

## Fastest owner workflow

For a newly approved program, open GitHub Actions -> **Register affiliate link** -> **Run workflow** and enter:

- `service`: existing service slug such as `scenario`
- `status`: `active`
- `affiliate_url`: approved HTTPS referral URL
- `network`: optional partner network name
- `approved_at`: optional `YYYY-MM-DD`

The workflow will:

1. update the central registry
2. synchronize `services.json`
3. run the full quality gate
4. commit to a dedicated `affiliate/update-<run>-<attempt>` branch only if validation succeeds
5. open a draft PR against `main`; independent review, exact-SHA checks and separate owner merge approval are required. The workflow never pushes main or merges.

For pending/rejected/inactive programs, run the same workflow with the matching status and leave the URL empty.

## Local/Codex usage

Codex can perform the same update without editing JSON manually:

```bash
AFFILIATE_SERVICE=scenario \
AFFILIATE_STATUS=active \
AFFILIATE_URL='https://example.com/ref' \
AFFILIATE_NETWORK='Example Network' \
npm run affiliate:set
npm run quality
```

Codex does not need to push or deploy. An explicitly authorized operator may complete branch/PR delivery if credentials or Actions PR creation are unavailable; report the blocker without changing repository settings.

## Rules

- Never invent affiliate URLs.
- Never mark a program active before approval.
- Affiliate status must not change editorial ranking or recommendation logic.
- Keep disclosure visible and continue GA4 `outbound_click` / `affiliate_click` tracking.
