import { HomeInsightViewModel } from '../lib/ai-insights/getLatestHomeInsight';

type AIInsightCardProps = {
  insight: HomeInsightViewModel | null;
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

const FALLBACK_BULLETS = [
  'A new web-grounded briefing will appear after the next successful scheduled run.',
  'Only current developments backed by clickable sources are published here.',
];

export default function AIInsightCard({ insight }: AIInsightCardProps) {
  const isFallback = !insight;
  const headline = insight?.headline ?? 'Today around Yamal';
  const summary = insight?.summary
    ?? 'The daily AI briefing is not available yet. It will focus on the most interesting verified story around Yamal—not repeat the stats below.';
  const bullets = insight?.bullets?.length ? insight.bullets : FALLBACK_BULLETS;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300/80">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/85">
                AI Insight
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">
              {headline}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-200/80 md:text-base">
              {summary}
            </p>
          </div>

          <div
            className={`w-fit rounded-full border px-3 py-1.5 text-xs ${
              insight?.isStale
                ? 'border-amber-300/25 bg-amber-300/10 text-amber-100/90'
                : 'border-white/10 bg-slate-950/40 text-neutral-300/80'
            }`}
          >
            {insight
              ? `${insight.isStale ? 'Refresh delayed · ' : ''}${formatUpdatedAt(insight.generated_at)}`
              : 'Generation pending'}
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
