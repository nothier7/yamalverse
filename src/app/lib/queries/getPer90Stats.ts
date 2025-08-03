import createClient from '../supabaseClient';

export async function getPer90Stats<
  T extends readonly { key: string; args: any }[]
>(queries: T): Promise<Record<T[number]['key'], any>> {
  const supabase = createClient;
  const results: Record<string, any> = {};

  await Promise.all(
    queries.map(async ({ key, args }) => {
      const { data } = await supabase.rpc('get_goals_assists_per90', {
        season_input: args.season || null,
        year_input: args.year || null,
        competition_input: args.competition,
      });

      results[key] = data?.[0] ?? null;
    })
  );

  return results as any;
}
