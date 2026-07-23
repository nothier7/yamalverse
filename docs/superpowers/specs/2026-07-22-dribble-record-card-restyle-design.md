# Dribble Record Card Restyle Design

## Goal

Keep the useful single-match dribbling record on `/dribbles` while removing the yellow promotional treatment that makes it resemble an AI-generated insight.

## Visual Treatment

Restyle the existing “Most Dribbles in a Game” callout as a compact neutral card that matches the established dribble-stat surfaces:

- Use the existing translucent white background and subtle white border.
- Keep the current rounded corners and responsive `max-w-md` width.
- Remove the yellow background tint, thick yellow left border, and standalone promotional shadow.
- Present the heading in muted neutral text and the record detail as the primary line.

The card will remain centered between the filters/loading states and the competition-card grid. Its wording and displayed values will not change.

## Data and Behavior

Keep the `get_dribble_record_game` request, record state, filter behavior, and non-critical record-error handling unchanged. The card will still render only when record data is available and will update with the selected season or year.

## Accessibility and Failure Behavior

Maintain semantic heading and paragraph markup with sufficient contrast on the dark page background. If the record request fails or returns no row, the page will continue displaying competition statistics without the record card, as it does today.

## Verification

- Run the full unit test suite and TypeScript check.
- Run targeted lint for the dribbles page and the production build.
- Inspect `/dribbles` at desktop and mobile widths to confirm the yellow tint and left stripe are gone, the card aligns with the site’s existing surfaces, and filters still update the displayed record.

## Scope

This change only restyles the single-match record card. It does not alter record calculations, database functions, fetch timing, filters, competition cards, or page copy.
