# Landing Title Count Synchronization Design

## Goal

Keep the Barcelona and Spain title totals on the landing page synchronized with the official team honours displayed on the honours page. The corrected totals are Barcelona 6 and Spain 2.

## Source of Truth

The typed honours dataset remains the canonical source. Each team honour will identify its owning team as either `Barcelona` or `Spain`. Individual honours will not carry a team because they do not contribute to the landing-page team totals.

A small exported helper will normalize the requested team name, filter the official team honours for that team, and sum each matching honour's `times` value. Unknown or missing team names will return zero.

## Landing-Page Integration

`AllTimeCareerSection` will remove its hardcoded `TITLE_COUNTS` map and call the shared honours helper for each team statistics card. The statistics queries, component props, loading states, and layout will remain unchanged.

This produces:

- Barcelona: three La Liga titles, one Copa del Rey, and two Spanish Super Cups, for 6 total.
- Spain: one UEFA EURO and one FIFA World Cup, for 2 total.

Any future official team honour added to the dataset with the correct team will automatically update the landing-page total.

## Type Safety and Failure Behavior

Use a discriminated honour type so every team honour requires a valid team while individual honours cannot accidentally contribute to team totals. The helper will compare normalized team names and return zero for unknown teams instead of throwing or blocking the landing page.

## Verification

- Extend honours-data tests to assert Barcelona totals 6 and Spain totals 2 through the shared helper.
- Retain the existing check that every honour's count matches its listed seasons and has an HTTPS source.
- Run the full unit test suite, TypeScript check, targeted lint, and production build.
- Inspect the landing page and confirm both title boxes render the derived totals.

## Scope

This change only synchronizes landing-page team-title totals with the existing official honours dataset. It does not change match statistics, individual awards, page layout, database records, or API behavior.
