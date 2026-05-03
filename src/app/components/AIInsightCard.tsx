import { HomeInsightViewModel } from '../lib/ai-insights/getLatestHomeInsight';
import { RecentMatchRow } from '../lib/queries/getRecentMatches';
import { TeamCareerStats } from '../lib/queries/getAllTimeTeamStats';

type AIInsightCardProps = {
  insight: HomeInsightViewModel | null;
  recentMatches: RecentMatchRow[];
  careerStats: {
    barcelona: TeamCareerStats | null;
    spain: TeamCareerStats | null;
  };
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Update time unavailable';
  return `Updated ${DATE_TIME_FORMATTER.format(date)}`;
}

function buildFallbackBullets(
  recentMatches: RecentMatchRow[],
  careerStats: AIInsightCardProps['careerStats']
): string[] {
  const latestMatch = recentMatches[0];
  const barcelona = careerStats.barcelona;
  const spain = careerStats.spain;

  return [
    latestMatch
      ? `Latest logged match: ${latestMatch.team ?? 'Team'} vs ${latestMatch.opponent ?? 'opponent'} in ${latestMatch.competition ?? 'competition'} (${latestMatch.result_score ?? 'score unavailable'}).`
      : 'Recent match data is syncing, so this brief will update after the next successful cron run.',
    barcelona
      ? `Barcelona context is loaded; the AI brief will use it as background rather than repeating the site’s stat cards.`
      : 'Barcelona context is temporarily unavailable.',
    spain
      ? `Spain context is loaded for international framing when current news points that way.`
      : 'International context is temporarily unavailable.',
  ];
}

export default function AIInsightCard({ insight, recentMatches, careerStats }: AIInsightCardProps) {
  const fallbackBullets = buildFallbackBullets(recentMatches, careerStats);
  const isFallback = !insight;
  const headline = insight?.headline ?? 'Today around Yamal';
  const summary = insight?.summary
    ?? 'The scheduled AI brief is not available yet. Once the cron job runs, this space will focus on current news, last-match context, and what to watch next.';
  const bullets = insight?.bullets?.length ? insight.bullets : fallbackBullets;
  const freshnessLabel = insight
    ? insight.isStale ? 'Stale AI brief' : 'Fresh AI brief'
    : 'Stats fallback';

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300/80">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/85">
                AI Insight
              </span>
              <span className={insight?.isStale ? 'text-amber-200' : 'text-neutral-300/80'}>
                {freshnessLabel}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">
              {headline}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-200/80 md:text-base">
              {summary}
            </p>
          </div>

          <div className="w-fit rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs text-neutral-300/80">
            {insight ? formatUpdatedAt(insight.generated_at) : 'Live generation pending'}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-xl border border-white/10 bg-slate-950/25 p-4 text-sm leading-6 text-neutral-200/85">
              {bullet}
            </div>
          ))}
        </div>

        {!isFallback && insight.sources.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-neutral-300/80">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-200/70">
              Sources
            </span>
            {insight.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 transition hover:border-indigo-200/60 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                {source.source}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
