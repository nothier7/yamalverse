# AI Insight News Freshness Design

## Goal

Make the homepage AI Insight reflect material Lamine Yamal news from the last few days instead of regenerating from an indefinitely reusable article pool. Keep discovery, storage, generation, and homepage rendering free of live user-request dependencies.

Success means:

- A newly published Yamal story from a trusted source can enter the next scheduled insight within two hours.
- Articles older than 72 hours cannot be presented as current news.
- Old match rows are explicitly marked as stale context and cannot be framed as Yamal's current form.
- Duplicate syndicated stories do not occupy multiple context slots.
- A source outage cannot silently produce a successful insight from old articles.
- The homepage is revalidated immediately after a new insight is stored.

## Chosen Approach

Three approaches were considered:

1. **GDELT discovery plus trusted-source policy and official-source preference.** This is the selected approach. It is free, requires no API key, returns fresh multilingual discovery metadata, and broadens coverage without binding the app to one publisher's markup.
2. **First-party sources only.** FC Barcelona, RFEF, FIFA, UEFA, and La Liga are authoritative but too narrow to provide a useful daily briefing by themselves.
3. **Hosted news APIs.** NewsAPI and GNews are easier to consume, but their free plans are restricted to development/testing and are unsuitable for the production site.

The selected design uses GDELT as a discovery index, not as an authority. Yamalverse applies its own domain policy, relevance checks, deduplication, freshness rules, and cautious-generation requirements.

## Scope

This change covers the existing homepage insight pipeline:

- GDELT article discovery.
- Source trust classification.
- Relevance filtering and story deduplication.
- Explicit discovery timestamps and strict freshness selection.
- Stale internal-match detection.
- Unchanged-input generation reuse.
- Higher-frequency scheduling through Supabase Cron.
- Immediate homepage cache invalidation.
- Operational diagnostics and automated tests for the new boundaries.

It does not add full article scraping, reproduce publisher text, replace the match-data ingestion system, or add a user-facing news archive.

## Source Policy

Sources are classified into two accepted tiers:

- `official`: FC Barcelona, RFEF, FIFA, UEFA, and La Liga domains.
- `trusted`: established outlets with consistent football reporting, initially AP, Reuters, BBC, ESPN, The Guardian, Sporting News, El País, Cadena SER, AS, Marca, Mundo Deportivo, and Sport.

All other domains are rejected from AI context by default. Adding a domain requires a code change so the policy remains reviewable.

Only metadata is stored:

- Headline.
- Canonical article URL.
- Publisher/domain.
- GDELT discovery timestamp.
- Publication timestamp when one is supplied by a permitted source.
- Language and source-country metadata.
- Match terms and a normalized story key.

GDELT's `seendate` is a discovery timestamp, not a guaranteed publication timestamp. It must be stored separately and must not be mislabeled as `published_at`.

## Data Model

Extend `news_articles` with:

- `discovered_at timestamptz`: when the upstream discovery index first observed the article.
- `story_key text`: a SHA-256 fingerprint of a normalized headline after publisher suffixes, punctuation, and repeated whitespace are removed.
- `source_tier text`: constrained to `official` or `trusted` for accepted rows.

Add indexes for freshness selection and story lookup. Existing rows remain valid historical data but are excluded from current context unless they satisfy the new timestamp and source-tier rules.

## Components

### `gdeltAdapter`

Fetch the GDELT DOC API with the exact phrase `"Lamine Yamal"`, a 72-hour window, newest-first ordering, and a bounded result count. Validate the response shape, normalize URLs, parse GDELT timestamps, and return metadata only.

### `newsPolicy`

Own all deterministic news decisions:

- Domain normalization and source-tier lookup.
- Required Yamal title terms.
- Tracking-parameter removal.
- Title normalization and story-key creation.
- Freshness checks.
- Source and recency scoring.
- Cross-domain duplicate removal.

Keeping these rules pure makes them directly testable without network or database access.

### `ingestNews`

Call the GDELT adapter, then filter and dedupe candidates before a Supabase upsert. Return operational details including fetched count, accepted count, stored count, rejected count, and errors.

If GDELT fails, ingestion fails the cron request. It must not continue into generation. A successful request with zero relevant candidates is not an outage; it can produce a limited-coverage insight without reusing stale news.

### `homeInsightContext`

Retrieve a bounded candidate set and apply a hard 72-hour cutoff using `published_at`, then `discovered_at`, then `ingested_at` as progressively weaker freshness signals. Return at most five unique stories, ordered by source tier and freshness.

Recent match context is evaluated separately. If the newest stored match is more than 14 days old, the prompt states that match data is stale and instructs the model not to describe it as current form or the latest sporting development.

### `generateHomeInsight`

Compute the input fingerprint before calling OpenAI. If the latest successful insight has the same fingerprint and remains unexpired, reuse it without another model call. Otherwise generate and store a new structured insight.

The prompt must:

- Treat only supplied, fresh articles as current news.
- Prefer official sources over trusted media when claims conflict.
- Require cautious language for injuries, transfers, and availability.
- Avoid presenting stale match context as current.
- Say coverage is limited when no fresh article passes policy.

The function returns whether the record was newly generated or reused so operations can distinguish both outcomes.

### Cron Route and Homepage Cache

The existing authenticated route remains the only generation entry point. After a newly generated insight is stored, it calls `revalidatePath('/')` so the homepage does not wait for its six-hour ISR window. Reused insights do not trigger revalidation.

The response includes ingestion diagnostics and the generated/reused state. Errors continue to be stored as private `ai_insights` error rows.

## Scheduling

Keep the Vercel daily cron as a fallback. Add a Supabase Cron job that invokes the authenticated production route every two hours. The site URL and bearer secret are stored in Supabase Vault and never committed.

The repository will include idempotent setup SQL and operations documentation. Applying the schedule to production remains an explicit deployment step because the secret must be supplied through Vault.

## Failure Handling

- GDELT timeout, rate limit, or invalid JSON: return a non-2xx cron response, store an error row, and keep the last valid public insight.
- Zero accepted fresh articles: generate a limited-coverage note from non-stale internal context; do not query older articles.
- Supabase article write failure: fail before generation.
- OpenAI failure or invalid structured output: store a private error row and keep the last valid insight.
- Homepage revalidation failure after a successful store: log it and return a diagnostic without deleting the stored insight.

## Testing

Use deterministic fixtures and tests for:

- GDELT response validation and timestamp parsing.
- URL canonicalization and tracking removal.
- Trusted-domain acceptance and unknown-domain rejection.
- Title relevance rules.
- Same-story deduplication across syndicated domains.
- 72-hour news freshness boundaries.
- 14-day match-staleness messaging.
- GDELT failure versus successful empty discovery.
- Same-fingerprint model-call reuse.
- Cron authentication and diagnostic response shape.

Verification also includes TypeScript checking, linting where supported by the current Next.js toolchain, a production build, and a fixture-based dry run that performs no production writes.

## Rollout

1. Deploy the schema and application changes, replacing the direct Sporting News scraper while retaining the daily Vercel cron as a fallback.
2. Run one authenticated manual generation and inspect accepted article metadata and the resulting insight.
3. Create the two-hour Supabase Cron job using Vault secrets.
4. Confirm run history and homepage revalidation.
5. Confirm Sporting News remains eligible as a trusted publisher through GDELT without relying on its page markup.
