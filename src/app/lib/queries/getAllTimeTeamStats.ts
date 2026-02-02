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

export async function getAllTimeTeamStats(team: string): Promise<TeamCareerStats | null> {
  const { data, error } = await supabase
    .from('yamal_matches')
    .select('goals, assists, take_ons_successful, motm')
    .eq('team', team);

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
    team,
    appearances: rows.length,
    goals,
    assists,
    dribbles,
    motm,
  };
}
