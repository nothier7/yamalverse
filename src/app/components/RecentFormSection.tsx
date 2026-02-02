import { RecentMatchRow } from '../lib/queries/getRecentMatches';
import { getCompetitionInitials, getCompetitionLogo } from './competitionLogos';
import { getTeamCrest, getTeamInitials } from './teamCrests';

type RecentFormSectionProps = {
  matches: RecentMatchRow[];
  loading: boolean;
  error?: string | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

function formatShortDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return DATE_FORMATTER.format(parsed);
}

function parseScore(score: string | null | undefined): { teamScore: number; opponentScore: number } | null {
  if (!score) return null;
  const parts = score.match(/\d+/g);
  if (!parts || parts.length < 2) return null;
  return { teamScore: Number(parts[0]), opponentScore: Number(parts[1]) };
}

function getRatingDisplay(value: number | null): string {
  if (value === null) return '--';
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '');
}

function getRatingClass(value: number | null): string {
  if (value === 10) return 'bg-[#0D28F2]';
  if (value !== null && value >= 9) return 'bg-[#374DF5]';
  if (value !== null && value >= 8) return 'bg-[#00ADC4]';
  if (value !== null && value >= 7) return 'bg-[#00C424]';
  return 'bg-slate-700/80';
}

function normalizeScore(score: number | null | undefined): string {
  return typeof score === 'number' ? String(score) : '—';
}

function isSameTeam(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function EventIcon({ type }: { type: 'goal' | 'assist' | 'yellow' | 'red' }) {
  const base = 'h-4 w-4';
  const commonStyle = {
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain',
  } as const;

  switch (type) {
    case 'goal':
      return (
        <span
          className={`${base} bg-neutral-200`}
          style={{
            ...commonStyle,
            WebkitMaskImage: 'url(/goal.svg)',
            maskImage: 'url(/goal.svg)',
          }}
          role="img"
          aria-label="Goal"
        />
      );
    case 'assist':
      return (
        <span
          className={`${base} bg-neutral-200`}
          style={{
            ...commonStyle,
            WebkitMaskImage: 'url(/assist.svg)',
            maskImage: 'url(/assist.svg)',
          }}
          role="img"
          aria-label="Assist"
        />
      );
    case 'yellow':
      return (
        <span
          className={`${base} bg-yellow-400`}
          style={{
            ...commonStyle,
            WebkitMaskImage: 'url(/card.svg)',
            maskImage: 'url(/card.svg)',
          }}
          role="img"
          aria-label="Yellow card"
        />
      );
    case 'red':
      return (
        <span
          className={`${base} bg-red-500`}
          style={{
            ...commonStyle,
            WebkitMaskImage: 'url(/card.svg)',
            maskImage: 'url(/card.svg)',
          }}
          role="img"
          aria-label="Red card"
        />
      );
    default:
      return null;
  }
}

function EventIcons({
  goals,
  assists,
  yellowCards,
  redCards,
}: {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}) {
  const icons: Array<{ type: 'goal' | 'assist' | 'yellow' | 'red'; count: number }> = [
    { type: 'goal', count: goals },
    { type: 'assist', count: assists },
    { type: 'yellow', count: yellowCards },
    { type: 'red', count: redCards },
  ];

  return (
    <span className="flex items-center gap-1">
      {icons.flatMap(({ type, count }) =>
        Array.from({ length: Math.max(0, count) }).map((_, idx) => (
          <EventIcon key={`${type}-${idx}`} type={type} />
        ))
      )}
    </span>
  );
}

function TeamRow({
  teamName,
  score,
  showEvents,
  events,
}: {
  teamName: string;
  score: string;
  showEvents: boolean;
  events: { goals: number; assists: number; yellowCards: number; redCards: number };
}) {
  const crest = getTeamCrest(teamName);
  const initials = getTeamInitials(teamName);
  return (
    <div className="flex items-center gap-3">
      {crest ? (
        <img
          src={crest}
          alt={`${teamName} crest`}
          className="h-6 w-6 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="h-6 w-6 text-[9px] font-semibold text-white/70 grid place-items-center">
          {initials}
        </div>
      )}
      <span className="text-sm font-medium text-white">{teamName}</span>
      <span className="ml-auto flex items-center gap-2 text-sm font-semibold text-white">
        {showEvents ? (
          <EventIcons
            goals={events.goals}
            assists={events.assists}
            yellowCards={events.yellowCards}
            redCards={events.redCards}
          />
        ) : null}
        {score}
      </span>
    </div>
  );
}

function CompetitionBadge({ competition }: { competition: string | null }) {
  const logo = getCompetitionLogo(competition);
  const initials = getCompetitionInitials(competition);
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      {logo ? (
        <img
          src={logo}
          alt={`${competition ?? 'Competition'} logo`}
          className="h-6 w-6 object-contain"
          loading="lazy"
        />
      ) : (
        <span className="text-[9px] font-semibold text-white/70">{initials}</span>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: RecentMatchRow }) {
  const rawTeam = match.team ?? '';
  const rawOpponent = match.opponent ?? '';

  const parsedScore = parseScore(match.result_score);
  const teamScore = parsedScore?.teamScore ?? null;
  const opponentScore = parsedScore?.opponentScore ?? null;

  const homeTeam = rawTeam;
  const awayTeam = rawOpponent;
  const homeScore = teamScore;
  const awayScore = opponentScore;

  const ratingRaw = typeof match.rating === 'string' ? Number(match.rating) : match.rating;
  const ratingValue = Number.isFinite(ratingRaw) ? (ratingRaw as number) : null;

  const outcome = match.result_outcome ? match.result_outcome.toUpperCase() : null;
  const status = outcome && !['W', 'L', 'D'].includes(outcome) ? outcome : 'FT';

  const events = {
    goals: match.goals ?? 0,
    assists: match.assists ?? 0,
    yellowCards: match.yellow_cards ?? 0,
    redCards: match.red_cards ?? 0,
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="w-16 text-xs text-neutral-400 flex flex-col items-center">
        <CompetitionBadge competition={match.competition ?? null} />
        <div>{formatShortDate(match.date)}</div>
        <div className="mt-1 uppercase tracking-wide text-neutral-500">{status}</div>
      </div>
      <div className="flex-1 space-y-2">
        <TeamRow
          teamName={homeTeam || '—'}
          score={normalizeScore(homeScore)}
          showEvents={rawTeam ? isSameTeam(homeTeam, rawTeam) : false}
          events={events}
        />
        <TeamRow
          teamName={awayTeam || '—'}
          score={normalizeScore(awayScore)}
          showEvents={rawTeam ? isSameTeam(awayTeam, rawTeam) : false}
          events={events}
        />
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold text-white ${getRatingClass(
          ratingValue
        )}`}
        aria-label="Player rating"
      >
        {getRatingDisplay(ratingValue)}
      </div>
    </div>
  );
}

export default function RecentFormSection({ matches, loading, error }: RecentFormSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">Recent Form</h2>
        <p className="text-sm text-neutral-300/80">Lamine&apos;s last five appearances, at a glance.</p>
      </div>
      {loading ? (
        <div className="space-y-3" aria-live="polite">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-[76px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-red-100">{error}</div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-200/80">
          Recent fixtures will appear here once new matches are logged.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
