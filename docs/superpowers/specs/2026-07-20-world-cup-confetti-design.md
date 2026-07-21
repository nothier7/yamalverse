# World Cup Confetti Celebration Design

## Goal

Celebrate Lamine Yamal's 2026 FIFA World Cup win with a short gold confetti animation when the Yamalverse homepage first loads. The effect should feel festive without obstructing the site, repeating during normal navigation, or adding a heavy animation dependency.

## User Experience

- Play a light top-down shower of 32 gold confetti pieces for 3.2 seconds.
- Run only on the homepage and only once per browser tab session.
- Keep the page immediately readable and interactive while the animation runs.
- Use a transparent, fixed overlay with `pointer-events: none` so confetti never blocks navigation, scrolling, or controls.
- Remove the animation layer completely after it finishes.
- Do not play when the visitor has enabled reduced motion.

## Component Design

Create a focused `WorldCupConfetti` client component under `src/app/components/`. Mount it once in the homepage client tree, close to the page root, so it can cover the viewport without changing layout.

The component will render nothing during server rendering and on the first client render. After mounting, it will:

1. Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
2. Read a versioned session-storage key such as `yamalverse:wc-2026-confetti:v1`.
3. If motion is allowed and the key is absent, set the key and show the overlay.
4. Start a timer matching the animation duration, then unmount the overlay.
5. Clear the timer during cleanup.

If session storage is unavailable, the component will render nothing so it cannot repeat unexpectedly or fail the homepage. Confetti geometry will come from a small deterministic module-level array rather than runtime randomness, preventing hydration inconsistencies and needless recalculation.

## Visual Treatment

- Use narrow rectangular pieces in several related gold tones, including warm gold, pale champagne, and deeper metallic gold.
- Vary horizontal position, size, delay, duration, rotation, and subtle sideways drift to avoid mechanical movement.
- Keep density low enough that the AI Insight headline and homepage controls remain easy to read.
- Implement motion with CSS keyframes and transforms for compositor-friendly animation.
- Avoid canvas, SVG particle engines, and third-party confetti packages.

## Accessibility and Performance

- Respect `prefers-reduced-motion` before displaying the overlay.
- Mark the layer `aria-hidden="true"` because it conveys no additional information to assistive technology.
- Use only transforms and opacity during animation.
- Avoid event listeners, layout measurements, network requests, and new dependencies.
- Keep the client component isolated so the existing server-side homepage data flow remains unchanged.

## Failure Behavior

The celebration is decorative and must fail closed with respect to the page: storage or media-query errors must never prevent homepage content from rendering. The component will catch browser API access failures and render nothing; it will not surface an error state to visitors.

## Verification

- Confirm a fresh browser session shows the gold shower for 3.2 seconds.
- Confirm a reload in the same tab session does not replay it.
- Confirm a new browser session can show it again.
- Confirm reduced-motion emulation prevents the overlay from appearing.
- Confirm the overlay does not intercept clicks or produce horizontal overflow on desktop or mobile viewports.
- Run the existing automated tests, TypeScript check, lint check, and production build.
- Perform a browser console and visual inspection of the homepage.

## Scope

This change adds only the homepage World Cup celebration. It does not add sound, recurring seasonal effects, user controls, analytics, or a general-purpose particle system.
