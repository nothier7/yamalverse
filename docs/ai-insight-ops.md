# AI Insight Operations

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: existing Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: existing public read key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by the cron route to store generated insights and private error records.
- `CRON_SECRET`: bearer token required by `/api/cron/generate-home-insight`.
- `OPENAI_API_KEY`: OpenAI API key for scheduled web search and generation.
- `OPENAI_MODEL`: optional model override. Defaults to `gpt-5.6`.

## Supabase Setup

The production schema is represented by:

- `supabase/migrations/202605030001_ai_insights.sql`
- `supabase/migrations/202607180001_ai_insight_news_freshness.sql`

The second migration was applied while Yamalverse used a separate news-discovery pipeline. Its additive `news_articles` columns remain harmless schema history, but daily insight generation no longer reads or writes that table.

## Daily Cron

`vercel.json` invokes `/api/cron/generate-home-insight` once daily at 08:00 UTC. Vercel sends the production `CRON_SECRET` as a bearer token, and the route rejects requests without an exact match:

```text
Authorization: Bearer <CRON_SECRET>
```

Do not create a second Supabase Cron schedule for this route. If the retired two-hour job still exists, remove it once:

```sql
select cron.unschedule(jobid)
from cron.job
where jobname = 'generate-home-insight-every-two-hours';
```

The route can be invoked manually for deployment verification with the same authorization header. It returns the stored insight ID, generation time, editorial angle, grounded source count, and homepage revalidation result.

## Generation Behavior

- The public homepage never calls OpenAI or performs live web searches.
- Each authorized cron run calls the OpenAI Responses API with required `web_search` tool use.
- OpenAI search is the only current-news and current-match authority for the insight. Local career and match tables are not included in the prompt.
- The prompt selects one timely angle: meaningful recent performance, significant upcoming-match context, or another material current development.
- Career-stat recaps and generic praise are rejected. Statistics are allowed only when they explain why a current event matters.
- Every declared evidence URL and displayed source must also exist in the actual OpenAI web-search response.
- Completed-match claims include normalized team scores and an outcome checked by the server before publication.
- A successful row expires after 30 hours and immediately revalidates `/`.

## Failure Behavior

A missing secret, OpenAI failure, missing search call, uncited source, invalid structured response, contradictory match result, rejected editorial result, or database failure returns a non-success response. The route stores a private error row when possible and leaves the last successful public insight untouched.

If no successful insight has ever been stored, the homepage displays a neutral generation-pending message. It does not create fallback copy from Yamalverse statistics.
