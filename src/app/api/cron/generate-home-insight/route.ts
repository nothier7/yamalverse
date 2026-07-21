import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { generateAndStoreHomeInsight, storeHomeInsightError } from '../../../lib/ai-insights/generateHomeInsight';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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
    const generation = await generateAndStoreHomeInsight();
    let revalidationError: string | null = null;

    try {
      revalidatePath('/');
    } catch (error) {
      revalidationError = error instanceof Error ? error.message : 'Homepage revalidation failed.';
      console.error('Failed to revalidate homepage after insight generation:', error);
    }

    return NextResponse.json({
      ok: true,
      insightId: generation.insight.id,
      generatedAt: generation.insight.generated_at,
      angleType: generation.angleType,
      sourceCount: generation.sourceCount,
      attemptCount: generation.attemptCount,
      revalidated: !revalidationError,
      revalidationError,
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
