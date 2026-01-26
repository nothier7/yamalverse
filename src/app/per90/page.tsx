'use client';

import { useEffect, useState } from 'react';
import { Per90Stats } from '../types/stats';
import { getPer90Stats } from '../lib/queries/getPer90Stats';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';

// Hoist static constants outside component (rendering-hoist-jsx)
const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
const years = [2023, 2024, 2025, 2026];

// Extract Per90StatsCard to avoid IIFE pattern (rendering-hoist-jsx)
function Per90StatsCard({ title, stats }: { title: string; stats: Per90Stats }) {
  return (
    <StatsCard
      title={title}
      appearances={stats.appearances}
      assists={stats.assists_per90}
      goals={stats.goals_per90}
      contributions={stats.ga_per90}
    />
  );
}

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

      {/* Use explicit ternary for conditional rendering (rendering-conditional-render) */}
      {stats.Liga ? <Per90StatsCard title="La Liga Per 90" stats={stats.Liga} /> : null}
      {stats.Copa ? <Per90StatsCard title="Copa del Rey Per 90" stats={stats.Copa} /> : null}
      {stats.championsLeague ? <Per90StatsCard title="UCL Per 90" stats={stats.championsLeague} /> : null}
      {stats.SpanishSuperCup ? <Per90StatsCard title="Spanish SuperCup Per 90" stats={stats.SpanishSuperCup} /> : null}
      {stats.EURO ? <Per90StatsCard title="UEFA EURO Per 90" stats={stats.EURO} /> : null}
    </div>
  );
}
