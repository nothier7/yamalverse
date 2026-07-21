export const WORLD_CUP_CONFETTI_DURATION_MS = 8_000;
export const WORLD_CUP_CONFETTI_EMISSION_MS = 4_000;
export const WORLD_CUP_CONFETTI_PIECE_COUNT = 90;
export const WORLD_CUP_CONFETTI_SESSION_KEY = 'yamalverse:wc-2026-confetti:v2';

type WorldCupConfettiGate = {
  hasPlayed: boolean;
  prefersReducedMotion: boolean;
};

export function shouldPlayWorldCupConfetti({
  hasPlayed,
  prefersReducedMotion,
}: WorldCupConfettiGate): boolean {
  return !hasPlayed && !prefersReducedMotion;
}
