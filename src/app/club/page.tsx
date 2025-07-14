'use client';

import { useEffect, useState } from 'react';
import { YamalStats } from '../types/stats';
import { getFilteredStats } from '../lib/queries/getFilteredStats';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';

export default function ClubPage() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<{
    club: YamalStats | null;
    championsLeague: YamalStats | null;
    Liga: YamalStats | null;
    Copa: YamalStats | null;
  }>({
    club: null,
    championsLeague: null,
    Liga: null,
    Copa: null,
  });

  useEffect(() => {
    const filterParams =
      selectedFilter?.type === 'season'
        ? { season: String(selectedFilter.value) }
        : selectedFilter?.type === 'year'
        ? { year: Number(selectedFilter.value) }
        : {};

    const queries = [
      { key: 'club', args: { type: 'Club', ...filterParams } },
      { key: 'Liga', args: { competition: 'La Liga', ...filterParams } },
      { key: 'Copa', args: { competition: 'Copa del Rey', ...filterParams } },
      { key: 'championsLeague', args: { competition: 'Champions Lg', ...filterParams } },
    ] as const;

    getFilteredStats(queries).then(setStats);
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

      {stats.club && (
        <StatsCard title="Club Stats" subtitle="Excluding friendlies" {...stats.club} />
      )}

      {stats.Liga && <StatsCard title="La Liga Stats" {...stats.Liga} />}

      {stats.Copa && <StatsCard title="CDR Stats" {...stats.Copa} />}

      {stats.championsLeague && (
        <StatsCard title="UEFA Champions League Stats" {...stats.championsLeague} />
      )}
    </div>
  );
}
