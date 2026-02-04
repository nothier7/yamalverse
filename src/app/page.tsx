import HomeClient from './components/HomeClient';
import { getAllTimeTeamStats } from './lib/queries/getAllTimeTeamStats';
import { getRecentMatches } from './lib/queries/getRecentMatches';

export const metadata = {
  title: 'Yamalverse – Lamine Yamal Career Stats & Records',
  description:
    'Track Lamine Yamal’s stats, goals, assists, trophies, and milestones with a clean, football-focused dashboard.',
  openGraph: {
    title: 'Yamalverse',
    description:
      'Track Lamine Yamal’s stats, goals, assists, trophies, and milestones.',
    url: 'https://yamalverse.com',
    siteName: 'Yamalverse',
    images: [
      {
        url: 'https://yamalverse.com/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Yamalverse',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yamalverse',
    description: 'Track Lamine Yamal’s full football journey.',
    images: ['https://yamalverse.com/og-image.jpeg'],
  },
};

export default async function HomePage() {
  const [recentMatches, barcelona, spain] = await Promise.all([
    getRecentMatches(5),
    getAllTimeTeamStats('Barcelona'),
    getAllTimeTeamStats('Spain'),
  ]);

  return (
    <HomeClient
      initialRecentMatches={recentMatches}
      initialCareerStats={{ barcelona, spain }}
    />
  );
}
