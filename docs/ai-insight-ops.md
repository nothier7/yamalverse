# AI Insight Operations

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: existing Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: existing public read key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by the cron route to write ingested articles and generated insights.
- `CRON_SECRET`: bearer token required by `/api/cron/generate-home-insight`.
- `OPENAI_API_KEY`: OpenAI API key for scheduled generation.
- `OPENAI_MODEL`: optional model override. Defaults to `gpt-5.4-mini`.

## Supabase Setup

Run `supabase/migrations/202605030001_ai_insights.sql` against the Supabase project before enabling the cron job.

## Cron

`vercel.json` schedules `/api/cron/generate-home-insight` once daily at 08:00 UTC.

The route must receive:

```text
Authorization: Bearer <CRON_SECRET>
```

The public homepage never calls OpenAI or fetches live news. It reads the newest cached successful `home` insight and falls back to existing Yamalverse stats if no insight exists.
