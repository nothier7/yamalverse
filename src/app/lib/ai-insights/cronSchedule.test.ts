import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the production insight cron runs exactly every eight hours', async () => {
  const config = JSON.parse(
    await readFile(new URL('../../../../vercel.json', import.meta.url), 'utf8')
  ) as {
    crons?: Array<{ path?: string; schedule?: string }>;
  };

  const insightCrons = (config.crons ?? []).filter(
    (cron) => cron.path === '/api/cron/generate-home-insight'
  );

  assert.deepEqual(insightCrons, [{
    path: '/api/cron/generate-home-insight',
    schedule: '0 */8 * * *',
  }]);
});
