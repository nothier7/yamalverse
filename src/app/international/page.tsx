import React from 'react';
import type { Metadata } from 'next';
import InternationalPageClient from './InternationalPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Spain Stats - International Career - Yamalverse',
  description:
    'Track Lamine Yamal Spain national team stats, including Euro, Nations League, and qualifier performances.',
  openGraph: {
    title: 'Lamine Yamal Spain National Team Stats',
    description:
      'Track Lamine Yamal Spain national team stats, including Euro, Nations League, and qualifier performances.',
    url: 'https://yamalverse.com/international',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Spain National Team Stats',
    description:
      'Track Lamine Yamal Spain national team stats, including Euro, Nations League, and qualifier performances.',
    images: ['/og-image.jpeg'],
  },
};

export default function InternationalPage() {
  return <InternationalPageClient />;
}
