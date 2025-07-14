import supabase from '../supabaseClient';

export async function getAllTimeStats(filter?: {
  type?: string;
  competition?: string;
  season?: string;
  year?: number;
}) {
  let query = supabase.from('yamal_matches').select('*');

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.competition) {
    query = query.eq('competition', filter.competition);
  }

  if (filter?.season) {
    query = query.eq('season', filter.season);
  }

  if (filter?.year) {
    query = query.eq('year', filter.year);
  }

  const { data, error } = await query;

  if (error || !data) return null;

  const appearances = data.length;
  const goals = data.reduce((sum, row) => sum + row.goals, 0);
  const assists = data.reduce((sum, row) => sum + row.assists, 0);
  const contributions = goals + assists;
  const minutes = data.reduce((sum, row) => sum + row.minutes, 0);

  return {
    appearances,
    assists,
    goals,
    contributions,
    minutesPerGoal: goals > 0 ? Math.round(minutes / goals) : 0,
    minutesPerContribution: contributions > 0 ? Math.round(minutes / contributions) : 0
  };
}
