'use client';

import { useEffect, useState } from 'react';
import { YamalStats } from '../types/stats';
import { getFilteredStats } from '../lib/queries/getFilteredStats';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';

export default function InternationalPage() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<{
    intl: YamalStats | null;
    euro: YamalStats | null;
    nationsLeague: YamalStats | null;
    euroQual : YamalStats | null;

  }>({
    intl: null,
    euro: null,
    nationsLeague: null,
    euroQual: null,
  });

  useEffect(() => {
    const filterParams =
      selectedFilter?.type === 'season'
        ? { season: String(selectedFilter.value) }
        : selectedFilter?.type === 'year'
        ? { year: Number(selectedFilter.value) }
        : {};

    const queries = [
      { key: 'intl', args: { type: 'International', ...filterParams } },
      { key: 'euro', args: { competition: 'UEFA Euro', ...filterParams } },
      { key: 'nationsLeague', args: { competition: 'UEFA Nations League', ...filterParams } },
      { key: 'euroQual', args: { competition: 'UEFA Euro Qualifying', ...filterParams } },
    ] as const;

    getFilteredStats(queries).then(setStats);
  }, [selectedFilter]);

  const seasons = ['2022/23', '2023/24', '2024/25'];
  const years = [2023, 2024, 2025];

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        {selectedFilter
          ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} Intl Stats`
          : 'All-Time International Stats'}
      </h1>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {stats.intl && (
        <StatsCard title="International Stats" {...stats.intl} />
      )}

      {stats.euro && <StatsCard title="EURO Stats" {...stats.euro} />}

      {stats.euroQual && <StatsCard title="EURO Qualifiers Stats" {...stats.euroQual} />}

      {stats.nationsLeague && <StatsCard title="Nations League Stats" {...stats.nationsLeague} />}

    </div>
  );
}
