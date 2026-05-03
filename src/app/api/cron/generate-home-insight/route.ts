import { NextResponse } from 'next/server';
import { generateAndStoreHomeInsight, storeHomeInsightError } from '../../../lib/ai-insights/generateHomeInsight';
import { buildHomeInsightContext } from '../../../lib/ai-insights/homeInsightContext';
import { ingestNews } from '../../../lib/ai-insights/ingestNews';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const ingestResult = await ingestNews();
    const context = await buildHomeInsightContext();
    const insight = await generateAndStoreHomeInsight(context);

    return NextResponse.json({
      ok: true,
      articleFetchCount: ingestResult.fetched,
      articleStoreCount: ingestResult.stored,
      ingestErrors: ingestResult.errors,
      insightId: insight.id,
      generatedAt: insight.generated_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AI insight cron failure.';
    await storeHomeInsightError(message).catch((storeError) => {
      console.error('Failed to store AI insight error:', storeError);
    });

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
