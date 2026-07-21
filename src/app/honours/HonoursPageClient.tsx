'use client';

import { useState } from 'react';
import HonoursCard from '../components/HonoursCard';
import { individualHonours, teamHonours } from './honoursData';

export default function HonoursPageClient() {
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('team');

  const honoursToDisplay = activeTab === 'individual' ? individualHonours : teamHonours;

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4">
      <h1 className="text-3xl font-bold text-white">Honours</h1>

      {/* Tab Switch */}
      <div className="flex gap-4">
        {['team', 'individual'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full transition ${
              activeTab === tab
                ? 'bg-white text-black font-semibold'
                : 'border border-white text-white opacity-70'
            }`}
            onClick={() => setActiveTab(tab as 'individual' | 'team')}
          >
            {tab === 'team' ? 'Team' : 'Individual'}
          </button>
        ))}
      </div>

      {/* Honour Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        {honoursToDisplay.map((item) => (
          <HonoursCard
            key={item.title}
            title={`${item.times}x ${item.title}`}
            subtitle={item.seasons.join(', ')}
          />
        ))}
      </div>
    </div>
  );
}
