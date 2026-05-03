import { createHash } from 'crypto';
import { createSupabaseServiceClient } from '../supabaseServer';
import { HomeAIInsight, HomeInsightContext } from './types';

type GeneratedInsightPayload = {
  headline: string;
  summary: string;
  bullets: string[];
  sources: Array<{
    title: string;
    url: string;
    source: string;
  }>;
};

const DEFAULT_MODEL = 'gpt-5.4-mini';

function getModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

function getInputFingerprint(context: HomeInsightContext): string {
  return createHash('sha256')
    .update(JSON.stringify(context))
    .digest('hex');
}

function buildPrompt(context: HomeInsightContext): string {
  const articles = context.articles.map((article, index) => (
    `${index + 1}. ${article.title}${article.excerpt ? ` — ${article.excerpt}` : ''} (${article.source}) ${article.canonical_url}`
  )).join('\n');

  return [
    'Generate a concise homepage AI insight for Yamalverse.',
    'Primary goal: tell visitors what is interesting about Lamine Yamal right now.',
    'Prioritize recent source articles, current-state context, last logged match context, and fixture/news angles over career statistics.',
    'Do not make the summary a career stat recap. Do not mention all-time Barcelona or Spain totals in the summary.',
    'Only mention goals/assists in the summary if the latest logged match had a notable event such as a goal, assist, multiple contributions, red card, injury/news item, or clear fixture implication.',
    'Use only the provided context. Do not invent injuries, fixtures, transfers, or availability claims.',
    'If recent news is thin, write a short current-state note using the latest logged match and say source coverage is limited.',
    'Return JSON only with this shape: {"headline": string, "summary": string, "bullets": string[], "sources": [{"title": string, "url": string, "source": string}]}',
    'Constraints: headline <= 90 chars, summary <= 280 chars, 2-3 bullets, each bullet <= 150 chars.',
    'Style: crisp football briefing, no hype, no generic praise, no all-time stat dump.',
    '',
    `Recent source articles, highest priority:\n${articles || 'No recent source articles available.'}`,
    '',
    `Latest match and background stats, secondary priority:\n${context.statsSummary}`,
    '',
    `Knowledge snippets:\n${context.knowledgeSnippets.map((snippet) => `- ${snippet}`).join('\n')}`,
  ].join('\n');
}

function parseOpenAIJsonResponse(payload: unknown): GeneratedInsightPayload {
  const response = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  const text = response.output_text
    ?? response.output?.flatMap((item) => item.content ?? []).map((content) => content.text).filter(Boolean).join('\n')
    ?? '';

  if (!text) {
    throw new Error('OpenAI response did not include text output.');
  }

  const parsed = JSON.parse(text) as GeneratedInsightPayload;
  if (
    typeof parsed.headline !== 'string'
    || typeof parsed.summary !== 'string'
    || !Array.isArray(parsed.bullets)
    || parsed.bullets.length < 2
    || parsed.bullets.length > 3
    || !Array.isArray(parsed.sources)
  ) {
    throw new Error('OpenAI response failed insight validation.');
  }

  return {
    headline: parsed.headline,
    summary: parsed.summary,
    bullets: parsed.bullets.map(String).slice(0, 3),
    sources: parsed.sources
      .filter((source) => source.title && source.url && source.source)
      .slice(0, 4),
  };
}

async function callOpenAI(context: HomeInsightContext): Promise<GeneratedInsightPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      input: buildPrompt(context),
      text: {
        format: {
          type: 'json_schema',
          name: 'home_ai_insight',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              headline: { type: 'string' },
              summary: { type: 'string' },
              bullets: {
                type: 'array',
                minItems: 2,
                maxItems: 3,
                items: { type: 'string' },
              },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                    source: { type: 'string' },
                  },
                  required: ['title', 'url', 'source'],
                },
              },
            },
            required: ['headline', 'summary', 'bullets', 'sources'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed: ${response.status} ${errorText}`);
  }

  return parseOpenAIJsonResponse(await response.json());
}

export async function generateAndStoreHomeInsight(context: HomeInsightContext): Promise<HomeAIInsight> {
  const supabase = createSupabaseServiceClient();
  const generated = await callOpenAI(context);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  const record = {
    surface: 'home',
    headline: generated.headline,
    summary: generated.summary,
    bullets: generated.bullets,
    sources: generated.sources,
    generated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'success',
    model: getModel(),
    input_fingerprint: getInputFingerprint(context),
    error_message: null,
  };

  const { data, error } = await supabase
    .from('ai_insights')
    .insert(record)
    .select('*')
    .single<HomeAIInsight>();

  if (error) {
    throw new Error(`Failed to store home insight: ${error.message}`);
  }

  return data;
}

export async function storeHomeInsightError(errorMessage: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();

  await supabase.from('ai_insights').insert({
    surface: 'home',
    headline: 'AI insight generation failed',
    summary: 'The scheduled insight job failed before a public update was created.',
    bullets: [],
    sources: [],
    generated_at: now.toISOString(),
    expires_at: now.toISOString(),
    status: 'error',
    model: getModel(),
    error_message: errorMessage,
  });
}
