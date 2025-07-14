'use client';

import { useEffect, useState } from 'react';
import StatsCard from './components/StatsCard';
import StatsFilterBar from './components/StatsFilterBar';
import { YamalStats } from './types/stats';
import { getFilteredStats } from './lib/queries/getFilteredStats';

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<{
    allTime: YamalStats | null;
    club: YamalStats | null;
    intl: YamalStats | null;
    championsLeague: YamalStats | null;
    Liga: YamalStats | null;
    Copa: YamalStats | null;
    euro: YamalStats | null;
  }>({
    allTime: null,
    club: null,
    intl: null,
    championsLeague: null,
    Liga: null,
    Copa: null,
    euro: null,
  });

  useEffect(() => {
    const filterParams =
      selectedFilter?.type === 'season'
        ? { season: String(selectedFilter.value) }
        : selectedFilter?.type === 'year'
        ? { year: Number(selectedFilter.value) }
        : {};

    const queries = [
      { key: 'allTime', args: { ...filterParams } },
      { key: 'club', args: { type: 'Club', ...filterParams } },
      { key: 'intl', args: { type: 'International', ...filterParams } },
      { key: 'championsLeague', args: { competition: 'Champions Lg', ...filterParams } },
      { key: 'Liga', args: { competition: 'La Liga', ...filterParams } },
      { key: 'Copa', args: { competition: 'Copa del Rey', ...filterParams } },
      { key: 'euro', args: { competition: 'UEFA Euro', ...filterParams } },
    ] as const;

    getFilteredStats(queries).then((result) => {
      setStats(result as {
        allTime: YamalStats | null;
        club: YamalStats | null;
        intl: YamalStats | null;
        championsLeague: YamalStats | null;
        Liga: YamalStats | null;
        Copa: YamalStats | null;
        euro: YamalStats | null;
      });
    });
  }, [selectedFilter]);

  const seasons = ['2022/23', '2023/24', '2024/25'];
  const years = [2023, 2024, 2025];

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        {selectedFilter
          ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} Stats`
          : 'All-Time Stats'}
      </h1>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {stats.allTime && (
        <StatsCard
          title="Career Stats"
          subtitle="Excluding club friendlies"
          {...stats.allTime}
        />
      )}
      {stats.club && (
        <StatsCard title="Club Stats" subtitle="Excluding friendlies" {...stats.club} />
      )}
      {stats.Liga && <StatsCard title="La Liga Stats" {...stats.Liga} />}
      {stats.Copa && <StatsCard title="CDR Stats" {...stats.Copa} />}
      {stats.championsLeague && (
        <StatsCard title="UEFA Champions League Stats" {...stats.championsLeague} />
      )}
      {stats.intl && <StatsCard title="International Stats" {...stats.intl} />}
      {stats.euro && <StatsCard title="EURO Stats" {...stats.euro} />}
    </div>
  );
}
