export type NewsArticle = {
  id?: string;
  source: string;
  source_url: string;
  canonical_url: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  ingested_at?: string;
  matched_terms: string[];
  raw_metadata: Record<string, unknown>;
};

export type AIInsightSource = {
  title: string;
  url: string;
  source: string;
};

export type HomeAIInsight = {
  id?: string;
  surface: 'home';
  headline: string;
  summary: string;
  bullets: string[];
  sources: AIInsightSource[];
  generated_at: string;
  expires_at: string;
  status: 'success' | 'error';
  model: string | null;
  input_fingerprint: string | null;
  error_message: string | null;
};

export type HomeInsightContext = {
  articles: NewsArticle[];
  statsSummary: string;
  knowledgeSnippets: string[];
};
