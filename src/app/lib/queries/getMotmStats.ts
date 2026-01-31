import supabase from '../supabaseClient';
import { MotmCompetitionStats } from '../../types/stats';

type MotmFilter = {
  season?: string;
  year?: number;
};

const COMPETITION_ORDER = [
  'La Liga',
  'Copa del Rey',
  'Champions Lg',
  'Supercopa de Espana',
  'UEFA Euro',
  'UEFA Euro Qualifying',
  'UEFA Nations League',
  'Friendlies (M)',
  'World Cup',
];

const ALL_COMPETITIONS = 'All Competitions';

type MotmRow = {
  competition: string | null;
  motm: boolean | null;
};

function buildStats(competition: string, motmCount: number, totalGames: number): MotmCompetitionStats {
  return {
    competition,
    motmCount,
    totalGames,
    motmPercent: totalGames > 0 ? Number(((motmCount / totalGames) * 100).toFixed(1)) : 0,
  };
}

export async function getMotmStats(filter: MotmFilter = {}): Promise<MotmCompetitionStats[] | null> {
  let query = supabase.from('yamal_matches').select('competition, motm');

  if (filter.season) {
    query = query.eq('season', filter.season);
  }

  if (filter.year) {
    query = query.eq('year', filter.year);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching MOTM stats:', error);
    return null;
  }

  const rows = (data || []) as MotmRow[];
  const competitionMap = new Map<string, { motmCount: number; totalGames: number }>();
  let totalMotm = 0;

  for (const row of rows) {
    const competition = row.competition || 'Other';
    const entry = competitionMap.get(competition) || { motmCount: 0, totalGames: 0 };

    entry.totalGames += 1;
    if (row.motm) {
      entry.motmCount += 1;
      totalMotm += 1;
    }

    competitionMap.set(competition, entry);
  }

  const competitionStats = Array.from(competitionMap.entries()).map(([competition, stats]) =>
    buildStats(competition, stats.motmCount, stats.totalGames)
  );

  competitionStats.sort((a, b) => {
    const aIndex = COMPETITION_ORDER.indexOf(a.competition);
    const bIndex = COMPETITION_ORDER.indexOf(b.competition);

    if (aIndex === -1 && bIndex === -1) {
      return a.competition.localeCompare(b.competition);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const summary = buildStats(ALL_COMPETITIONS, totalMotm, rows.length);

  return [summary, ...competitionStats];
}
