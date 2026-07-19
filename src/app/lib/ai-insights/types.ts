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
