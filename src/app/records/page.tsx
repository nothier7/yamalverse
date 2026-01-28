import type { Metadata } from 'next';
import RecordsPageClient from './RecordsPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Records - Youngest Player Milestones - Yamalverse',
  description:
    'Discover Lamine Yamal records and milestones across La Liga, Champions League, and Spain national team competitions.',
  openGraph: {
    title: 'Lamine Yamal Records and Milestones',
    description:
      'Discover Lamine Yamal records and milestones across La Liga, Champions League, and Spain national team competitions.',
    url: 'https://yamalverse.com/records',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Records and Milestones',
    description:
      'Discover Lamine Yamal records and milestones across La Liga, Champions League, and Spain national team competitions.',
    images: ['/og-image.jpeg'],
  },
};

export default function RecordsPage() {
  return <RecordsPageClient />;
}
