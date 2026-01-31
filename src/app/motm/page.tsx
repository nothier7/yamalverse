import React from 'react';
import type { Metadata } from 'next';
import MotmPageClient from './MotmPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal MOTM Awards - Man of the Match Tracker - Yamalverse',
  description:
    'Track Lamine Yamal man of the match awards across all competitions with season and year filters.',
  openGraph: {
    title: 'Lamine Yamal MOTM Awards',
    description:
      'Track Lamine Yamal man of the match awards across all competitions with season and year filters.',
    url: 'https://yamalverse.com/motm',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal MOTM Awards',
    description:
      'Track Lamine Yamal man of the match awards across all competitions with season and year filters.',
    images: ['/og-image.jpeg'],
  },
};

export default function MotmPage() {
  return <MotmPageClient />;
}
