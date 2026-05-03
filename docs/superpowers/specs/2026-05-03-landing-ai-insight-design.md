# Landing Page AI Insight Design

## Goal

Add a landing-page-only AI Insight section that gives visitors a fresh, concise read on what matters for Lamine Yamal right now. The first version should combine Yamalverse stats, curated documentation/context, and recent news from a small controlled source list. The section appears before all other homepage content.

## Scope

Version 1 covers only the landing page. It does not add page-specific insights to dribbles, per-90, opponents, records, or other sections yet. The implementation should create reusable ingestion and generation boundaries so future pages can adopt the same system without redesigning the pipeline.

## User Experience

The homepage shows an AI Insight card as the first visible content section. It should appear above the career overview, recent form, and season snapshot.

The card contains:

- A short generated headline.
- A concise summary paragraph.
- Two or three bullets explaining the key current signals.
- Source links used for recent news context.
- A last-updated timestamp and freshness label.

If no valid AI insight exists, the page still renders a deterministic fallback based on existing Yamalverse stats and recent-match data. If the latest generated insight is stale, the UI can show it with a clear stale/freshness label rather than removing the section.

## Architecture

Use a cached-generation architecture:

1. A scheduled Vercel Cron route runs once or twice daily.
2. The cron route calls source adapters for curated news sources.
3. Source adapters extract article metadata from known pages.
4. A filter keeps only entries mentioning Lamine Yamal or approved variants.
5. New articles are deduped and stored in Supabase.
6. The generator retrieves relevant news, internal stats, and docs/RAG context.
7. The AI model generates one homepage insight.
8. The generated insight is stored in Supabase.
9. The landing page reads the latest cached insight.

This avoids user-triggered scraping or AI calls during page loads.

## News Source Strategy

The first curated source is Sporting News Barcelona News:

`https://www.sportingnews.com/us/soccer/barcelona/news`

This page is a reasonable v1 candidate because it is already narrowed to Barcelona coverage and includes Yamal-relevant articles. The adapter should be defensive because page markup can change.

The adapter should extract only article metadata needed for context and citation:

- Title.
- URL.
- Author if available.
- Published date if available.
- Short excerpt or page-provided summary if available.
- Source name.
- Ingestion timestamp.

The system should not reproduce full article text. It should cite source URLs and summarize only from stored metadata/excerpts unless future source permissions allow deeper extraction.

## RAG And Internal Context

The insight should use three context classes:

- Recent news articles from curated sources.
- Current Yamalverse stats from Supabase, such as all-time career stats and recent matches already used by the homepage.
- Curated docs/knowledge snippets for stable background context, such as player profile notes, competition context, and explanation text used by the site.

For v1, the docs/RAG layer can start as a small local knowledge corpus with deterministic retrieval by topic. It does not need a full vector database on day one if the corpus is small. The interfaces should still separate retrieval from generation so embeddings/vector search can be added later.

## Data Model

Add storage for ingested articles and generated insights.

`news_articles` stores source metadata:

- `id`
- `source`
- `source_url`
- `canonical_url`
- `title`
- `excerpt`
- `author`
- `published_at`
- `ingested_at`
- `matched_terms`
- `raw_metadata`

`ai_insights` stores generated homepage output:

- `id`
- `surface`, initially `home`
- `headline`
- `summary`
- `bullets`
- `sources`
- `generated_at`
- `expires_at`
- `status`
- `model`
- `input_fingerprint`
- `error_message`

The homepage should query the newest successful `home` insight whose `generated_at` is present. Staleness is determined from `expires_at`.

## API And Runtime Boundaries

Add a cron-only route, for example `src/app/api/cron/generate-home-insight/route.ts`.

The route should:

- Verify the cron secret or Vercel Cron authorization.
- Ingest news sources.
- Build context.
- Generate the insight.
- Store the result.
- Return a small operational JSON response.

Keep implementation logic outside the route handler in focused modules:

- `newsSources` for source configuration.
- `ingestNews` for fetching/filtering/deduping articles.
- `buildHomeInsightContext` for stats and RAG retrieval.
- `generateHomeInsight` for model prompting and output validation.
- `getLatestHomeInsight` for homepage reads.

## Prompt And Output Rules

The prompt should require grounded output:

- Use only provided context.
- Cite recent news sources by URL.
- Avoid injury, availability, transfer, or fixture claims unless source context supports them.
- Prefer cautious wording when source metadata is incomplete.
- Keep the card short enough for the homepage.

The model response should be validated as structured JSON before storing it.

## Failure Handling

The public homepage must not depend on a live news fetch or AI call.

Failure behavior:

- If ingestion fails, keep the last valid insight and log the failure.
- If generation fails, store an error record or log entry but do not overwrite the last successful insight.
- If no cached insight exists, render deterministic fallback content.
- If the insight is stale, render it with a stale label or fallback depending on UI constraints.

## Testing

Test the feature at three layers:

- Unit tests for article filtering, dedupe, source parsing, context assembly, and freshness logic.
- Integration tests for the cron route using mocked Sporting News HTML and mocked AI output.
- UI tests or component tests for valid, stale, missing, and fallback insight states.

Manual verification should include running the cron route locally with a mocked or fixture-based source response and confirming the homepage renders the AI Insight section before all other sections.

## Future Extensions

After the landing page proves useful, the same system can support page-specific insights:

- Dribbles page insights based on selected filters.
- Per-90 trend explanations.
- Opponent-specific previews.
- Records and honours context.

Those extensions should reuse the ingestion, retrieval, and generation interfaces while adding page-specific context builders.
