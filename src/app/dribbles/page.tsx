'use client';

import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import StatsFilterBar from '../components/StatsFilterBar';
import DribblesCard from '../components/DribblesCard';

type DribbleStats = {
  competition: string;
  dribbles_completed: number;
  dribbles_attempted: number;
  dribbles_per_90: number;
  success_rate: number;
};

type RecordType = {
  take_ons_successful: number;
  opponent: string;
  competition: string;
} | null;

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

// Hoist static constants outside component (rendering-hoist-jsx)
const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
const years = [2023, 2024, 2025, 2026];

export default function DribblesPage() {

  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [dribbles, setDribbles] = useState<DribbleStats[]>([]);
  const [record, setRecord] = useState<RecordType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        season_input: selectedFilter?.type === 'season' ? String(selectedFilter.value) : null,
        year_input: selectedFilter?.type === 'year' ? Number(selectedFilter.value) : null,
      };

      const { data: dribbleStats, error: dribbleError } = await supabase.rpc('get_dribbles_by_competition', params);
      const { data: recordData, error: recordError } = await supabase.rpc('get_dribble_record_game', params);

      // Handle errors from RPC calls
      if (dribbleError) {
        console.error('Error fetching dribble stats:', dribbleError);
        throw new Error(`Failed to load dribble stats: ${dribbleError.message || 'Unknown error'}`);
      }
      
      if (recordError) {
        console.error('Error fetching dribble record:', recordError);
        // Record error is non-critical, so we log but don't throw
        // We'll just show dribble stats without the record
      }

      // Combine filter and reduce into single iteration (js-combine-iterations)
      const allStats = dribbleStats || [];
      const filteredStats: DribbleStats[] = [];
      let totalCompleted = 0;
      let totalAttempted = 0;
      let totalMinutes = 0;

      for (const stat of allStats) {
        if (stat.dribbles_attempted > 0) {
          filteredStats.push(stat);
          totalCompleted += stat.dribbles_completed;
          totalAttempted += stat.dribbles_attempted;
          totalMinutes += stat.dribbles_completed / (stat.dribbles_per_90 || 1) * 90;
        }
      }

      const total = {
        dribbles_completed: totalCompleted,
        dribbles_attempted: totalAttempted,
        total_minutes: totalMinutes,
      };

      const totalCard: DribbleStats = {
        competition: 'All Competitions',
        dribbles_completed: total.dribbles_completed,
        dribbles_attempted: total.dribbles_attempted,
        dribbles_per_90: total.total_minutes
          ? parseFloat((total.dribbles_completed / total.total_minutes * 90).toFixed(2))
          : 0,
        success_rate: total.dribbles_attempted
          ? parseFloat((total.dribbles_completed / total.dribbles_attempted * 100).toFixed(1))
          : 0,
      };

      setDribbles([totalCard, ...filteredStats]);
      setRecord(recordData?.[0] || null);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dribble stats. Please try again.';
      setError(errorMessage);
      setLoading(false);
      // Clear data on error
      setDribbles([]);
      setRecord(null);
      throw err; // Re-throw so the catch handler in useEffect can also handle it
    }
  };

  useEffect(() => {
    fetchData().catch((err) => {
      console.error('Error fetching dribble data:', err);
      setError('Failed to load dribble stats. Please try again.');
      setLoading(false);
    });
  }, [selectedFilter]);

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        {selectedFilter
          ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'} Dribble Stats`
          : 'All-Time Dribble Stats'}
      </h1>

      <StatsFilterBar
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
        availableSeasons={seasons}
        availableYears={years}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-400/40 p-4 rounded-lg text-red-100 max-w-md w-full">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-neutral-300" aria-live="polite">Loading dribble stats…</div>
      )}

      {record && (
        <div className="bg-yellow-100/10 border-l-4 border-yellow-500 p-4 rounded-lg text-white max-w-md w-full shadow">
          <h2 className="text-lg font-semibold mb-1">🔥 Most Dribbles in a Game</h2>
          <p className="text-sm">
            {record.take_ons_successful} vs {record.opponent} ({record.competition})
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {dribbles.map((comp, i) => (
          <DribblesCard
            key={i}
            title={
              comp.competition === 'All Competitions'
                ? comp.competition
                : COMPETITION_TITLES[comp.competition] || comp.competition
            }
            {...comp}
          />
        ))}
      </div>
    </div>
  );
}
