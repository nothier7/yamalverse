import assert from 'node:assert/strict';
import test from 'node:test';
import {
  shouldPlayWorldCupConfetti,
  WORLD_CUP_CONFETTI_DURATION_MS,
  WORLD_CUP_CONFETTI_EMISSION_MS,
  WORLD_CUP_CONFETTI_PIECE_COUNT,
  WORLD_CUP_CONFETTI_SESSION_KEY,
} from './worldCupConfetti.ts';

test('plays for a visitor who has not celebrated in this session', () => {
  assert.equal(
    shouldPlayWorldCupConfetti({
      hasPlayed: false,
      prefersReducedMotion: false,
    }),
    true
  );
});

test('does not replay in the same browser session', () => {
  assert.equal(
    shouldPlayWorldCupConfetti({
      hasPlayed: true,
      prefersReducedMotion: false,
    }),
    false
  );
});

test('does not play when reduced motion is preferred', () => {
  assert.equal(
    shouldPlayWorldCupConfetti({
      hasPlayed: false,
      prefersReducedMotion: true,
    }),
    false
  );
});

test('uses the approved staggered physics-shower timing', () => {
  assert.equal(WORLD_CUP_CONFETTI_SESSION_KEY, 'yamalverse:wc-2026-confetti:v2');
  assert.equal(WORLD_CUP_CONFETTI_PIECE_COUNT, 90);
  assert.equal(WORLD_CUP_CONFETTI_EMISSION_MS, 4_000);
  assert.equal(WORLD_CUP_CONFETTI_DURATION_MS, 8_000);
});
