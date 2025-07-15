'use client';

import { useState } from 'react';
import HonoursCard from '../components/HonoursCard';

export default function HonoursPage() {
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('team');

  const individualHonours = [
    {
      title: 'UEFA U17 Team of the Tournament',
      times: 1,
      seasons: ['2023'],
    },
    {
      title: 'La Liga Young Player of the Month',
      times: 1,
      seasons: ['March 2024'],
    },
  ];

  const teamHonours = [
    {
      title: 'UEFA Nations League',
      times: 1,
      seasons: ['2022/23'],
    },
    {
      title: 'La Liga',
      times: 2,
      seasons: ['2022/23', '2024/25'],
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
