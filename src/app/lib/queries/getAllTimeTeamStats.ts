import supabase from '../supabaseClient';

export type TeamCareerStats = {
  team: string;
  appearances: number;
  goals: number;
  assists: number;
  dribbles: number;
  motm: number;
};

type TeamRow = {
  goals?: number | null;
  assists?: number | null;
  take_ons_successful?: number | null;
  motm?: boolean | null;
};

export type TeamStatsFilter = {
  label: string;
  type?: 'Club' | 'International';
  team?: string;
  teams?: string[];
};

export async function getAllTimeTeamStats(filter: TeamStatsFilter): Promise<TeamCareerStats | null> {
  let query = supabase.from('yamal_matches').select('goals, assists, take_ons_successful, motm');

  if (filter.type) {
    query = query.eq('type', filter.type);
  }

  if (filter.teams && filter.teams.length > 0) {
    query = query.in('team', filter.teams);
  } else if (filter.team) {
    query = query.eq('team', filter.team);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching team stats:', error);
    return null;
  }

  const rows = (data || []) as TeamRow[];
  let goals = 0;
  let assists = 0;
  let dribbles = 0;
  let motm = 0;

  for (const row of rows) {
    goals += row.goals ?? 0;
    assists += row.assists ?? 0;
    dribbles += row.take_ons_successful ?? 0;
    if (row.motm) motm += 1;
  }

  return {
    team: filter.label,
    appearances: rows.length,
    goals,
    assists,
    dribbles,
    motm,
  };
}
