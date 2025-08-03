'use client';

import { useEffect, useState } from 'react';
import { Per90Stats } from '../types/stats';
import { getPer90Stats } from '../lib/queries/getPer90Stats'; // you’ll create this
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';

export default function Per90Page() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<{
    Liga: Per90Stats | null;
    Copa: Per90Stats | null;
    championsLeague: Per90Stats | null;
    SpanishSuperCup: Per90Stats | null;
    EURO: Per90Stats | null;
  }>({
    Liga: null,
    Copa: null,
    championsLeague: null,
    SpanishSuperCup: null,
    EURO: null,
  });

  useEffect(() => {
    const filterParams =
      selectedFilter?.type === 'season'
        ? { season: String(selectedFilter.value) }
        : selectedFilter?.type === 'year'
        ? { year: Number(selectedFilter.value) }
        : {};

    const queries = [
      { key: 'Liga', args: { competition: 'La Liga', ...filterParams } },
      { key: 'Copa', args: { competition: 'Copa del Rey', ...filterParams } },
      { key: 'championsLeague', args: { competition: 'Champions Lg', ...filterParams } },
      { key: 'SpanishSuperCup', args: { competition: 'Supercopa de Espana', ...filterParams } },
      { key: 'EURO', args: { competition: 'UEFA Euro', ...filterParams } },
    ] as const;

    getPer90Stats(queries).then(setStats);
  }, [selectedFilter]);

  const seasons = ['2022/23', '2023/24', '2024/25'];
  const years = [2023, 2024, 2025];

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        {selectedFilter
          ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} Per 90 Stats`
          : 'All-Time Per 90 Stats'}
      </h1>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {stats.Liga && (() => {
  const s = stats.Liga;
  return (
    <StatsCard
      title="La Liga Per 90"
      appearances={s.appearances}
      assists={s.assists_per90}
      goals={s.goals_per90}
      contributions={s.ga_per90}
    />
  );
})()}

{stats.Copa && (() => {
  const s = stats.Copa;
  return (
    <StatsCard
      title="Copa del Rey Per 90"
      appearances={s.appearances}
      assists={s.assists_per90}
      goals={s.goals_per90}
      contributions={s.ga_per90}
    />
  );
})()}

{stats.championsLeague && (() => {
  const s = stats.championsLeague;
  return (
    <StatsCard
      title="UCL Per 90"
      appearances={s.appearances}
      assists={s.assists_per90}
      goals={s.goals_per90}
      contributions={s.ga_per90}
    />
  );
})()}

{stats.SpanishSuperCup && (() => {
  const s = stats.SpanishSuperCup;
  return (
    <StatsCard
      title="Spanish SuperCup Per 90"
      appearances={s.appearances}
      assists={s.assists_per90}
      goals={s.goals_per90}
      contributions={s.ga_per90}
    />
  );
})()}

{stats.EURO && (() => {
  const s = stats.EURO;
  return (
    <StatsCard
      title="UEFA EURO Per 90"
      appearances={s.appearances}
      assists={s.assists_per90}
      goals={s.goals_per90}
      contributions={s.ga_per90}
    />
  );
})()}

    </div>
  );
}
