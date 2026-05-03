import { createSupabaseServiceClient } from '../supabaseServer';
import { NEWS_SOURCES } from './newsSources';
import { fetchSportingNewsArticles } from './sportingNewsAdapter';
import { NewsArticle } from './types';

type IngestResult = {
  fetched: number;
  stored: number;
  articles: NewsArticle[];
  errors: string[];
};

export async function ingestNews(): Promise<IngestResult> {
  const supabase = createSupabaseServiceClient();
  const errors: string[] = [];
  const fetchedArticles: NewsArticle[] = [];

  for (const source of NEWS_SOURCES) {
    if (!source.enabled) continue;

    try {
      if (source.id === 'sporting-news-barcelona') {
        fetchedArticles.push(...await fetchSportingNewsArticles(source));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ingest ${source.name}`;
      errors.push(message);
    }
  }

  if (fetchedArticles.length === 0) {
    return {
      fetched: 0,
      stored: 0,
      articles: [],
      errors,
    };
  }

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(fetchedArticles, { onConflict: 'canonical_url', ignoreDuplicates: false })
    .select('*')
    .returns<NewsArticle[]>();

  if (error) {
    throw new Error(`Failed to store ingested articles: ${error.message}`);
  }

  return {
    fetched: fetchedArticles.length,
    stored: data?.length ?? 0,
    articles: data ?? [],
    errors,
  };
}
