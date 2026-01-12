import supabase from '../supabaseClient';

type Per90Args = {
  season?: string | null;
  year?: number | null;
  competition?: string | null;
};

type Per90Result = {
  competition: string;
  appearances: number;
  goals_per90: number;
  assists_per90: number;
  ga_per90: number;
} | null;

export async function getPer90Stats<
  T extends readonly { key: string; args: Per90Args }[]
>(queries: T): Promise<Record<T[number]['key'], Per90Result>> {
  const results: Record<string, Per90Result> = {};

  await Promise.all(
    queries.map(async ({ key, args }) => {
      const { data, error } = await supabase.rpc('get_goals_assists_per90', {
        season_input: args.season || null,
        year_input: args.year || null,
        competition_input: args.competition || null,
      });

      if (error) {
        console.error(`Error fetching per90 stats for ${key}:`, error);
        results[key] = null;
        return;
      }

      results[key] = data?.[0] ?? null;
    })
  );

  return results;
}
