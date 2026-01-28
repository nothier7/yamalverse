import type { Metadata } from 'next';
import HonoursPageClient from './HonoursPageClient';

export const metadata: Metadata = {
  title: 'Lamine Yamal Honours and Awards - Trophies - Yamalverse',
  description:
    'Explore Lamine Yamal honours, awards, and trophies across club and international competitions.',
  openGraph: {
    title: 'Lamine Yamal Honours and Awards',
    description:
      'Explore Lamine Yamal honours, awards, and trophies across club and international competitions.',
    url: 'https://yamalverse.com/honours',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamine Yamal Honours and Awards',
    description:
      'Explore Lamine Yamal honours, awards, and trophies across club and international competitions.',
    images: ['/og-image.jpeg'],
  },
};

export default function HonoursPage() {
  return <HonoursPageClient />;
}
