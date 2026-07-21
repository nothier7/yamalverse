import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('GitHub Actions is the only production insight scheduler and runs every eight hours', async () => {
  const config = JSON.parse(
    await readFile(new URL('../../../../vercel.json', import.meta.url), 'utf8')
  ) as {
    crons?: Array<{ path?: string; schedule?: string }>;
  };

  assert.equal(config.crons?.length ?? 0, 0);

  const workflow = await readFile(
    new URL('../../../../.github/workflows/refresh-ai-insight.yml', import.meta.url),
    'utf8'
  );

  assert.equal(workflow.match(/cron: '0 \*\/8 \* \* \*'/g)?.length, 1);
  assert.equal(
    workflow.match(/https:\/\/www\.yamalverse\.com\/api\/cron\/generate-home-insight/g)?.length,
    1
  );
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /secrets\.CRON_SECRET/);
});
