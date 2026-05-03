import { getAllTimeTeamStats } from '../queries/getAllTimeTeamStats';
import { getRecentMatches } from '../queries/getRecentMatches';
import supabase from '../supabaseClient';
import { HOME_KNOWLEDGE_SNIPPETS } from './knowledge';
import { HomeInsightContext, NewsArticle } from './types';

function summarizeRecentMatches(matches: Awaited<ReturnType<typeof getRecentMatches>>): string {
  if (!matches || matches.length === 0) return 'Recent match data is unavailable.';

  const latestMatch = matches[0];
  const latestLine = latestMatch
    ? `Latest logged match: ${latestMatch.date}: ${latestMatch.team ?? 'Team'} vs ${latestMatch.opponent ?? 'opponent'} in ${latestMatch.competition ?? 'competition'} (${latestMatch.result_score ?? 'score unavailable'}), ${latestMatch.goals ?? 0}G ${latestMatch.assists ?? 0}A.`
    : 'Latest logged match is unavailable.';

  const lines = matches.slice(1, 5).map((match) => {
    const goals = match.goals ?? 0;
    const assists = match.assists ?? 0;
    return `${match.date}: ${match.team ?? 'Team'} vs ${match.opponent ?? 'opponent'} in ${match.competition ?? 'competition'} (${match.result_score ?? 'score unavailable'}), ${goals}G ${assists}A.`;
  });

  return `${latestLine} Previous logged matches for context: ${lines.join(' ') || 'none available.'}`;
}

function summarizeCareerStats(
  barcelona: Awaited<ReturnType<typeof getAllTimeTeamStats>>,
  spain: Awaited<ReturnType<typeof getAllTimeTeamStats>>
): string {
  const club = barcelona
    ? `Barcelona: ${barcelona.appearances} apps, ${barcelona.goals} goals, ${barcelona.assists} assists, ${barcelona.dribbles} successful dribbles.`
    : 'Barcelona career stats unavailable.';
  const intl = spain
    ? `Spain: ${spain.appearances} apps, ${spain.goals} goals, ${spain.assists} assists, ${spain.dribbles} successful dribbles.`
    : 'Spain career stats unavailable.';

  return `Background career totals only, do not lead with these unless directly relevant: ${club} ${intl}`;
}

export async function getRecentYamalArticles(limit = 5): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('ingested_at', { ascending: false })
    .limit(limit)
    .returns<NewsArticle[]>();

  if (error) {
    console.error('Error fetching Yamal news articles:', error);
    return [];
  }

  return data ?? [];
}

export async function buildHomeInsightContext(): Promise<HomeInsightContext> {
  const [articles, recentMatches, barcelona, spain] = await Promise.all([
    getRecentYamalArticles(5),
    getRecentMatches(5),
    getAllTimeTeamStats({ label: 'Barcelona', type: 'Club' }),
    getAllTimeTeamStats({ label: 'Spain', type: 'International' }),
  ]);

  return {
    articles,
    statsSummary: `${summarizeCareerStats(barcelona, spain)} ${summarizeRecentMatches(recentMatches)}`,
    knowledgeSnippets: HOME_KNOWLEDGE_SNIPPETS,
  };
}
