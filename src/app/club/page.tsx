import React from 'react';
import type { Metadata } from 'next';
import ClubPageClient from './ClubPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Club Stats - FC Barcelona - Yamalverse',
  description:
    'Track Lamine Yamal FC Barcelona stats, including La Liga, Champions League, and Copa del Rey goals, assists, and appearances.',
  openGraph: {
    title: 'Lamine Yamal Club Stats',
    description:
      'Track Lamine Yamal FC Barcelona stats, including La Liga, Champions League, and Copa del Rey goals, assists, and appearances.',
    url: 'https://yamalverse.com/club',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Club Stats',
    description:
      'Track Lamine Yamal FC Barcelona stats, including La Liga, Champions League, and Copa del Rey goals, assists, and appearances.',
    images: ['/og-image.jpeg'],
  },
};

export default function ClubPage() {
  return <ClubPageClient />;
}
