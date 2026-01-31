'use client';

import { useEffect, useState } from 'react';
import StatsFilterBar from '../components/StatsFilterBar';
import StatBox from '../components/ui/StatBox';
import { getMotmStats } from '../lib/queries/getMotmStats';
import { MotmCompetitionStats } from '../types/stats';

// Hoist static constants outside component (rendering-hoist-jsx)
const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
const years = [2023, 2024, 2025, 2026];
const noteText = '! We use WhoScored MOTM data as a standard source.';

const COMPETITION_TITLES: Record<string, string> = {
  'La Liga': 'La Liga',
  'Copa del Rey': 'Copa del Rey',
  'Champions Lg': 'Champions League',
  'Supercopa de Espana': 'Spanish Super Cup',
  'UEFA Euro Qualifying': 'EURO Qualifiers',
  'UEFA Euro': 'EURO',
  'Friendlies (M)': 'Friendlies',
  'UEFA Nations League': 'Nations League',
  'World Cup': 'World Cup',
};

function MotmStatsCard({ title, stats }: { title: string; stats: MotmCompetitionStats }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/65 px-8 py-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatBox label="MOTM Awards" value={stats.motmCount} />
        <StatBox label="MOTM Share" value={`${stats.motmPercent.toFixed(1)}%`} />
      </div>
    </div>
  );
}

export default function MotmPageClient() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<MotmCompetitionStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filterParams =
      selectedFilter?.type === 'season'
        ? { season: String(selectedFilter.value) }
        : selectedFilter?.type === 'year'
        ? { year: Number(selectedFilter.value) }
        : {};

    setLoading(true);
    setError(null);

    getMotmStats(filterParams)
      .then((result) => {
        if (!result) {
          setStats([]);
          setError('Failed to load MOTM stats. Please try again.');
          return;
        }
        setStats(result);
      })
      .catch((err) => {
        console.error('Error fetching MOTM stats:', err);
        setStats([]);
        setError('Failed to load MOTM stats. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedFilter]);

  const title = selectedFilter
    ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} MOTM Awards`
    : 'All-Time MOTM Awards';

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-xs text-white/60">{noteText}</p>
      </div>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {loading && (
        <div className="text-neutral-300" aria-live="polite">Loading MOTM stats…</div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-400/40 p-4 rounded-lg text-red-100">
          {error}
        </div>
      )}

      {stats.length > 0 && !loading && !error && (
        <div className="flex flex-wrap justify-center gap-4">
          {stats.map((stat) => (
            <MotmStatsCard
              key={stat.competition}
              title={
                stat.competition === 'All Competitions'
                  ? stat.competition
                  : COMPETITION_TITLES[stat.competition] || stat.competition
              }
              stats={stat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
