# Eight-Hour AI Insight and Official Honours Design

## Problem

Yamalverse currently generates one homepage AI insight per day at 08:00 UTC. A major event can therefore make the published insight incorrect or outdated for many hours. The first manual post-final refresh also exposed a second reliability issue: OpenAI returned a real FC Barcelona URL in its structured output, but that exact URL was not present in the web-search tool's returned sources. The server correctly rejected the response, but it did not retry, so the stale insight remained public.

The honours page is also manually curated and is missing major official achievements from 2025/26 and the 2026 FIFA World Cup.

## Goals

- Generate a web-grounded homepage insight every eight hours: 00:00, 08:00, and 16:00 UTC.
- Keep a protected manual refresh path for important breaking events.
- Retry one time when OpenAI returns an invalid structured response or an ungrounded citation without weakening the existing source and match-result validation.
- Make delayed refreshes visible instead of presenting an old insight as current.
- Update team and individual honours using major official competition, governing-body, league, or players' union sources.
- Keep the homepage and honours page static with respect to OpenAI; only the protected background endpoint performs generation.

## Non-Goals

- Automatically generate or edit honours with AI.
- Include monthly awards, fan-voted club awards, Globe Soccer awards, or minor media awards.
- Accept a URL merely because it resolves successfully or belongs to a trusted domain.
- Replace the current OpenAI web-search grounding and match-result safety checks.
- Create a public, unauthenticated refresh button.

## Scheduler

The desired schedule is every eight hours, expressed as `0 */8 * * *`. This runs at 00:00, 08:00, and 16:00 UTC.

Vercel Cron remains the preferred scheduler because the protected route is already deployed there and Vercel automatically supplies the production `CRON_SECRET`. Vercel Hobby projects only permit one cron execution per day, so implementation must use this deterministic selection rule:

1. If the linked Vercel team supports more-than-daily cron schedules, update `vercel.json` to `0 */8 * * *` and retain Vercel as the only scheduler.
2. If deployment validation reports the Hobby once-daily restriction, remove the Vercel cron entry and add one GitHub Actions workflow with both `schedule: 0 */8 * * *` and `workflow_dispatch`. The repository secret named `CRON_SECRET` must equal the Vercel production value. The workflow calls the same production endpoint with the bearer header.

Exactly one automatic scheduler may be active. This prevents four daily generations, duplicate cost, and races.

## Manual Refresh

The existing protected route remains the only manual trigger:

```bash
cd /Users/ThiernoDiallo/Documents/Projects/yamalverse
set -a
source .env
set +a
curl -sS \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://www.yamalverse.com/api/cron/generate-home-insight
```

The shell expands `$CRON_SECRET` from `.env`; the user does not replace it in the command. A valid secret reaches generation, while a missing or incorrect secret returns HTTP 401.

## Generation and Retry Flow

`generateAndStoreHomeInsight` will make at most two OpenAI Responses API attempts for one trigger.

1. Attempt one uses the normal editorial prompt and required `web_search` tool.
2. The existing parser validates structured output, actual web-search use, exact source grounding, evidence coverage, editorial quality, and normalized match outcomes.
3. If response parsing or validation fails, attempt two performs a completely new OpenAI request and new web search. Its prompt includes a short correction instruction derived from the failure category. It explicitly prohibits guessed, reconstructed, redirected, or manually typed URLs and requires copying exact URLs returned by that attempt's web search.
4. The correction prompt does not include sensitive data, the rejected URL, or raw provider output.
5. The same unchanged strict validator evaluates attempt two.

Missing environment variables, OpenAI authentication failures, database failures, and homepage revalidation failures do not cause a second generation attempt. HTTP rate limits or provider failures remain visible operational errors rather than producing an uncontrolled retry.

If both validation attempts fail, the route stores its existing private error record and preserves the last successful public insight. The JSON response will include `attemptCount` on success so manual and scheduled operations can confirm whether recovery was needed.

## Freshness Behavior

