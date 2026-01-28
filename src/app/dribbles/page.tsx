import React from 'react';
import type { Metadata } from 'next';
import DribblesPageClient from './DribblesPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Dribble Stats - Take-Ons and Success Rate - Yamalverse',
  description:
    'Explore Lamine Yamal dribble stats, take-on success rate, and per-90 dribbles by competition.',
  openGraph: {
    title: 'Lamine Yamal Dribble Stats',
    description:
      'Explore Lamine Yamal dribble stats, take-on success rate, and per-90 dribbles by competition.',
    url: 'https://yamalverse.com/dribbles',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Dribble Stats',
    description:
      'Explore Lamine Yamal dribble stats, take-on success rate, and per-90 dribbles by competition.',
    images: ['/og-image.jpeg'],
  },
};

export default function DribblesPage() {
  return <DribblesPageClient />;
}
