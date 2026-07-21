export const WORLD_CUP_CONFETTI_DURATION_MS = 5_500;
export const WORLD_CUP_CONFETTI_PIECE_COUNT = 64;
export const WORLD_CUP_CONFETTI_SESSION_KEY = 'yamalverse:wc-2026-confetti:v1';

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