Successful insights expire after 12 hours instead of 30. Under an eight-hour schedule this leaves a four-hour grace period for a delayed or failed invocation.

The homepage continues to display the last successful insight, even after expiry, because verified older information is preferable to an empty card. When `isStale` is true, the card must visibly say `Refresh delayed` beside the original update time. It must not call the content current or live. A successful generation immediately revalidates `/` and clears the delayed state through the new row.

## Official Honours Data

Honours will move from inline arrays in the client component to a small typed data module. Each entry includes its title, count, seasons, category, and an official provenance URL. Provenance is maintained for review and tests; this change does not require a visual redesign.

### Team updates

- La Liga: change from two to three titles and add `2025/26`.
- FIFA World Cup: add one title for `2026`.
- Retain Copa del Rey (`2024/25`), Spanish Super Cup (`2024/25`, `2025/26`), and UEFA EURO (`2024`).

### Individual updates

- Add La Liga Player of the Season for `2025/26`.
- Add the Zarra Trophy for `2025/26`.
- Add FIFPRO Men's World 11 for `2025`.
- Correct `UEFA EURO Young PLayer of the Tournament` to `UEFA EURO Young Player of the Tournament`.
- Retain the existing verified major awards. The 2024 Best FIFA Men's 11 entry remains separate from the 2025 FIFPRO Men's World 11 because they are distinct honours.

Primary provenance:

- FIFA World Cup final: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights
- FC Barcelona player honours: https://www.fcbarcelona.com/en/football/first-team/squad/129404/lamine-yamal
- La Liga Player of the Season: https://www.laliga.com/en-GB/news/lamine-yamal-ea-sports-laliga-player-of-the-season-2025-2026
- Zarra Trophy: https://www.fcbarcelona.com/en/football/first-team/news/4509422/lamine-yamal-and-ferran-torres-win-zarra-trophy
- FIFPRO Men's World 11: https://www.fifpro.org/en/articles/2025/11/who-is-in-the-2025-fifpro-men-s-world-11

## Data Flow

```text
Vercel Cron or GitHub Actions (one only) / manual curl
  -> authenticated GET /api/cron/generate-home-insight
  -> OpenAI web search + structured response
  -> strict validation
     -> valid: store success, revalidate homepage
     -> invalid: one fresh corrective attempt
        -> valid: store success, revalidate homepage
        -> invalid: store private error, preserve prior success
```

The honours page reads typed static data during the normal Next.js render path and never calls OpenAI.

## Security and Cost Controls

- `CRON_SECRET`, the OpenAI key, and the Supabase service key remain server-only.
- The manual command loads the secret locally without printing it.
- Scheduled operation normally makes three OpenAI calls per day.
- A validation retry can raise the maximum to six scheduled calls on a day when all first attempts fail. Manual invocations are additional and intentional.
- No source-validation bypass, trusted-domain shortcut, or reachable-URL exception is allowed.

## Verification

- Unit-test a first-attempt grounding failure followed by a valid second attempt.
- Unit-test that two invalid attempts store no successful insight and return an error.
- Retain the source-mismatch and reversed-score validator tests.
- Unit-test the official honours counts, seasons, categories, and provenance URLs.
- Verify the scheduler configuration produces exactly 00:00, 08:00, and 16:00 UTC and that no second scheduler remains active.
- Run the project test suite, TypeScript check, production build, and staged-diff checks.
- Deploy to production, trigger one authenticated manual refresh, require an HTTP 200 response with `ok: true`, and confirm the production homepage shows a post-final World Cup insight with grounded sources.
- Inspect `/honours` in production and confirm the third La Liga title, 2026 World Cup, and new official individual awards render under the correct tabs.

## Rollout and Failure Recovery

Deployment changes the schedule but does not delete prior successful insights. Immediately after deployment, one manual production invocation refreshes the currently stale pre-final content. If the invocation fails both validation attempts, the public site retains the last successful row and displays its delayed state after 12 hours. Runtime logs and the private error row provide the failure reason without exposing it publicly.
