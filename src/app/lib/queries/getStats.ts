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

  if (error) {
    console.error('Error fetching stats:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Combine multiple iterations into single loop (js-combine-iterations)
  let goals = 0;
  let assists = 0;
  let minutes = 0;
  
  for (const row of data) {
    goals += row.goals;
    assists += row.assists;
    minutes += row.minutes;
  }

  const appearances = data.length;
  const contributions = goals + assists;

  return {
    appearances,
    assists,
    goals,
    contributions,
    minutesPerGoal: goals > 0 ? Math.round(minutes / goals) : 0,
    minutesPerContribution: contributions > 0 ? Math.round(minutes / contributions) : 0
  };
}
