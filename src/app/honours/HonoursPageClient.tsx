'use client';

import { useState } from 'react';
import HonoursCard from '../components/HonoursCard';

export default function HonoursPageClient() {
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('team');

  const individualHonours = [
    {
      title: 'Golden Boy',
      times: 1,
      seasons: ['2024'],
    },
    {
      title: 'Kopa Trophy',
      times: 2,
      seasons: ['2024', '2025'],
    },
    {
      title: 'UEFA EURO Young PLayer of the Tournament',
      times: 1,
      seasons: ['2024'],
    },
    {
      title: 'La Liga Team of the Season',
      times: 1,
      seasons: ['2024/25'],
    },
    {
      title: 'UEFA Champions League Team of the Season',
      times: 1,
      seasons: ['2024/25'],
    },
    {
      title: 'UEFA EURO Goal of the Tournament',
      times: 1,
      seasons: ['2024'],
    },
    {
      title: 'La Liga U23 Player of the Season',
      times: 2,
      seasons: ['2023/24', '2024/25'],
    },
    {
      title: "IFFHS Men's World's Best Youth Player",
      times: 1,
      seasons: ['2024'],
    },
    {
      title: "The Best FIFA Men's 11",
      times: 1,
      seasons: ['2024'],
    },
    {
      title: 'Tuttosport The Youngest Award',
      times: 1,
      seasons: ['2023'],
    },
    {
      title: 'Laureus World Sports Award for Breakthrough of the Year',
      times: 1,
      seasons: ['2025'],
    },
  ];

  const teamHonours = [
    {
      title: 'La Liga',
      times: 2,
      seasons: ['2022/23', '2024/25'],
    },
    {
      title: 'Copa del Rey',
      times: 1,
      seasons: ['2024/25'],
    },
    {
      title: 'Spanish Super Cup',
      times: 2,
      seasons: ['2024/25', '2025/26'],
    },
    {
      title: 'UEFA EURO',
      times: 1,
      seasons: ['2024'],
    },
  ];

  const honoursToDisplay = activeTab === 'individual' ? individualHonours : teamHonours;

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4">
      <h1 className="text-3xl font-bold text-white">Honours</h1>

      {/* Tab Switch */}
      <div className="flex gap-4">
        {['team', 'individual'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-white transition ${
              activeTab === tab
                ? 'bg-white text-black font-semibold'
                : 'border border-white opacity-70'
            }`}
            onClick={() => setActiveTab(tab as 'individual' | 'team')}
          >
            {tab === 'team' ? 'Team' : 'Individual'}
          </button>
        ))}
      </div>

      {/* Honour Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        {honoursToDisplay.map((item, i) => (
          <HonoursCard
            key={i}
            title={`${item.times}x ${item.title}`}
            subtitle={item.seasons.join(', ')}
          />
        ))}
      </div>
    </div>
  );
}
