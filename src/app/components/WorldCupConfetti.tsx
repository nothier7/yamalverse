'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import {
  shouldPlayWorldCupConfetti,
  WORLD_CUP_CONFETTI_DURATION_MS,
  WORLD_CUP_CONFETTI_SESSION_KEY,
} from '../lib/worldCupConfetti';
import styles from './WorldCupConfetti.module.css';

const GOLD_TONES = ['#F7D76D', '#DDAA32', '#FFF0A6', '#C98920'] as const;

const CONFETTI_PIECES = Array.from({ length: 32 }, (_, index) => ({
  color: GOLD_TONES[index % GOLD_TONES.length],
  delay: (index * 73) % 420,
  drift: ((index % 2 === 0 ? -1 : 1) * (12 + ((index * 17) % 46))),
  duration: 2_300 + ((index * 97) % 430),
  height: 9 + ((index * 5) % 8),
  left: 2 + ((index * 37) % 96),
  start: (index * 29) % 180,
  turn: 480 + ((index * 71) % 420),
  width: 4 + ((index * 3) % 4),
}));

type ConfettiPieceStyle = CSSProperties & {
  '--confetti-color': string;
  '--confetti-delay': string;
  '--confetti-drift': string;
  '--confetti-duration': string;
  '--confetti-height': string;
  '--confetti-left': string;
  '--confetti-start': string;
  '--confetti-turn': string;
  '--confetti-width': string;
};

export default function WorldCupConfetti() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrame: number | undefined;
    let hideTimer: number | undefined;

    try {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const hasPlayed = window.sessionStorage.getItem(
        WORLD_CUP_CONFETTI_SESSION_KEY
      ) === 'played';

      if (!shouldPlayWorldCupConfetti({ hasPlayed, prefersReducedMotion })) {
        return;
      }

      window.sessionStorage.setItem(WORLD_CUP_CONFETTI_SESSION_KEY, 'played');
      animationFrame = window.requestAnimationFrame(() => {
        setIsVisible(true);
        hideTimer = window.setTimeout(
          () => setIsVisible(false),
          WORLD_CUP_CONFETTI_DURATION_MS
        );
      });
    } catch {
      return;
    }

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={styles.overlay}
      data-world-cup-confetti="active"
    >
      {CONFETTI_PIECES.map((piece, index) => {
        const style: ConfettiPieceStyle = {
          '--confetti-color': piece.color,
          '--confetti-delay': `${piece.delay}ms`,
          '--confetti-drift': `${piece.drift}px`,
          '--confetti-duration': `${piece.duration}ms`,
          '--confetti-height': `${piece.height}px`,
          '--confetti-left': `${piece.left}%`,
          '--confetti-start': `${piece.start}deg`,
          '--confetti-turn': `${piece.turn}deg`,
          '--confetti-width': `${piece.width}px`,
        };

        return <i className={styles.piece} key={index} style={style} />;
      })}
    </div>
  );
}
