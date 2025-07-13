'use client';

import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';
import { getAllTimeStats } from '../lib/queries/getStats';

type YamalStats = {
  appearances: number;
  assists: number;
  goals: number;
  contributions: number;
  minutesPerGoal: number;
  minutesPerContribution: number;
};

export default function ClubPage() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<YamalStats | null>(null);

  useEffect(() => {
    getAllTimeStats({
  type: 'Club',
  ...(selectedFilter?.type === 'season' && { season: String(selectedFilter.value) }),
  ...(selectedFilter?.type === 'year' && { year: Number(selectedFilter.value) })
}).then(setStats);
  }, [selectedFilter]);

  const seasons = ['2022/23', '2023/24', '2024/25'];
  const years = [2023, 2024, 2025];

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        {selectedFilter
          ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} Club Stats`
          : 'All-Time Club Stats'}
      </h1>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {stats && <StatsCard title="Stats" {...stats} />}
    </div>
  );
}
