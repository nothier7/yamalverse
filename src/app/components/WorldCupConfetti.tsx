'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import {
  shouldPlayWorldCupConfetti,
  WORLD_CUP_CONFETTI_DURATION_MS,
  WORLD_CUP_CONFETTI_EMISSION_MS,
  WORLD_CUP_CONFETTI_PIECE_COUNT,
  WORLD_CUP_CONFETTI_SESSION_KEY,
} from '../lib/worldCupConfetti';
import styles from './WorldCupConfetti.module.css';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const GOLD_TONES = ['#F7D76D', '#DDAA32', '#FFF0A6', '#C98920'];
const INITIAL_VELOCITY_X = { min: -4, max: 4 };
const INITIAL_VELOCITY_Y = { min: 0.5, max: 3.5 };

function drawGoldStrip(
  this: { w: number; h: number },
  context: CanvasRenderingContext2D
) {
  context.fillRect(-this.w / 6, -this.h / 2, this.w / 3, this.h);
}

type Viewport = {
  width: number;
  height: number;
};

export default function WorldCupConfetti() {
  const [isVisible, setIsVisible] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });

  const hideConfetti = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    let animationFrame: number | undefined;

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
        setViewport({ width: window.innerWidth, height: window.innerHeight });
        setIsVisible(true);
      });
    } catch {
      return;
    }

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    const hideTimer = window.setTimeout(
      hideConfetti,
      WORLD_CUP_CONFETTI_DURATION_MS
    );

    window.addEventListener('resize', updateViewport, { passive: true });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.clearTimeout(hideTimer);
    };
  }, [hideConfetti, isVisible]);

  if (!isVisible || viewport.width === 0 || viewport.height === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={styles.overlay}
      data-world-cup-confetti="active"
    >
      <Confetti
        className={styles.canvas}
        colors={GOLD_TONES}
        confettiSource={{ x: 0, y: -16, w: viewport.width, h: 8 }}
        drawShape={drawGoldStrip}
        friction={0.985}
        gravity={0.07}
        height={viewport.height}
        initialVelocityX={INITIAL_VELOCITY_X}
        initialVelocityY={INITIAL_VELOCITY_Y}
        numberOfPieces={WORLD_CUP_CONFETTI_PIECE_COUNT}
        onConfettiComplete={hideConfetti}
        opacity={0.95}
        recycle={false}
        tweenDuration={WORLD_CUP_CONFETTI_EMISSION_MS}
        width={viewport.width}
        wind={0.002}
      />
    </div>
  );
}
