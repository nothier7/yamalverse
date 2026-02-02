import supabase from '../supabaseClient';

export type RecentMatchRow = {
  id: number;
  date: string;
  competition: string | null;
  location: string | null;
  team: string | null;
  opponent: string | null;
  result_score: string | null;
  result_outcome: string | null;
  goals: number | null;
  assists: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  rating: number | string | null;
};

const RECENT_MATCH_FIELDS = [
  'id',
  'date',
  'competition',
  'location',
  'team',
  'opponent',
  'result_score',
  'result_outcome',
  'goals',
  'assists',
  'yellow_cards',
  'red_cards',
  'rating',
].join(', ');

export async function getRecentMatches(limit = 5): Promise<RecentMatchRow[] | null> {
  const { data, error } = await supabase
    .from('yamal_matches')
    .select(RECENT_MATCH_FIELDS)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent matches:', error);
    return null;
  }

  return (data || []) as RecentMatchRow[];
}
