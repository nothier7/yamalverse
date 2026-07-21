import { createSupabaseServiceClient } from '../supabaseServer.ts';
import type { HomeAIInsight } from './types.ts';
import {
  parseAndValidateWebInsight,
  WebInsightValidationError,
} from './webInsight.ts';
import type {
  InsightAngle,
  ValidatedWebInsight,
  WebInsightValidationCode,
} from './webInsight.ts';

const DEFAULT_MODEL = 'gpt-5.6';
const INSIGHT_TTL_MS = 12 * 60 * 60 * 1000;
const OPENAI_ATTEMPT_TIMEOUT_MS = 50_000;

function getModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

const RETRY_REASON_LABELS: Record<WebInsightValidationCode, string> = {
  response_format: 'structured response formatting',
  search_required: 'required web-search use',
  source_grounding: 'exact source URL grounding',
  editorial: 'editorial quality validation',
  match_safety: 'completed-match result validation',
};

export function buildWebInsightPrompt(
  now = new Date(),
  retryReason?: WebInsightValidationCode
): string {
  const prompt = [
    'Create today\'s homepage AI Insight for Yamalverse, a site dedicated to Lamine Yamal.',
    `Current UTC time: ${now.toISOString()}.`,
    '',
    'Research before writing. Use web search to find and compare credible, current sources about Lamine Yamal.',
    'Search across these possible windows and choose exactly one strongest editorial angle:',
    '1. A significant performance or consequence from a match completed in the last 36 hours.',
    '2. A meaningful angle for a match expected in the next seven days: a first final, possible record, major matchup, reunion, personal connection, milestone, or comparable significance.',
    '3. Another material current development: availability, injury, award, interview, contract, tactical role, or major event.',
    '4. If no meaningful well-sourced angle exists, publish a concise limited-update briefing without filler.',
    '',
    'Editorial rules:',
    '- Answer why this is interesting now. Do not summarize Yamal\'s career or repeat the stat cards already shown elsewhere on the site.',
    '- A statistic is allowed only when it explains the significance of the selected current event, such as a record he could break in an upcoming final.',
    '- Do not force a routine match appearance ahead of a more important current story.',
    '- Use a crisp, informed football-briefing tone. Avoid hype, generic praise, speculation, clickbait, and unsupported implications.',
    '- Headline: at most 90 characters. Summary: at most 280 characters. Return two or three bullets, each at most 150 characters.',
    '',
    'Evidence rules:',
    '- Prefer club, competition, federation, direct-interview, and other primary sources; then established reporting.',
    '- Do not rely on social posts, fan sites, Wikipedia, search-result snippets, or unsourced aggregators.',
    '- Every material factual sentence in the published headline, summary, or bullets must appear verbatim as an evidence.claim and cite one or more URLs you actually used.',
    '- Include one to four sources. Every source and evidence URL must be an exact URL returned by web search.',
    '- Never guess, reconstruct, or manually type a source URL. Copy the exact URL from this response\'s web search results.',
    '- If sources conflict or evidence is ambiguous, omit the disputed claim.',
    '',
    'Match-result safety rules:',
    '- Never infer a win or loss from an unlabeled score.',
    '- For every completed match result mentioned, include one match_facts entry. team is Yamal\'s team; team_score is that team\'s score; outcome is from that team\'s perspective.',
    '- Check that outcome agrees mathematically with team_score and opponent_score before writing.',
    '- If the selected angle is not a completed match, match_facts may be empty.',
    '',
    'Return only the required structured response. Do not add markdown or commentary.',
  ];

  if (retryReason) {
    prompt.push(
      '',
      'Corrective retry:',
      `- The previous response failed ${RETRY_REASON_LABELS[retryReason]}. Start the research again.`,
      '- Use only exact URLs returned by this attempt\'s web search. Do not reuse, infer, repair, redirect, or reconstruct any prior URL.',
      '- Recheck every structured field against the rules before returning the response.'
    );
  }

  return prompt.join('\n');
}

