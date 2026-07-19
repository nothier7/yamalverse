# Sofascore-Style Rating Color Scale

## Goal

Apply Sofascore's rating color bands to every player rating shown on Yamalverse while preserving Yamalverse's existing match-card layout, badge size, rounded shape, typography, and spacing.

## Reference Palette

The palette was read from the computed rating tokens on the referenced Sofascore Lamine Yamal page:

| Rating | Color | Meaning |
| --- | --- | --- |
| `9.0–10.0` | `#374DF5` | Exceptional |
| `8.0–8.9` | `#00ADC4` | Excellent |
| `7.0–7.9` | `#00C424` | Good |
| `6.5–6.9` | `#D9AF00` | Average-positive |
| `6.0–6.4` | `#ED7E07` | Below average |
| `< 6.0` | `#CD0B00` | Poor |
| Missing or invalid | `#828BA1` | Unrated |

Thresholds are inclusive at their lower bound. Ratings are normalized to numbers before classification.

## User Interface

The existing 48-by-48 pixel rounded Yamalverse rating badge remains unchanged except for its background color. Rating text stays white, centered, and semibold. The visible numeric value and existing `aria-label` ensure the color is not the only information conveyed.

The current special case that assigns a separate color to a perfect `10` will be removed. A `10` uses the same blue band as all ratings from `9.0` upward.

## Implementation

Update the centralized `getRatingClass` helper in `src/app/components/RecentFormSection.tsx`. No component hierarchy, database schema, data-fetching logic, or match-card layout will change.

The helper will classify values in descending order:

1. Missing or non-finite values use the unrated gray.
2. Ratings of `9.0` or higher use blue.
3. Ratings of `8.0` or higher use cyan.
4. Ratings of `7.0` or higher use green.
5. Ratings of `6.5` or higher use gold.
6. Ratings of `6.0` or higher use orange.
7. Lower ratings use red.

## Error Handling

Existing parsing behavior remains in place. Strings are converted to numbers, and invalid values become unrated. The helper must not throw for `null`, invalid strings, or values outside the normal rating range.

## Verification

- Run the repository's lint or build checks available for the current Next.js version.
- Verify that the current `6.5` match ratings change from gray to gold.
- Verify that `7.x` ratings remain green.
- Inspect the homepage in a browser at desktop and narrow viewport widths to ensure the badge layout does not change.
- Confirm that missing ratings continue to render as `--` with a neutral gray background.

## Out of Scope

- Copying Sofascore's badge size, square shape, animations, table layout, or typography.
- Changing match data, rating values, or rating providers.
- Adding a rating legend or tooltip.
