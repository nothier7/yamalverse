# World Cup Confetti Celebration Design

Status: Revised after motion review on 2026-07-20

## Goal

Celebrate Lamine Yamal's 2026 FIFA World Cup win with a short gold confetti animation when the Yamalverse homepage first loads. The effect should feel like a natural shower rather than a synchronized curtain, while remaining non-blocking and lightweight.

## User Experience

- Emit roughly 90 gold pieces progressively across four seconds instead of starting every piece together.
- Let each piece move independently and allow the final pieces to leave the viewport after roughly seven to eight seconds.
- Run only on the homepage and only once per browser tab session.
- Keep the page immediately readable and interactive while the animation runs.
- Use a transparent, fixed overlay with `pointer-events: none` so confetti never blocks navigation, scrolling, or controls.
- Remove the animation layer completely after it finishes.
- Do not play when the visitor has enabled reduced motion.

## Component Design

Keep the focused `WorldCupConfetti` client component under `src/app/components/`. Mount it once in the homepage client tree, close to the page root, so it can cover the viewport without changing layout.

Use `react-confetti` as the particle renderer. Its canvas model supports gradual emission and gives every particle its own velocity, gravity, friction, wind, rotation, and flip state. Load the package dynamically from the client component so the animation engine does not enter the server-rendering path.

The component will render nothing during server rendering and on the first client render. After mounting, it will:

1. Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
2. Read the versioned session-storage key `yamalverse:wc-2026-confetti:v2`. Bumping the version allows the corrected animation to play once even if a visitor saw the superseded CSS version earlier in the same tab.
3. If motion is allowed and the key is absent, set the key and show the overlay.
4. Measure the viewport and update the canvas dimensions while the effect is active.
5. Stop recycling after the configured particle count has been emitted, then unmount when the particle engine reports completion. Retain an eight-second safety timer so the decorative layer cannot remain mounted indefinitely.
6. Remove the resize listener and clear the safety timer during cleanup.

If session storage is unavailable, the component will render nothing so it cannot repeat unexpectedly or fail the homepage. The first server and client renders remain empty, so the canvas cannot introduce a hydration mismatch.

## Visual Treatment

- Use narrow rectangular pieces in several related gold tones, including warm gold, pale champagne, and deeper metallic gold.
- Emit particles from a source spanning the full top edge of the viewport.
- Randomize each particle's horizontal and vertical velocity, rotation, flip, and dimensions through the particle engine.
- Use gentle gravity, high friction, and slight wind so pieces drift and settle at different times instead of forming a horizontal band.
- Spread particle creation over four seconds and keep the simultaneous density low enough that the AI Insight headline and homepage controls remain readable.
- Do not add bursts, sound, text, controls, or non-gold colors.

## Accessibility and Performance

- Respect `prefers-reduced-motion` before displaying the overlay.
- Mark the layer `aria-hidden="true"` because it conveys no additional information to assistive technology.
- Keep the fixed canvas click-through with `pointer-events: none`.
- Use one passive resize listener only while the animation is mounted, avoiding polling or per-frame React state updates.
- Dynamically load the particle renderer and keep its animation loop outside React's render cycle.
- Keep the client component isolated so the existing server-side homepage data flow remains unchanged.

## Failure Behavior

The celebration is decorative and must fail closed with respect to the page: storage, media-query, or viewport-access errors must never prevent homepage content from rendering. The component will catch browser API access failures and render nothing; it will not surface an error state to visitors. The safety timer will remove the canvas if the particle completion callback does not fire.

## Verification

- Confirm a fresh browser session gradually emits gold pieces from across the top edge.
- Confirm particles occupy different vertical positions and leave the viewport at visibly different times rather than forming a synchronized band.
- Confirm the canvas is removed after completion or no later than the safety timeout.
- Confirm a reload in the same tab session does not replay it.
- Confirm a new browser session can show it again.
- Confirm reduced-motion emulation prevents the overlay from appearing.
- Confirm the overlay does not intercept clicks or produce horizontal overflow on desktop or mobile viewports.
- Run the existing automated tests, TypeScript check, lint check, and production build.
- Perform a browser console and visual inspection of the homepage.

## Scope

This change revises only the homepage World Cup celebration. It adds the `react-confetti` runtime dependency but does not add sound, recurring seasonal effects, user controls, analytics, or a general-purpose particle system.
