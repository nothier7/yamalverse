'use client';

import { useEffect, useState } from 'react';
import createClient from '../lib/supabaseClient';
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

export default function DribblesPage() {
  const supabase = createClient;

  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [dribbles, setDribbles] = useState<DribbleStats[]>([]);
  const [record, setRecord] = useState<RecordType>(null);

  const fetchData = async () => {
    const params = {
      season_input: selectedFilter?.type === 'season' ? String(selectedFilter.value) : null,
      year_input: selectedFilter?.type === 'year' ? Number(selectedFilter.value) : null,
    };

    const { data: dribbleStats } = await supabase.rpc('get_dribbles_by_competition', params);
    const { data: recordData } = await supabase.rpc('get_dribble_record_game', params);

    const filteredStats = (dribbleStats || []).filter(
      (stat: DribbleStats) => stat.dribbles_attempted > 0
    );

    const total = filteredStats.reduce(
      (
        acc: { dribbles_completed: number; dribbles_attempted: number; total_minutes: number },
        curr: DribbleStats
      ) => {
        acc.dribbles_completed += curr.dribbles_completed;
        acc.dribbles_attempted += curr.dribbles_attempted;
        acc.total_minutes += curr.dribbles_completed / (curr.dribbles_per_90 || 1) * 90;
        return acc;
      },
      {
        dribbles_completed: 0,
        dribbles_attempted: 0,
        total_minutes: 0,
      }
    );

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
  };

  useEffect(() => {
    fetchData();
  }, [selectedFilter]);

  const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
  const years = [2023, 2024, 2025];

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
