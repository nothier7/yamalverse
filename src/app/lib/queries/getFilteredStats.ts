import { getAllTimeStats } from './getStats';
import { YamalStats } from '../../types/stats';

type StatQuery<K extends string = string> = {
  key: K;
  args: Parameters<typeof getAllTimeStats>[0];
};

export async function getFilteredStats<
  const T extends readonly StatQuery<string>[]
>(
  queries: T
): Promise<{ [K in T[number]['key']]: YamalStats | null }> {
  const results = await Promise.all(
    queries.map((q) => getAllTimeStats(q.args))
  );

  const output = {} as { [K in T[number]['key']]: YamalStats | null };

  queries.forEach((q, i) => {
    // Type-safe assignment using keyof
    (output as Record<string, YamalStats | null>)[q.key] = results[i];
  });

  return output;
}
