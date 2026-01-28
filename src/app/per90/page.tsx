import React from 'react';
import type { Metadata } from 'next';
import Per90PageClient from './Per90PageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Per 90 Stats - Goals and Assists Per Game - Yamalverse',
  description:
    'Compare Lamine Yamal per 90 stats across competitions with goals, assists, and contributions per game.',
  openGraph: {
    title: 'Lamine Yamal Per 90 Stats',
    description:
      'Compare Lamine Yamal per 90 stats across competitions with goals, assists, and contributions per game.',
    url: 'https://yamalverse.com/per90',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Per 90 Stats',
    description:
      'Compare Lamine Yamal per 90 stats across competitions with goals, assists, and contributions per game.',
    images: ['/og-image.jpeg'],
  },
};

export default function Per90Page() {
  return <Per90PageClient />;
}