export function buildOpenAIRequestBody(
  now = new Date(),
  retryReason?: WebInsightValidationCode
) {
  return {
    model: getModel(),
    reasoning: {
      effort: 'low',
    },
    tools: [{
      type: 'web_search',
      search_context_size: 'medium',
    }],
    tool_choice: 'required',
    include: ['web_search_call.action.sources'],
    input: buildWebInsightPrompt(now, retryReason),
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: 'home_ai_insight',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            angle_type: {
              type: 'string',
              enum: ['recent_match', 'upcoming_match', 'current_news', 'limited_update'],
            },
            headline: { type: 'string', maxLength: 90 },
            summary: { type: 'string', maxLength: 280 },
            bullets: {
              type: 'array',
              minItems: 2,
              maxItems: 3,
              items: { type: 'string', maxLength: 150 },
            },
            sources: {
              type: 'array',
              minItems: 1,
              maxItems: 4,
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
            evidence: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  claim: { type: 'string' },
                  source_urls: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' },
                  },
                },
                required: ['claim', 'source_urls'],
              },
            },
            match_facts: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  team: { type: 'string' },
                  opponent: { type: 'string' },
                  team_score: { type: 'integer', minimum: 0 },
                  opponent_score: { type: 'integer', minimum: 0 },
                  outcome: { type: 'string', enum: ['win', 'draw', 'loss'] },
                  source_urls: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' },
                  },
                },
                required: [
                  'team',
                  'opponent',
                  'team_score',
                  'opponent_score',
                  'outcome',
                  'source_urls',
                ],
              },
            },
          },
          required: [
            'angle_type',
            'headline',
            'summary',
            'bullets',
            'sources',
            'evidence',
            'match_facts',
          ],
        },
      },
    },
  };
}

async function callOpenAI(
  now: Date,
  apiKey: string,
  fetchImpl: typeof fetch,
  retryReason?: WebInsightValidationCode
): Promise<ValidatedWebInsight> {
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildOpenAIRequestBody(now, retryReason)),
    signal: AbortSignal.timeout(OPENAI_ATTEMPT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = (await response.text()).slice(0, 2_000);
    throw new Error(`OpenAI generation failed: ${response.status} ${errorText}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WebInsightValidationError(
      'response_format',
      'OpenAI response body was not valid JSON.'
    );
  }

  return parseAndValidateWebInsight(payload);
}

export type GenerateValidatedWebInsightOptions = {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  now?: Date;
};

export type ValidatedWebInsightGeneration = {
  insight: ValidatedWebInsight;
  attemptCount: number;
};

export async function generateValidatedWebInsight(
  options: GenerateValidatedWebInsightOptions = {}
): Promise<ValidatedWebInsightGeneration> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY.');

  const now = options.now ?? new Date();
  const fetchImpl = options.fetchImpl ?? fetch;
  let retryReason: WebInsightValidationCode | undefined;

  for (let attemptCount = 1; attemptCount <= 2; attemptCount += 1) {
    try {
      return {
        insight: await callOpenAI(now, apiKey, fetchImpl, retryReason),
        attemptCount,
      };
    } catch (error) {
      if (attemptCount === 1 && error instanceof WebInsightValidationError) {
        retryReason = error.code;
        console.warn('Retrying AI insight after response validation failure:', error.code);
        continue;
      }
      throw error;
    }
  }

  throw new Error('OpenAI insight generation exhausted its validation attempts.');
}

export type HomeInsightGenerationResult = {
  insight: HomeAIInsight;
  angleType: InsightAngle;
  sourceCount: number;
  attemptCount: number;
};

export async function generateAndStoreHomeInsight(): Promise<HomeInsightGenerationResult> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  const generation = await generateValidatedWebInsight({ now });
  const generated = generation.insight;
  const expiresAt = new Date(now.getTime() + INSIGHT_TTL_MS);

  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      surface: 'home',
      headline: generated.headline,
      summary: generated.summary,
      bullets: generated.bullets,
      sources: generated.sources,
      generated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'success',
      model: getModel(),
      input_fingerprint: null,
      error_message: null,
    })
    .select('*')
    .single<HomeAIInsight>();

  if (error) throw new Error(`Failed to store home insight: ${error.message}`);

  return {
    insight: data,
    angleType: generated.angleType,
    sourceCount: generated.sources.length,
    attemptCount: generation.attemptCount,
  };
}

export async function storeHomeInsightError(errorMessage: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();

  const { error } = await supabase.from('ai_insights').insert({
    surface: 'home',
    headline: 'AI insight generation failed',
    summary: 'The scheduled insight job failed before a public update was created.',
    bullets: [],
    sources: [],
    generated_at: now.toISOString(),
    expires_at: now.toISOString(),
    status: 'error',
    model: getModel(),
    input_fingerprint: null,
    error_message: errorMessage.slice(0, 2_000),
  });

  if (error) throw new Error(`Failed to store home insight error: ${error.message}`);
}
