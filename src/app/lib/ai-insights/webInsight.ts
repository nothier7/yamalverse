import type { AIInsightSource } from './types';

export type InsightAngle = 'recent_match' | 'upcoming_match' | 'current_news' | 'limited_update';

export type WebInsightValidationCode =
  | 'response_format'
  | 'search_required'
  | 'source_grounding'
  | 'editorial'
  | 'match_safety';

export class WebInsightValidationError extends Error {
  readonly code: WebInsightValidationCode;

  constructor(code: WebInsightValidationCode, message: string) {
    super(message);
    this.name = 'WebInsightValidationError';
    this.code = code;
  }
}

type EvidenceClaim = {
  claim: string;
  source_urls: string[];
};

type MatchFact = {
  team: string;
  opponent: string;
  team_score: number;
  opponent_score: number;
  outcome: 'win' | 'draw' | 'loss';
  source_urls: string[];
};

type GeneratedSource = {
  title: string;
  url: string;
  source: string;
};

type GeneratedWebInsight = {
  angle_type: InsightAngle;
  headline: string;
  summary: string;
  bullets: string[];
  sources: GeneratedSource[];
  evidence: EvidenceClaim[];
  match_facts: MatchFact[];
};

type SearchSource = {
  title: string;
  url: string;
};

export type ValidatedWebInsight = {
  angleType: InsightAngle;
  headline: string;
  summary: string;
  bullets: string[];
  sources: AIInsightSource[];
};

type OpenAIContent = {
  text?: unknown;
  annotations?: unknown;
};

type OpenAIOutputItem = {
  type?: unknown;
  status?: unknown;
  content?: unknown;
  action?: unknown;
};

type OpenAIResponse = {
  output_text?: unknown;
  output?: unknown;
  status?: unknown;
  incomplete_details?: unknown;
};

const TRACKING_PARAMETERS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'referrer',
]);

const CAREER_RECAP_PATTERNS = [
  /\b(?:career|all[- ]time)\b[^.]{0,80}\b(?:appearances?|goals?|assists?)\b/i,
  /\b(?:appearances?|goals?|assists?)\b[^.]{0,80}\b(?:career|all[- ]time)\b/i,
];

const GENERIC_PRAISE_PATTERNS = [
  /\bgenerational talent\b/i,
  /\bbright future\b/i,
  /\bcontinues? to impress\b/i,
  /\bone of (?:football['’]s|the) best\b/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function fail(code: WebInsightValidationCode, message: string): never {
  throw new WebInsightValidationError(code, message);
}

export function canonicalizeSearchUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || TRACKING_PARAMETERS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }

    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

function sourceLabel(value: string, url: string): string {
  const supplied = value.trim();
  if (supplied) return supplied.slice(0, 80);

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}

function parseSearchSource(value: unknown): SearchSource | null {
  if (!isRecord(value)) return null;
  const url = stringValue(value.url);
  const canonicalUrl = canonicalizeSearchUrl(url);
  if (!canonicalUrl) return null;

  return {
    title: stringValue(value.title),
    url,
  };
}

function collectSearchSources(items: OpenAIOutputItem[]): Map<string, SearchSource> {
  const sources = new Map<string, SearchSource>();

  const addSource = (value: unknown) => {
    const source = parseSearchSource(value);
    if (!source) return;
    const key = canonicalizeSearchUrl(source.url);
    if (!key) return;

    const existing = sources.get(key);
    sources.set(key, {
      title: source.title || existing?.title || '',
      url: source.url,
    });
  };

  for (const item of items) {
    if (isRecord(item.action) && Array.isArray(item.action.sources)) {
      item.action.sources.forEach(addSource);
    }

    if (!Array.isArray(item.content)) continue;
    for (const rawContent of item.content) {
      const content = rawContent as OpenAIContent;
      if (!Array.isArray(content.annotations)) continue;
      for (const annotation of content.annotations) {
        if (isRecord(annotation) && annotation.type === 'url_citation') addSource(annotation);
      }
    }
  }

  return sources;
}

function extractOutputText(response: OpenAIResponse, items: OpenAIOutputItem[]): string {
  const directText = stringValue(response.output_text);
  if (directText) return directText;

  return items
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((content) => isRecord(content) ? stringValue(content.text) : '')
    .filter(Boolean)
    .join('\n');
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) return null;
  return value.map((entry) => entry.trim()).filter(Boolean);
}

