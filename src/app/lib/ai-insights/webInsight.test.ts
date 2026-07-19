import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalizeSearchUrl, parseAndValidateWebInsight } from './webInsight.ts';

const SOURCE_URL = 'https://www.uefa.com/news/spain-france-report';

function responsePayload(
  insight: Record<string, unknown>,
  options: { includeSearch?: boolean; sourceUrl?: string } = {}
) {
  const sourceUrl = options.sourceUrl ?? SOURCE_URL;
  return {
    output: [
      ...(options.includeSearch === false ? [] : [{
        type: 'web_search_call',
        status: 'completed',
        action: {
          type: 'search',
          sources: [{
            type: 'url',
            title: 'Spain 2-0 France: match report',
            url: sourceUrl,
          }],
        },
      }]),
      {
        type: 'message',
        status: 'completed',
        content: [{
          type: 'output_text',
          text: JSON.stringify(insight),
          annotations: [{
            type: 'url_citation',
            title: 'Spain 2-0 France: match report',
            url: sourceUrl,
          }],
        }],
      },
    ],
  };
}

function validRecentMatchInsight(overrides: Record<string, unknown> = {}) {
  const claim = 'Spain beat France 2-0, with Yamal central to their progress.';
  return {
    angle_type: 'recent_match',
    headline: 'Spain move on after France win',
    summary: claim,
    bullets: [
      'The result sends Spain into their next knockout test.',
      'Yamal remains one of the key creative outlets in the side.',
    ],
    sources: [{
      title: 'Spain 2-0 France: match report',
      url: `${SOURCE_URL}?utm_source=openai`,
      source: 'UEFA',
    }],
    evidence: [{ claim, source_urls: [SOURCE_URL] }],
    match_facts: [{
      team: 'Spain',
      opponent: 'France',
      team_score: 2,
      opponent_score: 0,
      outcome: 'win',
      source_urls: [SOURCE_URL],
    }],
    ...overrides,
  };
}

test('canonicalizeSearchUrl removes tracking parameters and fragments', () => {
  assert.equal(
    canonicalizeSearchUrl(`${SOURCE_URL}/?utm_source=x&gclid=1#report`),
    SOURCE_URL
  );
});

test('accepts a cited post-match angle and grounds its source URL', () => {
  const result = parseAndValidateWebInsight(responsePayload(validRecentMatchInsight()));

  assert.equal(result.angleType, 'recent_match');
  assert.equal(result.summary, 'Spain beat France 2-0, with Yamal central to their progress.');
  assert.deepEqual(result.sources, [{
    title: 'Spain 2-0 France: match report',
    url: SOURCE_URL,
    source: 'UEFA',
  }]);
});

test('rejects Spain-France copy that reverses the normalized result', () => {
  const claim = 'Spain suffered a 2-0 loss to France despite Yamal starting.';
  const insight = validRecentMatchInsight({
    summary: claim,
    evidence: [{ claim, source_urls: [SOURCE_URL] }],
  });

  assert.throws(
    () => parseAndValidateWebInsight(responsePayload(insight)),
    /contradicted the normalized match outcome/
  );
});

test('rejects a declared source that web search did not return', () => {
  const otherUrl = 'https://example.com/unsupported';
  const insight = validRecentMatchInsight({
    sources: [{ title: 'Unsupported', url: otherUrl, source: 'Example' }],
  });

  assert.throws(
    () => parseAndValidateWebInsight(responsePayload(insight)),
    /not returned by web search/
  );
});

test('rejects output that did not use web search', () => {
  assert.throws(
    () => parseAndValidateWebInsight(responsePayload(validRecentMatchInsight(), { includeSearch: false })),
    /did not use web search/
  );
});

test('rejects a career-stat recap', () => {
  const claim = 'His career now stands at 100 appearances and 35 goals.';
  const insight = validRecentMatchInsight({
    angle_type: 'current_news',
    headline: 'Yamal career totals',
    summary: claim,
    evidence: [{ claim, source_urls: [SOURCE_URL] }],
    match_facts: [],
  });

  assert.throws(
    () => parseAndValidateWebInsight(responsePayload(insight)),
    /career-stat recap/
  );
});

test('accepts a cited upcoming milestone angle without completed-match facts', () => {
  const claim = 'Yamal is preparing for his first senior World Cup final.';
  const insight = validRecentMatchInsight({
    angle_type: 'upcoming_match',
    headline: 'A first World Cup final awaits',
    summary: claim,
    bullets: [
      'The final gives Yamal a new stage at senior international level.',
      'The occasion, rather than a career total, is the story to watch.',
    ],
    evidence: [{ claim, source_urls: [SOURCE_URL] }],
    match_facts: [],
  });

  const result = parseAndValidateWebInsight(responsePayload(insight));
  assert.equal(result.angleType, 'upcoming_match');
});

test('matches evidence claims after harmless trademark and punctuation normalization', () => {
  const publishedClaim = 'Spain and Argentina meet in the FIFA World Cup 2026 final today.';
  const evidenceClaim = 'Spain and Argentina meet in the FIFA World Cup 2026™ final today.';
  const insight = validRecentMatchInsight({
    angle_type: 'upcoming_match',
    headline: 'A final between Spain and Argentina',
    summary: publishedClaim,
    evidence: [{ claim: evidenceClaim, source_urls: [SOURCE_URL] }],
    match_facts: [],
  });

  const result = parseAndValidateWebInsight(responsePayload(insight));
  assert.equal(result.summary, publishedClaim);
});

test('accepts an evidence claim whose supported detail is shortened in the copy', () => {
  const publishedClaim = 'Spain are back in the World Cup final for the first time since 2010.';
  const evidenceClaim = 'Sunday will mark Spain\'s first World Cup final since they lifted the trophy in 2010.';
  const insight = validRecentMatchInsight({
    angle_type: 'upcoming_match',
    headline: 'Spain return to the World Cup final',
    summary: publishedClaim,
    evidence: [{ claim: evidenceClaim, source_urls: [SOURCE_URL] }],
    match_facts: [],
  });

  const result = parseAndValidateWebInsight(responsePayload(insight));
  assert.equal(result.summary, publishedClaim);
});

test('rejects evidence unrelated to the published copy', () => {
  const insight = validRecentMatchInsight({
    evidence: [{
      claim: 'An unrelated contract negotiation was reported in another country.',
      source_urls: [SOURCE_URL],
    }],
  });

  assert.throws(
    () => parseAndValidateWebInsight(responsePayload(insight)),
    /evidence claim was not present/
  );
});
