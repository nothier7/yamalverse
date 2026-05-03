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
      ? `Latest logged match: ${latestMatch.team ?? 'Team'} vs ${latestMatch.opponent ?? 'opponent'} in ${latestMatch.competition ?? 'competition'}, with ${latestMatch.goals ?? 0}G and ${latestMatch.assists ?? 0}A.`
      : 'Recent match data is syncing, so this brief is using career-level context.',
    barcelona
      ? `Barcelona totals: ${barcelona.appearances} apps, ${barcelona.goals} goals, ${barcelona.assists} assists, and ${barcelona.dribbles} successful dribbles.`
      : 'Barcelona career totals are temporarily unavailable.',
    spain
      ? `Spain totals: ${spain.appearances} apps, ${spain.goals} goals, ${spain.assists} assists, and ${spain.dribbles} successful dribbles.`
      : 'International career totals are temporarily unavailable.',
  ];
}

export default function AIInsightCard({ insight, recentMatches, careerStats }: AIInsightCardProps) {
  const fallbackBullets = buildFallbackBullets(recentMatches, careerStats);
  const isFallback = !insight;
  const headline = insight?.headline ?? 'Yamalverse matchday read';
  const summary = insight?.summary
    ?? 'The scheduled AI brief is not available yet, so this snapshot is grounded in the latest Yamalverse stats already loaded on the homepage.';
  const bullets = insight?.bullets?.length ? insight.bullets : fallbackBullets;
  const freshnessLabel = insight
    ? insight.isStale ? 'Stale AI brief' : 'Fresh AI brief'
    : 'Stats fallback';

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slate-950/70 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur md:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1">
                AI Insight
              </span>
              <span className={insight?.isStale ? 'text-amber-200' : 'text-emerald-200'}>
                {freshnessLabel}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              {headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/80">
              {summary}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100/80">
            {insight ? formatUpdatedAt(insight.generated_at) : 'Live generation pending'}
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 md:grid-cols-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-slate-100/85">
              {bullet}
            </div>
          ))}
        </div>

        {!isFallback && insight.sources.length > 0 && (
          <div className="relative mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300/80">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-200/70">
              Sources
            </span>
            {insight.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3 py-1 transition hover:border-cyan-200/60 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
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
