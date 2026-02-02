import StatBox from './ui/StatBox';
import { TeamCareerStats } from '../lib/queries/getAllTimeTeamStats';
import { getTeamCrest, getTeamInitials } from './teamCrests';

const TITLE_COUNTS: Record<string, number> = {
  barcelona: 5,
  spain: 1,
};

function normalizeTeamName(name: string): string {
  return name.trim().toLowerCase();
}

type AllTimeCareerSectionProps = {
  barcelona: TeamCareerStats | null;
  spain: TeamCareerStats | null;
  loading: boolean;
  error?: string | null;
};

function TeamHeader({ name }: { name: string }) {
  const crest = getTeamCrest(name);
  const initials = getTeamInitials(name);

  return (
    <div className="flex items-center gap-3">
      {crest ? (
        <img src={crest} alt={`${name} crest`} className="h-8 w-8 object-contain" loading="lazy" />
      ) : (
        <div className="h-8 w-8 text-xs font-semibold text-white/70 grid place-items-center">
          {initials}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{name}</h3>
    </div>
  );
}

function TeamStatsCard({ stats }: { stats: TeamCareerStats }) {
  const titles = TITLE_COUNTS[normalizeTeamName(stats.team)] ?? 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <TeamHeader name={stats.team} />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatBox label="Games" value={stats.appearances} />
        <StatBox label="Goals" value={stats.goals} />
        <StatBox label="Assists" value={stats.assists} />
        <StatBox label="Dribbles" value={stats.dribbles} />
        <StatBox label="MOTM" value={stats.motm} />
        <StatBox label="Titles" value={titles} />
      </div>
    </div>
  );
}

export default function AllTimeCareerSection({
  barcelona,
  spain,
  loading,
  error,
}: AllTimeCareerSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">All time career numbers</h2>
        <p className="text-sm text-neutral-300/80">Club and international totals side by side.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-live="polite">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-[180px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-red-100">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {barcelona ? <TeamStatsCard stats={barcelona} /> : null}
          {spain ? <TeamStatsCard stats={spain} /> : null}
        </div>
      )}
    </section>
  );
}
