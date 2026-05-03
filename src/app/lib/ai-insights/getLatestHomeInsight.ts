import supabase from '../supabaseClient';
import { HomeAIInsight } from './types';

export type HomeInsightViewModel = HomeAIInsight & {
  isStale: boolean;
};

export async function getLatestHomeInsight(): Promise<HomeInsightViewModel | null> {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('surface', 'home')
    .eq('status', 'success')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle<HomeAIInsight>();

  if (error) {
    console.error('Error fetching latest home insight:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    isStale: new Date(data.expires_at).getTime() < Date.now(),
  };
}