function parseGeneratedSource(value: unknown): GeneratedSource | null {
  if (!isRecord(value)) return null;
  const title = stringValue(value.title);
  const url = stringValue(value.url);
  const source = stringValue(value.source);
  if (!title || !url || !source) return null;
  return { title, url, source };
}

function parseEvidenceClaim(value: unknown): EvidenceClaim | null {
  if (!isRecord(value)) return null;
  const claim = stringValue(value.claim);
  const sourceUrls = parseStringArray(value.source_urls);
  if (!claim || !sourceUrls?.length) return null;
  return { claim, source_urls: sourceUrls };
}

function parseMatchFact(value: unknown): MatchFact | null {
  if (!isRecord(value)) return null;
  const team = stringValue(value.team);
  const opponent = stringValue(value.opponent);
  const sourceUrls = parseStringArray(value.source_urls);
  const outcome = value.outcome;

  if (
    !team
    || !opponent
    || !Number.isInteger(value.team_score)
    || !Number.isInteger(value.opponent_score)
    || !['win', 'draw', 'loss'].includes(String(outcome))
    || !sourceUrls?.length
  ) {
    return null;
  }

  return {
    team,
    opponent,
    team_score: Number(value.team_score),
    opponent_score: Number(value.opponent_score),
    outcome: outcome as MatchFact['outcome'],
    source_urls: sourceUrls,
  };
}

function parseGeneratedInsight(text: string): GeneratedWebInsight {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail('response_format', 'OpenAI response was not valid JSON.');
  }

  if (!isRecord(parsed)) fail('response_format', 'OpenAI response failed insight validation.');

  const angleType = parsed.angle_type;
  const headline = stringValue(parsed.headline);
  const summary = stringValue(parsed.summary);
  const bullets = parseStringArray(parsed.bullets);
  const rawSources = Array.isArray(parsed.sources) ? parsed.sources : [];
  const rawEvidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
  const rawMatchFacts = Array.isArray(parsed.match_facts) ? parsed.match_facts : [];
  const sources = rawSources.map(parseGeneratedSource);
  const evidence = rawEvidence.map(parseEvidenceClaim);
  const matchFacts = rawMatchFacts.map(parseMatchFact);

  if (
    !['recent_match', 'upcoming_match', 'current_news', 'limited_update'].includes(String(angleType))
    || !headline
    || !summary
    || !bullets
    || bullets.length < 2
    || bullets.length > 3
    || rawSources.length === 0
    || rawSources.length > 4
    || sources.some((source) => source === null)
    || rawEvidence.length === 0
    || evidence.some((claim) => claim === null)
    || matchFacts.some((fact) => fact === null)
  ) {
    fail('response_format', 'OpenAI response failed insight validation.');
  }

  return {
    angle_type: angleType as InsightAngle,
    headline,
    summary,
    bullets,
    sources: sources as GeneratedSource[],
    evidence: evidence as EvidenceClaim[],
    match_facts: matchFacts as MatchFact[],
  };
}

