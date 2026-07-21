import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildWebInsightPrompt,
  generateValidatedWebInsight,
} from './generateHomeInsight.ts';

const SEARCH_URL = 'https://www.fifa.com/world-cup/spain-argentina-final';
const UNGROUNDED_URL = 'https://www.fcbarcelona.com/news/guessed-article';

function insight(sourceUrl: string) {
  const claim = 'Spain beat Argentina 1-0 to win the 2026 FIFA World Cup.';

  return {
    angle_type: 'recent_match',
    headline: 'Yamal becomes a world champion with Spain',
    summary: claim,
    bullets: [
      'Ferran Torres scored the extra-time winner in New Jersey.',
      'Yamal became one of the youngest World Cup final winners.',
    ],
    sources: [{
      title: 'Spain 1-0 Argentina: final report',
      url: sourceUrl,
      source: 'FIFA',
    }],
    evidence: [{ claim, source_urls: [sourceUrl] }],
    match_facts: [{
      team: 'Spain',
      opponent: 'Argentina',
      team_score: 1,
      opponent_score: 0,
      outcome: 'win',
      source_urls: [sourceUrl],
    }],
  };
}

function responsePayload(sourceUrl: string) {
  return {
    output: [
      {
        type: 'web_search_call',
        status: 'completed',
        action: {
          type: 'search',
          sources: [{
            type: 'url',
            title: 'Spain 1-0 Argentina: final report',
            url: SEARCH_URL,
          }],
        },
      },
      {
        type: 'message',
        status: 'completed',
        content: [{
          type: 'output_text',
          text: JSON.stringify(insight(sourceUrl)),
          annotations: [{
            type: 'url_citation',
            title: 'Spain 1-0 Argentina: final report',
            url: SEARCH_URL,
          }],
        }],
      },
    ],
  };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('retries a fresh web search after an ungrounded citation', async () => {
  const requestBodies: Array<Record<string, unknown>> = [];
  const responses = [
    jsonResponse(responsePayload(UNGROUNDED_URL)),
    jsonResponse(responsePayload(SEARCH_URL)),
  ];

  const fetchImpl: typeof fetch = async (_input, init) => {
    requestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const response = responses.shift();
    assert.ok(response);
    return response;
  };

  const result = await generateValidatedWebInsight({
    apiKey: 'test-key',
    fetchImpl,
    now: new Date('2026-07-20T00:00:00.000Z'),
  });

  assert.equal(result.attemptCount, 2);
  assert.equal(result.insight.angleType, 'recent_match');
  assert.equal(requestBodies.length, 2);

  const retryPrompt = String(requestBodies[1].input);
  assert.match(retryPrompt, /corrective retry/i);
  assert.match(retryPrompt, /exact URLs returned by this attempt's web search/i);
  assert.doesNotMatch(retryPrompt, new RegExp(UNGROUNDED_URL));
});

test('stops after two invalid grounded-source attempts', async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return jsonResponse(responsePayload(UNGROUNDED_URL));
  };

  await assert.rejects(
    generateValidatedWebInsight({
      apiKey: 'test-key',
      fetchImpl,
      now: new Date('2026-07-20T00:00:00.000Z'),
    }),
    /not returned by web search/
  );
  assert.equal(calls, 2);
});

test('does not retry an OpenAI HTTP failure', async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return jsonResponse({ error: 'provider unavailable' }, 500);
  };

  await assert.rejects(
    generateValidatedWebInsight({
      apiKey: 'test-key',
      fetchImpl,
      now: new Date('2026-07-20T00:00:00.000Z'),
    }),
    /OpenAI generation failed: 500/
  );
  assert.equal(calls, 1);
});

test('the normal prompt explicitly forbids guessed source URLs', () => {
  const prompt = buildWebInsightPrompt(new Date('2026-07-20T00:00:00.000Z'));
  assert.match(prompt, /Never guess, reconstruct, or manually type a source URL/i);
});
