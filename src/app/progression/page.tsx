import type { Metadata } from 'next';
import ProgressionPageClient from './ProgressionPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Career Progression - Match by Match Stats - Yamalverse',
  description:
    'Follow Lamine Yamal career progression with a match-by-match timeline of goals, assists, and contributions.',
  openGraph: {
    title: 'Lamine Yamal Career Progression',
    description:
      'Follow Lamine Yamal career progression with a match-by-match timeline of goals, assists, and contributions.',
    url: 'https://yamalverse.com/progression',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Career Progression',
    description:
      'Follow Lamine Yamal career progression with a match-by-match timeline of goals, assists, and contributions.',
    images: ['/og-image.jpeg'],
  },
};

export default function ProgressionPage() {
  return <ProgressionPageClient />;
}