function expectedOutcome(teamScore: number, opponentScore: number): MatchFact['outcome'] {
  if (teamScore > opponentScore) return 'win';
  if (teamScore < opponentScore) return 'loss';
  return 'draw';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeClaimText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

function isClaimCoveredByCopy(claim: string, normalizedCopy: string): boolean {
  const normalizedClaim = normalizeClaimText(claim);
  if (normalizedCopy.includes(normalizedClaim)) return true;

  const claimTokens = new Set(normalizedClaim.split(' ').filter((token) => token.length > 2));
  if (claimTokens.size < 4) return false;

  const copyTokens = new Set(normalizedCopy.split(' '));
  let coveredTokens = 0;
  for (const token of claimTokens) {
    if (copyTokens.has(token)) coveredTokens += 1;
  }

  return coveredTokens >= 6 && coveredTokens / claimTokens.size >= 0.5;
}

function hasContradictoryOutcome(copy: string, fact: MatchFact): boolean {
  const team = escapeRegExp(fact.team);
  const contradiction = fact.outcome === 'win'
    ? '(?:loss|lost|defeat)'
    : fact.outcome === 'loss'
      ? '(?:win|won|victory|beat|defeated)'
      : '(?:win|won|victory|loss|lost|beat|defeated)';

  return new RegExp(`\\b${team}\\b[^.!?]{0,50}\\b${contradiction}\\b`, 'i').test(copy);
}

function validateEditorialCopy(insight: GeneratedWebInsight): void {
  if (insight.headline.length > 90 || insight.summary.length > 280) {
    fail('editorial', 'OpenAI response exceeded insight length limits.');
  }

  if (insight.bullets.some((bullet) => bullet.length > 150)) {
    fail('editorial', 'OpenAI response exceeded bullet length limits.');
  }

  const copy = [insight.headline, insight.summary, ...insight.bullets].join(' ');
  if (CAREER_RECAP_PATTERNS.some((pattern) => pattern.test(copy))) {
    fail('editorial', 'OpenAI response was a career-stat recap.');
  }

  if (GENERIC_PRAISE_PATTERNS.some((pattern) => pattern.test(copy))) {
    fail('editorial', 'OpenAI response was generic praise.');
  }

  const normalizedCopy = normalizeClaimText(copy);
  for (const evidence of insight.evidence) {
    if (!isClaimCoveredByCopy(evidence.claim, normalizedCopy)) {
      fail('editorial', 'OpenAI evidence claim was not present in the published copy.');
    }
  }

  if (insight.angle_type === 'recent_match' && insight.match_facts.length === 0) {
    fail('match_safety', 'Recent-match insight did not include normalized match facts.');
  }

  for (const fact of insight.match_facts) {
    if (fact.outcome !== expectedOutcome(fact.team_score, fact.opponent_score)) {
      fail('match_safety', 'OpenAI match outcome did not agree with the normalized score.');
    }
    if (hasContradictoryOutcome(copy, fact)) {
      fail('match_safety', 'OpenAI copy contradicted the normalized match outcome.');
    }
  }
}

function groundUrls(urls: string[], searchSources: Map<string, SearchSource>): void {
  for (const url of urls) {
    const canonicalUrl = canonicalizeSearchUrl(url);
    if (!canonicalUrl || !searchSources.has(canonicalUrl)) {
      fail(
        'source_grounding',
        `OpenAI response cited a URL that was not returned by web search: ${canonicalUrl ?? 'invalid URL'}`
      );
    }
  }
}

function groundSources(
  generatedSources: GeneratedSource[],
  searchSources: Map<string, SearchSource>
): AIInsightSource[] {
  const grounded = new Map<string, AIInsightSource>();

  for (const source of generatedSources) {
    const canonicalUrl = canonicalizeSearchUrl(source.url);
    const searched = canonicalUrl ? searchSources.get(canonicalUrl) : null;
    if (!canonicalUrl || !searched) {
      fail(
        'source_grounding',
        `OpenAI response cited a URL that was not returned by web search: ${canonicalUrl ?? 'invalid URL'}`
      );
    }

    if (!grounded.has(canonicalUrl)) {
      grounded.set(canonicalUrl, {
        title: searched.title || source.title,
        url: searched.url,
        source: sourceLabel(source.source, searched.url),
      });
    }
  }

  return [...grounded.values()];
}

export function parseAndValidateWebInsight(payload: unknown): ValidatedWebInsight {
  if (!isRecord(payload)) fail('response_format', 'OpenAI response payload was invalid.');
  const response = payload as OpenAIResponse;
  if (response.status === 'incomplete') {
    fail('response_format', 'OpenAI response was incomplete.');
  }
  const items = Array.isArray(response.output) ? response.output as OpenAIOutputItem[] : [];
  const usedWebSearch = items.some((item) => item.type === 'web_search_call' && item.status !== 'failed');

  if (!usedWebSearch) fail('search_required', 'OpenAI response did not use web search.');

  const searchSources = collectSearchSources(items);
  if (searchSources.size === 0) {
    fail('source_grounding', 'OpenAI web search returned no citeable sources.');
  }

  const text = extractOutputText(response, items);
  if (!text) fail('response_format', 'OpenAI response did not include text output.');

  const insight = parseGeneratedInsight(text);
  validateEditorialCopy(insight);

  for (const evidence of insight.evidence) groundUrls(evidence.source_urls, searchSources);
  for (const matchFact of insight.match_facts) groundUrls(matchFact.source_urls, searchSources);
  const sources = groundSources(insight.sources, searchSources);

  return {
    angleType: insight.angle_type,
    headline: insight.headline,
    summary: insight.summary,
    bullets: insight.bullets,
    sources,
  };
}
