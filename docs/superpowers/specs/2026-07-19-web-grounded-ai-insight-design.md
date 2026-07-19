# Web-Grounded AI Insight Design

## Goal

Turn the homepage AI Insight into a daily editorial briefing about the most interesting current Lamine Yamal story. It must add context the rest of Yamalverse does not already provide, rather than repeat career totals or stat cards.

Success means:

- Current match results and news come from OpenAI web search, not ambiguous local score strings or a separately maintained news crawler.
- A recently played match can lead the insight when Yamal's performance or the result has a meaningful consequence.
- An upcoming match can lead when it contains a verified milestone, record possibility, first final, notable reunion, personal connection, or similarly interesting angle.
- Meaningful availability, award, interview, contract, tactical-role, or other current news can lead when no match angle is stronger.
- Every published current fact is backed by a clickable source returned by web search.
- Generic praise, career-stat recaps, unsupported claims, and factually ambiguous output are rejected before publication.

## Approaches Considered

1. **One agentic Responses API request with forced web search and strict validation.** This is the selected approach. The model can research several candidate angles, compare sources, choose the strongest one, and return one structured briefing. It removes the custom discovery pipeline while keeping the daily cost and implementation small.
2. **Separate researcher and editor requests.** This provides a stronger conceptual boundary, but duplicates model work and API calls without enough benefit for one short daily briefing.
3. **Keep GDELT and use OpenAI search only as a fallback.** This retains the source gaps, ingestion policy, deduplication, and operational complexity that caused the current pipeline to publish a thin, incorrect result.

## Editorial Policy

The prompt asks the model to research first and then select exactly one primary angle using this order:

1. A significant performance or consequence from a match completed in roughly the last 36 hours.
2. A significant angle for a match expected in roughly the next seven days.
3. Another material current development involving Yamal.
4. A concise limited-update message when no meaningful, well-sourced angle exists.

The priority order is guidance, not a requirement to force a match story. A routine appearance should not outrank a genuinely important current development.

Career totals and standalone statistics are not editorial angles. A statistic may appear only when it explains why a current event matters, such as a record Yamal could break in an upcoming final. The same source requirements apply to that statistic.

The copy remains concise: a headline, a short summary, and two or three supporting bullets. It should sound like an informed football briefing, avoid hype, and answer "why is this interesting now?"

## Source And Claim Rules

The generation request uses the Responses API with the current supported `web_search` tool and requires the tool to run. It requests the complete web-search source list in addition to normal URL-citation annotations.

The prompt prioritizes primary and authoritative sources such as club, competition, federation, and direct-interview pages, followed by established reporting. Social posts, fan sites, search-result snippets, unsourced aggregators, and Wikipedia cannot support a published claim.

The structured response includes an internal evidence list that maps each material claim to one or more source URLs. The server accepts only URLs that also appear in the actual web-search citations or returned source list. At least one accepted source is required for publication.

Claims about match outcome, score, player contribution, injury, availability, transfer or contract status, records, and personal relationships must be stated only when the cited evidence is explicit. The prompt must not infer "win" or "loss" from an unlabeled score. If sources conflict or the evidence is unclear, the claim is omitted.

The homepage continues to display the accepted sources as visible, clickable links.

## Components And Data Flow

### Scheduled route

Vercel invokes the existing authenticated `/api/cron/generate-home-insight` route once daily at 08:00 UTC. The two-hour Supabase Cron job is removed so the site performs one scheduled research run per day. The bearer-secret authorization remains unchanged.

### Generation service

`generateHomeInsight` sends one Responses API request with:

- A configurable OpenAI model, defaulting to `gpt-5.6`, which the official web-search guide uses for new Responses API examples.
- `web_search` as the only hosted tool and required tool use.
- Medium search context and returned source metadata.
- A structured JSON schema for the editorial result and internal claim evidence.
- The current UTC date and explicit research, source, editorial, and refusal rules.

The service no longer receives GDELT articles, local match summaries, or career totals. Search is the sole authority for current news, match results, and current record context. Existing Yamalverse statistics remain available elsewhere on the site but are not generation input.

After the API response, the service:

1. Parses the structured briefing.
2. Extracts citation and search-source URLs from the raw response.
3. Grounds the model's declared sources and evidence against those URLs.
4. Applies length, source, evidence, and anti-stat-recap validation.
5. Stores a successful `ai_insights` row only if all validation passes.
6. Revalidates the homepage immediately after a new row is stored.

Input-fingerprint reuse is removed because unchanged local data does not prove that the web is unchanged. Each authorized scheduled run performs fresh research.

### Retired discovery path

The cron route no longer invokes `ingestNews`, GDELT, source-tier policy, or `homeInsightContext`. Uncommitted GDELT-specific implementation files are removed from the release. The already-applied additive news-table migration remains in repository history so production schema history stays accurate, but those columns are not part of the active insight path.

### Homepage fallback

If the site has never stored a valid insight, the card shows a neutral generation-pending message. It does not synthesize bullets from recent-match or career-stat tables. Once a valid insight exists, a later failure preserves the last successful public insight.

## Failure Handling

- Missing API key, OpenAI error, search failure, invalid JSON, no actual search call, or missing citations: store a private error row, return a non-success cron response, and leave the last successful insight untouched.
- Unsupported, generic, or stats-only result: reject it as a validation error rather than publishing filler.
- Conflicting evidence: omit the disputed claim; reject the result if no meaningful supported angle remains.
- Database insert failure: return a non-success response and retain the prior insight.
- Homepage revalidation failure after a successful insert: retain the new row, log the cache error, and return it in cron diagnostics.

## Testing

Deterministic unit tests cover:

- Citation and returned-source extraction from a Responses API fixture.
- Rejection of a declared source URL not present in the search response.
- Rejection of a result with no search call or no cited source.
- Rejection of a career-stat recap or generic praise.
- Acceptance of a cited post-match performance angle.
- Acceptance of a cited upcoming final, record, reunion, or personal-connection angle.
- A regression fixture in which Spain beat France 2-0, ensuring the accepted wording cannot reverse the outcome.
- Preservation of the previous successful insight after generation failure.
- Cron authorization and the updated diagnostic response.
- A homepage fallback that does not expose match or career statistics.

Verification includes the focused tests, full test suite, TypeScript checking, production build, and lint reporting. One authenticated production run is inspected for factual accuracy and clickable sources before the corrected release is considered complete.

## Rollout

1. Replace the current discovery/context path with forced OpenAI web search and validation.
2. Update operational documentation and remove the two-hour Supabase schedule from production.
3. Deploy the application and run the authenticated endpoint once manually.
4. Confirm the stored insight, citations, homepage rendering, and cron diagnostics.
5. Commit and push the corrected implementation together with the previously approved local commits.
